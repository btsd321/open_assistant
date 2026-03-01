"""
应用配置（通过环境变量或 .env 文件加载）
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ─── 服务配置 ─────────────────────────────────────────────
    host: str = "127.0.0.1"
    port: int = 8765
    debug: bool = False
    log_level: str = "INFO"

    # ─── AI 配置 ──────────────────────────────────────────────
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4o-mini"
    openai_max_tokens: int = 2048
    openai_temperature: float = 0.7

    # ─── 系统提示词 ────────────────────────────────────────────
    system_prompt: str = (
        "你是 OpenAssistant，一个运行在 Windows 桌面的 AI 助手。"
        "你可以帮助用户回答问题，也可以通过工具调用操作电脑完成任务。"
        "回答时请保持简洁友好，使用中文。"
    )

    # ─── 自动化配置 ────────────────────────────────────────────
    screenshot_quality: int = 85  # JPEG 压缩质量
    mouse_move_duration: float = 0.3  # 鼠标移动动画时长（秒）


settings = Settings()
