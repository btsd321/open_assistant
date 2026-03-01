"""
AI 服务层

封装 OpenAI 兼容 API 的调用，支持流式输出与工具调用。
所有 AI 相关调用均通过此模块，不在路由层直接使用 SDK。
"""
from typing import AsyncGenerator

from loguru import logger
from openai import AsyncOpenAI
from openai.types.chat import ChatCompletionMessageParam

from app.core.config import settings


class AIService:
    def __init__(self) -> None:
        self._client = AsyncOpenAI(
            api_key=settings.openai_api_key or "placeholder",
            base_url=settings.openai_base_url,
        )
        # 简单的内存对话历史（生产环境可替换为 Redis 等持久化方案）
        self._history: list[ChatCompletionMessageParam] = []

    def _build_messages(self, user_content: str) -> list[ChatCompletionMessageParam]:
        """构建完整的消息列表（系统提示 + 历史 + 当前）"""
        messages: list[ChatCompletionMessageParam] = [
            {"role": "system", "content": settings.system_prompt}
        ]
        messages.extend(self._history[-20:])  # 保留最近 20 条
        messages.append({"role": "user", "content": user_content})
        return messages

    async def stream_chat(self, user_content: str) -> AsyncGenerator[str, None]:
        """
        流式对话，逐 token yield 字符串。

        Args:
            user_content: 用户输入文本

        Yields:
            每个 token 的文本片段
        """
        if not settings.openai_api_key:
            yield "⚠️ 请在设置中配置 OpenAI API Key。"
            return

        messages = self._build_messages(user_content)
        full_response = ""

        try:
            stream = await self._client.chat.completions.create(
                model=settings.openai_model,
                messages=messages,
                max_tokens=settings.openai_max_tokens,
                temperature=settings.openai_temperature,
                stream=True,
            )

            async for chunk in stream:
                delta = chunk.choices[0].delta
                if delta.content:
                    full_response += delta.content
                    yield delta.content

            # 将本次对话写入历史
            self._history.append({"role": "user", "content": user_content})
            self._history.append({"role": "assistant", "content": full_response})

        except Exception as e:
            logger.error(f"AI 流式请求失败: {e}")
            yield f"\n\n> ⚠️ 请求失败：{e}"

    async def chat(self, user_content: str) -> str:
        """
        非流式对话，返回完整回复。

        Args:
            user_content: 用户输入文本

        Returns:
            助手回复文本
        """
        result = ""
        async for chunk in self.stream_chat(user_content):
            result += chunk
        return result

    def clear_history(self) -> None:
        """清空对话历史"""
        self._history.clear()
        logger.info("对话历史已清空")
