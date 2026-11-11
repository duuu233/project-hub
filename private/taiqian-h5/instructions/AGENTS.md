# 泰乾超级-qianrong H5 协作规则

- 本仓库为 qianrong 的 Flutter Web 移动 H5。在仓库根目录检查状态、同步、提交和推送。开始前读取仓库 `AGENTS.md`、其指定的 Flutter 工具链技能、`AI_CONTEXT.md`、`.local-docs/README.md` 和相关维护文档。
- 所有环境只通过 GitHub 仓库 `duuu233/tq-plus-h5` 拉取和推送，使用用户在本机维护的配置。核实工作区干净后快进同步当前同名分支，提交后再次同步再推送。`master` 是默认分支。遇到未提交改动、分支缺失或分叉时停止并说明结果。
- 私人规则、文档、日志和 CodeGraph 索引按本地挂载管理，不随业务代码提交。有已建立的 `.codegraph/` 索引时先同步，再用它定位代码。索引数据库和运行产物只留本机。
- Flutter 开发和验证遵循项目锁定的 SDK 与 `tool/` 下的版本校验脚本。改动 H5 代码后使用校验脚本运行 `analyze`，构建命令以仓库 `README.md` 为准。技术决策和实施记录写入私人文档或日志。
