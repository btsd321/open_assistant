# 生产构建脚本（Windows PowerShell）
# 依次构建 Python 后端和 Electron 前端，生成可分发安装包

$ErrorActionPreference = "Stop"
$Root = Resolve-Path "$PSScriptRoot\.."

Write-Host "==> OpenAssistant 生产构建" -ForegroundColor Cyan

# ─── 步骤 1：安装后端依赖 + PyInstaller 打包 ──────────────────
Write-Host "`n[1/3] 打包 Python 后端..." -ForegroundColor Yellow
Set-Location "$Root\backend"

if (-not (Test-Path ".venv")) {
    python -m venv .venv
}
& ".\.venv\Scripts\Activate.ps1"
pip install -r requirements.txt -q
pip install pyinstaller -q

pyinstaller `
    --onefile `
    --name open_assistant_backend `
    --distpath "$Root\frontend\resources\backend" `
    --workpath "$Root\backend\build" `
    --specpath "$Root\backend" `
    --hidden-import=uvicorn.logging `
    --hidden-import=uvicorn.loops.auto `
    --hidden-import=uvicorn.protocols.http.auto `
    app/main.py

Write-Host "后端打包完成: frontend\resources\backend\open_assistant_backend.exe" -ForegroundColor Green

# ─── 步骤 2：前端依赖安装 + 构建 ──────────────────────────────
Write-Host "`n[2/3] 构建 Electron 前端..." -ForegroundColor Yellow
Set-Location "$Root\frontend"
npm ci
npm run build

# ─── 步骤 3：electron-builder 打包 ────────────────────────────
Write-Host "`n[3/3] 打包 Electron 安装包..." -ForegroundColor Yellow
npm run build:electron

Write-Host "`n✅ 构建完成！安装包位于 frontend/dist/" -ForegroundColor Cyan
