# Project Hub 私有项目资产库 (Private)

本大文件夹作为**所有具有私人需求项目的统一收拢处**。

任何业务项目如果有个人私有资产、非公开开发文档、私有 CodeGraph 索引、专属 AI 规则或私人需求流水，均在此大文件夹下**按项目 ID（project_id）建立独立子目录**进行物理隔离，支持未来按需无上限扩展。

---

## 目录组织与扩展规范

`	ext
private/
├── README.md                  # 本说明文件
├── minerals-admin/            # 正矿项目专属私有目录
│   ├── logs/                  # 正矿私人需求与业务改动流水（物理隔离）
│   ├── docs/                  # 正矿私人架构、领域模型、优化记录
│   ├── instructions/          # 正矿专有 AGENTS.md / AI_CONTEXT.md
│   └── .codegraph/            # 正矿 CodeGraph 索引数据库
│
└── <future-project-id>/       # 未来任何其他需要私人需求的项目（直接建目录扩展）
    ├── logs/                  # 该项目专属的私人需求留痕日志
    └── ...
`

---

## 核心原则

1. **统一收拢，按项目隔离**：所有私人需求资产统一保存在 private/<project_id>/ 下，彼此独立，不互相干扰，也不暴露给团队 Git。
2. **本地透明呈现（Symlink）**：业务项目通过 projects.yaml 的 private_mounts 配置将对应子目录/文件挂载为本地软链接（Windows Junction / SymbolicLink），供开发与 AI 工具直接读取。
3. **团队仓库零污染**：业务项目通过 .git/info/exclude 自动忽略挂载路径，保证团队 Git 始终保持干净。
4. **私人版本同步**：本目录下所有真实文件随 Project Hub 自身的私有 Git 仓库进行多端（公司/家里/SSH）统一同步管理。
