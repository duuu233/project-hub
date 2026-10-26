# 泰乾超级

- project_id：taiqian-front。
- 名称：泰乾超级（用户指定）；用途：泰乾德邦数字金融管理系统前端，包含 qianrong 和 qianlian 两个应用。
- 子应用「泰乾超级-qianrong」（用户也称「超级泰乾-qianrong」）指向仓库内 `apps/qianrong/`，复用本项目 ID、根目录 Git 分支及私人资料，不登记成独立 Git 仓库。
- 企业 Codeup 独立仓库，与正矿是不同的逻辑项目；各环境需自行具备远端访问权限。
- 路径只保存在各环境 projects.local.yaml，不因环境或目录变化创建重复项目。
- 已关联 home、work 与 ssh（2026-10-26），复用同一私人资料；ssh 副本 origin 为用户 GitHub 上的 tq-plus 仓库，历史与公司 front 仓库一致；work 使用用户确认的 front Git 根目录，packages 为最初指定的重点维护范围。应用需求仍按具体任务限定范围，不能把 qianrong 的业务代码带入共享包。

## 项目内文档入口

- `README.md`：项目身份、应用目录和开发命令。
- `apps/qianrong/README.md`：qianrong 应用文档。
- `apps/qianrong/LIST_PAGE_DEMO.md`：面向同事的列表使用说明；示例源码位于该应用 `src/examples/`。
- `apps/qianlian/README.md`：qianlian 应用文档。

按用户要求复用正矿的私人挂载方案：`AGENTS.md`、`AI_CONTEXT.md`、`docs/`、`logs/` 和 `.codegraph/` 由 `private/taiqian-front/` 维护，业务根目录仅挂载被本地 Git 忽略的链接。索引数据库是每台机器生成的派生文件，不提交。维护入口为 `docs/README.md`，qianrong 的实施约定由项目自己的私人文档维护。

**私人配置是硬要求（用户 2026-10-26 再次明确，所有环境一致）**：本项目和正矿一样属于私人项目，规则、文档、日志更新一律写进 `private/taiqian-front/`，不在业务仓库里生成；业务仓库只保留面向同事的源码与公开说明，并遵守 AGENTS.md 的信息隔离。

## 执行约定

每轮修改前核实工作区与仓库身份，同步当前本地分支的远端同名分支；用户明确指定分支时按其指令切换。远端默认分支为 master，仅作信息记录，不据此自动切换。完成后的提交、再 pull 和 push 遵循 AGENTS.md；具体实施与验证要求以项目自己的文档为准。
