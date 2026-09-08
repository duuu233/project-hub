# Minerals Frontend 私人共享维护文档

本目录保存面向长期维护的项目知识，与 CodeGraph 配合使用。

## 文档定位

| 文档 | 内容 | 何时阅读 |
| --- | --- | --- |
| `AI_CONTEXT.md`（业务项目根目录 / Hub instructions/） | 项目快速上下文 | 每次开始任务 |
| [`architecture.md`](architecture.md) | 技术架构与关键数据流 | 修改入口、鉴权、路由、请求、Store、布局时 |
| [`domain-map.md`](domain-map.md) | 业务域与目录映射 | 定位业务代码、判断相邻模块时 |
| [`development.md`](development.md) | 开发环境、命令、实现约定 | 开发功能、调整构建、联调时 |
| [`maintenance.md`](maintenance.md) | 维护流程、高风险清单、排障 | 修复跨模块问题或进行重构时 |
| `AGENTS.md`（业务项目根目录 / Hub instructions/） | AI 协作规则 | AI 执行任何任务时 |

## 与 CodeGraph 的分工

CodeGraph 回答当前代码结构问题：

- 谁调用了某个函数。
- 某组件依赖哪些 API、Store 和子组件。
- 从登录到路由生成的真实调用链。
- 修改公共符号会影响哪些文件。

文档保存需要跨任务保留的稳定知识：

- 为什么某些链路风险高。
- 目录和业务域如何理解。
- 开发、验证和排障流程。
- 哪些约定必须同时维护。

文档不是 CodeGraph 的替代品。执行具体修改前仍要查询当前索引。

## 私人共享属性

`docs/`、`AGENTS.md`、`AI_CONTEXT.md` 和 `.codegraph/` 在团队项目内仅为本地链接，已被团队 Git 忽略；真实资料位于私人 Hub 的 `private/minerals-admin/`：

- 真实内容随私人 Hub Git 提交/push/pull，同一项目在 work、home、ssh 各自映射。不是实时共享磁盘。
- 不能用它们替代源码、配置和远端仓库。
- 每次改动都必须核对并更新本目录，切换电脑后先同步 Hub 和业务当前分支，恢复链接，再 `codegraph sync` 并根据当前源码核对文档。
- 文档中不得保存密码、Token、账号、客户数据或其他敏感信息。

## 更新原则

只记录已被以下至少一种方式确认的事实：

- 当前源码或配置。
- CodeGraph 符号、调用链和 blast radius。
- 实际运行的开发、类型检查或构建命令。

推测必须标记为“待确认”。临时任务进度、一次性日志和个人环境故障不应写入长期文档。

更新后至少检查：

```bash
git check-ignore -v -- AGENTS.md AI_CONTEXT.md docs
git status --short
```

这些链接应继续被团队 Git 忽略；真实文件的修改必须在 Hub 的 git status 中可见。提交数据库前停止 daemon 并 checkpoint，运行文件不提交。挂载与同步步骤见 Hub docs/private-mounts.md。
