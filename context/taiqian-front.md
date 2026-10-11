# 泰乾德邦数字金融管理系统

- project_id：taiqian-front。
- 项目名称与用途：泰乾德邦数字金融管理系统前端，依据根目录 README.md 与 package.json 核实；包含 qianrong 和 qianlian 两个应用。
- 企业 Codeup 独立仓库，与正矿是不同的逻辑项目；各环境需自行具备远端访问权限。
- 路径只保存在各环境 projects.local.yaml，不因环境或目录变化创建重复项目。

## 项目内文档入口

- `README.md`：项目身份、应用目录和开发命令。
- `apps/qianrong/README.md`：qianrong 应用文档。
- `apps/qianlian/README.md`：qianlian 应用文档。

接入核查时根目录没有 `AGENTS.md`、`AI_CONTEXT.md` 或 `.codegraph/`。每轮任务重新检查适用规则与文档入口；没有索引时不自动初始化。接入本身只读取仓库，不补建业务文档、不修改源码或安装依赖。

## 执行约定

每轮修改前核实工作区与仓库身份，同步当前本地分支的远端同名分支；用户明确指定分支时按其指令切换。远端默认分支为 master，仅作信息记录，不据此自动切换。完成后的提交、再 pull 和 push 遵循 AGENTS.md；具体实施与验证要求以项目自己的文档为准。
