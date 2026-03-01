"""
open_assistant 后端入口

启动方式：
    开发：uvicorn app.main:app --reload --port 8765
    生产：由 Electron 主进程直接启动打包后的可执行文件
"""
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.api import chat, health, automation
from app.core.config import settings

# ─── 日志配置 ────────────────────────────────────────────────────────────────
logger.remove()
logger.add(
    sys.stderr,
    format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | {message}",
    level=settings.log_level,
)
logger.add(
    "logs/backend.log",
    rotation="10 MB",
    retention="7 days",
    level="DEBUG",
    encoding="utf-8",
)

# ─── FastAPI 应用 ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="OpenAssistant Backend",
    version="0.1.0",
    description="Windows 桌面 AI 助手后端 API",
    docs_url="/docs" if settings.debug else None,
    redoc_url=None,
)

# 允许 Electron 渲染进程跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── 路由注册 ─────────────────────────────────────────────────────────────────
app.include_router(health.router, tags=["健康检查"])
app.include_router(chat.router, prefix="/api", tags=["对话"])
app.include_router(automation.router, prefix="/api", tags=["自动化操作"])


@app.on_event("startup")
async def on_startup() -> None:
    logger.info(
        f"OpenAssistant 后端已启动，监听端口 {settings.port}，调试模式: {settings.debug}"
    )


@app.on_event("shutdown")
async def on_shutdown() -> None:
    logger.info("OpenAssistant 后端已关闭")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
