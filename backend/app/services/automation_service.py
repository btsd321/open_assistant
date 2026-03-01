"""
电脑自动化操作服务

封装 pyautogui / pywin32 / uiautomation 的操作，
所有阻塞型 API 均通过 asyncio.run_in_executor 异步化。
"""
import asyncio
import io
from typing import Any

from loguru import logger

from app.core.config import settings


class AutomationService:
    def __init__(self) -> None:
        self._loop = asyncio.get_event_loop()

    def _run_sync(self, func, *args):
        """将同步阻塞函数提交到线程池执行"""
        return self._loop.run_in_executor(None, func, *args)

    # ─── 截图 ─────────────────────────────────────────────────────────────────

    async def take_screenshot(self) -> bytes:
        """
        截取当前屏幕。

        Returns:
            JPEG 格式的图像字节数据
        """
        def _capture() -> bytes:
            import pyautogui
            from PIL import Image

            screenshot: Image.Image = pyautogui.screenshot()
            buf = io.BytesIO()
            screenshot.save(buf, format="JPEG", quality=settings.screenshot_quality)
            return buf.getvalue()

        logger.debug("执行截图")
        return await self._run_sync(_capture)

    # ─── 鼠标操作 ─────────────────────────────────────────────────────────────

    async def click(self, x: int, y: int, button: str = "left") -> None:
        """
        模拟鼠标点击。

        Args:
            x: 屏幕 X 坐标
            y: 屏幕 Y 坐标
            button: 按键类型 "left" / "right" / "middle"
        """
        def _click() -> None:
            import pyautogui
            pyautogui.moveTo(x, y, duration=settings.mouse_move_duration)
            pyautogui.click(button=button)

        logger.debug(f"点击坐标 ({x}, {y}) button={button}")
        await self._run_sync(_click)

    async def double_click(self, x: int, y: int) -> None:
        """模拟鼠标双击"""
        def _double_click() -> None:
            import pyautogui
            pyautogui.moveTo(x, y, duration=settings.mouse_move_duration)
            pyautogui.doubleClick()

        await self._run_sync(_double_click)

    # ─── 键盘操作 ─────────────────────────────────────────────────────────────

    async def type_text(self, text: str) -> None:
        """
        模拟键盘输入文字（支持中文）。

        Args:
            text: 要输入的文字
        """
        def _type() -> None:
            import pyautogui
            # pyautogui 不支持直接输入中文，使用剪贴板中转
            import win32clipboard
            win32clipboard.OpenClipboard()
            win32clipboard.EmptyClipboard()
            win32clipboard.SetClipboardText(text, win32clipboard.CF_UNICODETEXT)
            win32clipboard.CloseClipboard()
            pyautogui.hotkey("ctrl", "v")

        logger.debug(f"输入文字: {text[:30]}...")
        await self._run_sync(_type)

    async def press_key(self, *keys: str) -> None:
        """
        模拟按键（支持组合键）。

        Args:
            keys: 按键名称，如 ("ctrl", "c") 或 ("enter",)
        """
        def _press() -> None:
            import pyautogui
            if len(keys) == 1:
                pyautogui.press(keys[0])
            else:
                pyautogui.hotkey(*keys)

        await self._run_sync(_press)

    # ─── 窗口操作 ─────────────────────────────────────────────────────────────

    async def find_window(self, title: str) -> dict[str, Any]:
        """
        通过标题查找窗口。

        Args:
            title: 窗口标题（支持模糊匹配）

        Returns:
            包含窗口信息的字典 {hwnd, title, x, y, width, height}
        """
        def _find() -> dict[str, Any]:
            import win32gui

            results = []

            def enum_callback(hwnd, _):
                if not win32gui.IsWindowVisible(hwnd):
                    return
                win_title = win32gui.GetWindowText(hwnd)
                if title.lower() in win_title.lower():
                    rect = win32gui.GetWindowRect(hwnd)
                    results.append({
                        "hwnd": hwnd,
                        "title": win_title,
                        "x": rect[0],
                        "y": rect[1],
                        "width": rect[2] - rect[0],
                        "height": rect[3] - rect[1],
                    })

            win32gui.EnumWindows(enum_callback, None)
            return {"windows": results}

        logger.debug(f"查找窗口: {title}")
        return await self._run_sync(_find)

    async def activate_window(self, hwnd: int) -> None:
        """激活并置顶指定窗口"""
        def _activate() -> None:
            import win32gui
            win32gui.SetForegroundWindow(hwnd)

        await self._run_sync(_activate)
