# 开发模式启动脚本（Windows PowerShell）
# 同时启动前端 Electron 开发服务器和后端 FastAPI 服务

$ErrorActionPreference = "Stop"

Write-Host "==> 启动 OpenAssistant 开发环境" -ForegroundColor Cyan

# 检查虚拟环境
$venvPath = Join-Path $PSScriptRoot "..\backend\.venv\Scripts\Activate.ps1"
if (-not (Test-Path $venvPath)) {
    Write-Host "==> 创建 Python 虚拟环境..." -ForegroundColor Yellow
    python -m venv (Join-Path $PSScriptRoot "..\backend\.venv")
}

# 启动后端
Write-Host "==> 启动 Python 后端 (端口 8765)..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    param($root)
    Set-Location "$root\backend"
    & ".\.venv\Scripts\Activate.ps1"
    pip install -r requirements.txt -q
    uvicorn app.main:app --reload --port 8765
} -ArgumentList (Resolve-Path "$PSScriptRoot\..")

# 等待后端启动
Start-Sleep -Seconds 3

# 启动前端
Write-Host "==> 启动 Electron + Vue 3 前端..." -ForegroundColor Green
Set-Location (Join-Path $PSScriptRoot "..\frontend")
npm install
npm run dev
