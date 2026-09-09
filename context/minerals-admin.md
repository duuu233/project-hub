# 正矿

- project_id：minerals-admin
- 用途：正矿管理系统 PC 端前端（依据仓库 README 与 package.json 核实）；对话中使用简称「正矿」。
- 项目名称在各环境中保持一致；本机路径只保存在对应环境的 projects.local.yaml。
- 代码托管与花盆 / 相册系列不在同一平台（企业 Codeup 仓库），使用不同的远端和 SSH 身份；各环境需自行具备该远端的访问权限后才能同步。

## 项目内上下文入口

以下路径在业务项目中均通过 `private_mounts` 软链接呈现，真实文件统一保存在 Project Hub 的 `private/minerals-admin/` 下：

- `README.md`：团队仓库源码，技术栈、环境要求与启动 / 构建命令。
- `docs/`：挂载自 `private/minerals-admin/docs/`，包含架构、优化记录、领域模型与维护说明，不随团队 Git 提交。
- `AGENTS.md`：挂载自 `private/minerals-admin/instructions/AGENTS.md`，执行任务前读取。
- `AI_CONTEXT.md`：挂载自 `private/minerals-admin/instructions/AI_CONTEXT.md`，执行任务前读取。
- `.codegraph/`：挂载自 `private/minerals-admin/.codegraph/`，包含 CodeGraph 索引数据库。
- 以上软链接均已在正矿项目 `.git/info/exclude` 中忽略，业务仓库 `git status` 保持干净。

Hub 只负责映射和分发，不维护本项目实现细节。每轮迭代先核实并读取项目已有的 `AGENTS.md`、`AI_CONTEXT.md`、`docs/README.md` 和任务相关维护文档；不存在时读取 `README.md` 及任务相关源码与配置。技术栈、架构、业务规则及验证方式均以项目自身文档和实际配置为准，相关维护也在本项目内完成。是否补建项目级上下文文档由用户决定，Hub 不代为创建。

## 执行约定

- 每轮需求先检查仓库状态，核实当前分支和 upstream，成功 pull 后再修改；详见 Hub 的 AGENTS.md。本项目按 Hub 通用约定执行，无例外。
- 共享配置记录的远端默认分支为 `master`（依据远端 HEAD 与本地跟踪分支核实），仅供参考。
- 本仓库常年在功能分支上迭代：同步、修改和提交都在仓库当前检出的分支上进行，没有特殊说明不切到 `master`。功能分支可能没有配置 upstream，此时用显式的 `<remote> <branch>` 同步和推送，先核实远端确有该分支。
- 接入仅核实目录、Git 根目录和上述入口存在，未修改项目源码，也未执行构建或测试。
- 任务完成并验证通过后，默认先同步当前分支再 push；功能分支没有 upstream 时用显式的 `<remote> <branch>`，先核实远端确有该分支，不擅自新建或改 upstream。本轮不提交或不推送时由用户明确说明。
- 当次需求与验证结果记录在 Hub 的 iterations 中，长期背景优先维护项目已有文档。
