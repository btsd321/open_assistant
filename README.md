# open_assistant

## 项目概述
一个windows端开源助手，能显示桌面图形动画，后端可使用ai操作电脑执行一些简单的工作流

## 主要依赖的技术栈
UI/动画	Electron + Vue 3 / React	窗口 UI，透明无边框窗口
卡通动画	Live2D Cubism Web SDK	2D 角色骨骼动画，主流虚拟助手方案
AI 后端	Python + FastAPI	与 OpenAI/兼容 API 对接
电脑操作	Python pyautogui / pywin32 / uiautomation	模拟鼠标键盘、读取窗口、自动化任务
通信	HTTP / WebSocket	Electron ↔ Python 本地通信

## 项目结构

```
open_assistant/
├── .github/                  # GitHub 工作流、社区模板、Copilot 指引
│   ├── ISSUE_TEMPLATE/       # Bug / Feature / Question 模板
│   ├── workflows/            # CI（Lint + Test）& Release 自动化
│   ├── CONTRIBUTING.md       # 贡献指南
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── copilot-instructions.md  # GitHub Copilot 自定义指令
├── frontend/                 # Electron + Vue 3 前端
│   ├── src/
│   │   ├── main/             # Electron 主进程（窗口管理、托盘、IPC）
│   │   ├── preload/          # 预加载脚本（contextBridge）
│   │   └── renderer/         # Vue 3 渲染进程
│   │       ├── components/   # 通用 UI 组件
│   │       ├── views/        # 页面视图
│   │       ├── stores/       # Pinia 状态管理
│   │       ├── composables/  # 组合式函数（useChat、useLive2D…）
│   │       └── assets/       # 样式、图片
│   └── resources/            # 打包资源（应用图标、后端可执行文件）
├── backend/                  # Python + FastAPI 后端
│   ├── app/
│   │   ├── api/              # 路由层（chat、automation、health…）
│   │   ├── services/         # 业务逻辑（ai_service、automation_service）
│   │   ├── models/           # Pydantic 数据模型
│   │   ├── core/             # 配置（Settings）、依赖注入
│   │   └── utils/            # 工具函数
│   └── tests/                # pytest 单元 / 集成测试
├── live2d/                   # Live2D 模型与动作资源
│   ├── models/               # .moc3 模型文件（按角色分目录）
│   └── motions/              # .motion3.json 动作文件
├── docs/                     # 项目文档（架构图、API 文档等）
├── scripts/                  # 构建 / 打包 / 部署脚本
└── README.md
```

---

## 代码规范
### 通用规范

- 缩进统一使用 **2 空格**（JS/TS/Vue）或 **4 空格**（Python）
- 文件编码统一 **UTF-8**，换行符统一 **LF**
- 所有代码提交前须通过 Lint 检查，禁止提交带有 warning 的代码
- 禁止提交调试代码（`console.log`、`print` 调试语句等）

---

### 前端规范（Electron + Vue 3 / React）

**命名规范**
- 组件文件名：`PascalCase`，如 `AssistantWindow.vue`
- 变量/函数：`camelCase`，如 `getUserInfo()`
- 常量：`UPPER_SNAKE_CASE`，如 `MAX_RETRY_COUNT`
- CSS 类名：`kebab-case`，如 `.chat-bubble`

**Vue 3 规范**
- 统一使用 `<script setup>` + Composition API
- Props 必须声明类型，使用 `defineProps<{...}>()`
- 禁止在模板中写复杂逻辑，抽取为 `computed` 或函数
- 组件内部状态用 `ref` / `reactive`，跨组件状态用 Pinia

**代码风格**
- 使用 **ESLint** + **Prettier** 统一格式化
- 推荐配置：`eslint-config-vue3`，单引号，无分号
- 异步操作统一使用 `async/await`，禁止混用 `.then()` 链式调用

---

### 后端规范（Python + FastAPI）

**命名规范**
- 模块/文件名：`snake_case`，如 `ai_service.py`
- 类名：`PascalCase`，如 `ChatSession`
- 函数/变量：`snake_case`，如 `get_response()`
- 常量：`UPPER_SNAKE_CASE`，如 `API_TIMEOUT`

**FastAPI 规范**
- 路由函数必须添加类型注解和 docstring
- 请求/响应体使用 `Pydantic` 模型定义，禁止直接使用 `dict`
- 异步路由使用 `async def`，同步阻塞操作放入线程池（`run_in_executor`）
- 统一使用 `HTTPException` 返回错误，包含清晰的 `detail` 信息

**代码风格**
- 使用 **Black** 格式化，**isort** 整理导入，**Flake8** 检查
- 行长度限制 **88** 字符（Black 默认）
- 所有公共函数须有类型注解（Type Hints）

---

### Git 提交规范（Conventional Commits）

```
<type>(<scope>): <subject>

type 可选值：
  feat     新功能
  fix      修复 bug
  docs     文档变更
  style    代码格式（不影响逻辑）
  refactor 重构
  perf     性能优化
  test     测试相关
  chore    构建/工具链变更
```

示例：
```
feat(live2d): 添加角色眨眼动画
fix(api): 修复 WebSocket 断线重连失败问题
docs(readme): 更新环境配置说明
```