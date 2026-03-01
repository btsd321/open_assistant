"""自动化操作相关 Pydantic 模型"""
from typing import Any

from pydantic import BaseModel, Field


class ClickRequest(BaseModel):
    """鼠标点击请求"""

    x: int = Field(..., ge=0, description="屏幕 X 坐标")
    y: int = Field(..., ge=0, description="屏幕 Y 坐标")
    button: str = Field("left", pattern="^(left|right|middle)$", description="鼠标按键")


class TypeTextRequest(BaseModel):
    """键盘输入请求"""

    text: str = Field(..., min_length=1, max_length=10000, description="要输入的文字")


class FindWindowRequest(BaseModel):
    """查找窗口请求"""

    title: str = Field(..., min_length=1, description="窗口标题关键词")


class AutomationResponse(BaseModel):
    """自动化操作通用响应"""

    success: bool = Field(..., description="操作是否成功")
    data: dict[str, Any] | None = Field(None, description="返回的数据")
    error: str | None = Field(None, description="错误信息")
