# 贡献指南

感谢你对 open_assistant 的关注！欢迎以任何形式参与贡献。

## 目录

- [行为准则](#行为准则)
- [开发环境搭建](#开发环境搭建)
- [项目结构](#项目结构)
- [开发流程](#开发流程)
- [提交规范](#提交规范)
- [发起 Pull Request](#发起-pull-request)

---

## 行为准则

请保持友善、包容的交流态度。对事不对人，欢迎建设性的讨论与批评。

---

## 开发环境搭建

### 前置要求

| 工具 | 版本要求 |
|------|----------|
| Windows | 10 / 11 |
| Node.js | >= 20.x |
| Python | >= 3.11 |
| Git | >= 2.40 |

### 前端环境

```bash
cd frontend
npm install
npm run dev       # 启动 Electron + Vue 3 开发模式
```

### 后端环境

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8765
```

---

## 项目结构

```
open_assistant/
├── .github/                  # GitHub 工作流、模板、Copilot 指引
│   ├── ISSUE_TEMPLATE/
│   ├── workflows/
│   └── copilot-instructions.md
├── frontend/                 # Electron + Vue 3 前端
│   ├── src/
│   │   ├── main/             # Electron 主进程（窗口管理、托盘、IPC）
│   │   ├── preload/          # 预加载脚本（contextBridge）
│   │   └── renderer/         # Vue 3 渲染进程
│   │       ├── components/   # 通用组件
│   │       ├── views/        # 页面视图
│   │       ├── stores/       # Pinia 状态管理
│   │       ├── composables/  # 组合式函数
│   │       └── assets/       # 样式、图片
│   └── resources/            # 打包资源（图标、后端可执行文件）
├── backend/                  # Python + FastAPI 后端
│   ├── app/
│   │   ├── api/              # 路由层（routers）
│   │   ├── services/         # 业务逻辑（AI、自动化操作）
│   │   ├── models/           # Pydantic 数据模型
│   │   ├── core/             # 配置、依赖注入
│   │   └── utils/            # 工具函数
│   └── tests/                # pytest 测试
├── live2d/                   # Live2D 模型与动作资源
│   ├── models/               # .moc3 模型文件
│   └── motions/              # .motion3.json 动作文件
├── docs/                     # 项目文档
└── scripts/                  # 构建 / 部署脚本
```

---

## 开发流程

1. **Fork** 本仓库并 clone 到本地
2. 基于 `develop` 分支创建功能分支：
   ```bash
   git checkout develop
   git checkout -b feature/your-feature-name
   ```
3. 完成开发，确保本地 Lint / 测试通过
4. 推送分支并发起 PR，目标分支为 `develop`

### 分支策略

| 分支 | 说明 |
|------|------|
| `main` | 稳定发布版本，由 maintainer 合并 |
| `develop` | 开发主线，所有 PR 合入此处 |
| `feature/*` | 新功能开发 |
| `fix/*` | Bug 修复 |
| `hotfix/*` | 紧急生产修复，直接从 `main` 切出 |

---

## 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>(<scope>): <subject>
```

**scope 建议值：** `electron`、`vue`、`live2d`、`api`、`ai`、`automation`、`ws`、`docs`、`ci`

**示例：**
```
feat(live2d): 添加说话时的嘴部动画同步
fix(api): 修复 WebSocket 心跳超时断线问题
perf(automation): 优化截图操作的内存占用
```

---

## 发起 Pull Request

- PR 标题遵循 Conventional Commits 格式
- 填写 PR 模板中的所有必填项
- 确保 CI 全部通过后再请求 Review
- 每个 PR 只解决一个问题，保持小而专注

如有疑问，欢迎先开 Issue 讨论再动工。
