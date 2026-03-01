"""
对话 API 路由

提供：
- WebSocket /ws/chat  流式对话（主要通道）
- POST /api/chat      普通 HTTP 对话（备用）
"""
import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from loguru import logger

from app.models.chat import ChatRequest, ChatResponse
from app.services.ai_service import AIService

router = APIRouter()
ai_service = AIService()


@router.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket) -> None:
    """
    WebSocket 流式对话端点。

    消息格式（客户端 → 服务端）：
        {"role": "user", "content": "用户消息"}

    响应格式（服务端 → 客户端）：
        - 每个 token：纯文本字符串
        - 结束：字符串 "[DONE]"
        - 错误：字符串 "[ERROR] 错误信息"
    """
    await websocket.accept()
    logger.info("WebSocket 客户端已连接")

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                payload = json.loads(raw)
                content: str = payload.get("content", "").strip()
                if not content:
                    continue

                logger.debug(f"收到消息: {content[:50]}...")

                async for chunk in ai_service.stream_chat(content):
                    await websocket.send_text(chunk)

                await websocket.send_text("[DONE]")

            except json.JSONDecodeError:
                await websocket.send_text("[ERROR] 无效的消息格式")
            except Exception as e:
                logger.error(f"对话处理失败: {e}")
                await websocket.send_text(f"[ERROR] {e}")

    except WebSocketDisconnect:
        logger.info("WebSocket 客户端已断开")


@router.post("/chat", response_model=ChatResponse)
async def chat_http(request: ChatRequest) -> ChatResponse:
    """
    HTTP 普通对话接口（非流式，供测试使用）。
    """
    result = await ai_service.chat(request.content)
    return ChatResponse(content=result)
