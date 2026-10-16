# 2026-10-15 home 七项目代码同步

- 用户明确本次环境为 home；依据公共注册表、home 映射和各项目规则执行。
- 七业务项目及 Project Hub 均通过路径、Git 根目录、origin 身份、当前分支和工作区核验；初始工作区全部干净，没有使用 stash，也没有修改或清理用户文件。
- 每个仓库先核实远端同名分支存在，再显式执行 `git pull --ff-only origin <当前本地分支>`。没有切换分支、设置 upstream，或将默认分支合并到工作分支。
- Project Hub 当前 main 从 852a1f9 快进到 9821e5e，共 9 个提交；更新的配置、规则与相关项目上下文已复核。

## 业务仓库结果

| 项目 | 当前分支 | 起始提交 | 拉取后提交 | 同步结果 |
| --- | --- | --- | --- | --- |
| taiqian-front（泰乾超级） | master | 3904c7a | a61445b | 快进 4 个提交 |
| minerals-admin（正矿） | feature-v1.8.5 | c9d0157 | c9d0157 | 已为最新 |
| flowerpot-app（花盆APP） | main | aaf3f2b | a14ccaf | 快进 7 个提交 |
| flowerpot-admin（花盆后台） | main | 9de6aa9 | 9de6aa9 | 已为最新 |
| album-app（相册APP） | main | e96eb30 | e96eb30 | 已为最新 |
| album-admin（相册后台） | main | 322e960 | 322e960 | 已为最新 |
| album-miniapp（相册小程序） | main | 118ff7e | 118ff7e | 已为最新 |

## 验证

- 七业务仓库最终均再次执行 ls-remote，实际远端同名分支与本地 HEAD 一致，工作区干净。
- 正矿没有 upstream，仍按既有规则显式拉取 origin/feature-v1.8.5，没有设置分支关联。
- 六个已有 CodeGraph 索引 sync/status 成功且最新；泰乾同步 285 个变化文件，花盆APP同步 60 个变化文件，其余四个已有索引无需更新。花盆后台无 .codegraph，未初始化。
- 泰乾与正矿的 home 挂载 dry-run 均通过，十项既有挂载正常；未更改链接或业务仓库忽略配置。
- 本轮只做代码同步、索引刷新和统筹留痕，未手工修改业务源码，未执行依赖安装、构建、业务测试、真实接口、真机或部署验证。
- qianrong 对接仍维持此前暂停状态，没有继续实现任务。其远端删除旧示例等变更按当前分支原样同步，不恢复旧文件。

## 记录交付

本轮只在 Project Hub 追加当前迭代、自身流水、跨项目流水与本记录，保留全部历史和未完成迭代，不改项目身份或环境映射。记录在当前 main 提交后按约定再次显式 pull 同名分支并 push。
