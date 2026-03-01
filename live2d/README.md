# Live2D 模型目录

## 目录规范

```
live2d/
├── models/
│   └── <model-name>/
│       ├── <model-name>.model3.json   # 模型入口文件
│       ├── <model-name>.moc3          # 模型数据（二进制，通过 Git LFS 管理）
│       ├── <model-name>.physics3.json # 物理参数（可选）
│       ├── <model-name>.cdi3.json     # 参数/部件显示信息（可选）
│       ├── textures/                  # 贴图（.png，通过 Git LFS 管理）
│       └── motions/                   # 动作文件（.motion3.json）
└── motions/                           # 公共动作（如有）
```

## 动作组约定

| 动作组名 | 触发时机 |
|----------|----------|
| `Idle` | 空闲待机循环 |
| `TapBody` | 点击角色身体 |
| `TapHead` | 点击角色头部 |
| `FlickHead` | 快速甩头 |

## 获取模型

可从以下途径获取 Live2D 模型：
- [Live2D 官方示例模型](https://www.live2d.com/download/sample-data/)（免费用于学习）
- 自行使用 Live2D Cubism Editor 创建

> ⚠️ 注意：请确认模型的使用授权，商业用途需获得相应许可。
