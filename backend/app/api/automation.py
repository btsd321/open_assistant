"""
电脑自动化操作 API 路由
"""
import base64

from fastapi import APIRouter, HTTPException
from loguru import logger

from app.models.automation import (
    ClickRequest,
    TypeTextRequest,
    FindWindowRequest,
    AutomationResponse,
)
from app.services.automation_service import AutomationService

router = APIRouter()
automation = AutomationService()


@router.post("/automation/screenshot", response_model=AutomationResponse)
async def take_screenshot() -> AutomationResponse:
    """截取当前屏幕，返回 Base64 编码的 JPEG 图像"""
    try:
        img_bytes = await automation.take_screenshot()
        b64 = base64.b64encode(img_bytes).decode()
        return AutomationResponse(success=True, data={"image": b64})
    except Exception as e:
        logger.error(f"截图失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/automation/click", response_model=AutomationResponse)
async def click(request: ClickRequest) -> AutomationResponse:
    """模拟鼠标点击指定坐标"""
    try:
        await automation.click(request.x, request.y, request.button)
        return AutomationResponse(success=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/automation/type", response_model=AutomationResponse)
async def type_text(request: TypeTextRequest) -> AutomationResponse:
    """模拟键盘输入文字"""
    try:
        await automation.type_text(request.text)
        return AutomationResponse(success=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/automation/find-window", response_model=AutomationResponse)
async def find_window(request: FindWindowRequest) -> AutomationResponse:
    """查找指定标题的窗口"""
    try:
        info = await automation.find_window(request.title)
        return AutomationResponse(success=True, data=info)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
