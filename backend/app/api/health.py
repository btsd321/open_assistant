from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/health")
async def health_check() -> JSONResponse:
    """后端健康检查接口，供 Electron 主进程轮询确认后端就绪"""
    return JSONResponse({"status": "ok", "service": "open_assistant_backend"})
