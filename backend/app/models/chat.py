"""对话相关 Pydantic 模型"""
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """HTTP 对话请求体"""

    content: str = Field(..., min_length=1, max_length=4096, description="用户消息内容")


class ChatResponse(BaseModel):
    """HTTP 对话响应体"""

    content: str = Field(..., description="助手回复内容")
