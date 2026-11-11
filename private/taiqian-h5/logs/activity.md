# 泰乾超级-qianrong H5 操作记录

## 2026-11-11｜work｜更正为 Flutter Web 仓库

- 用户确认目标为 `qianrong/h5`，从 Codeup 同步 `master/2fcdb27`，工作区干净。
- 按原项目规则保留 Git 跟踪的 `AGENTS.md`、`docs/`，私人规则和文档改用 `AGENTS.local.md`、`.local-docs/`。五项挂载经验证已被本机 Git 忽略。
- 配置 `mygithub`。经用户授权，GitHub 默认分支 `master` 已更新至 `2fcdb27`，核对远端只列出 `master`，无标签。

## 2026-11-11｜work｜首次接入与 GitHub 备份

- 核实独立仓库根目录，当前 `master` 与 Codeup `origin/master` 均为 `a6ef127`。
- 建立 `AGENTS.md`、`AI_CONTEXT.md`、`docs/`、`logs/`、`.codegraph/` 的私人挂载，验证业务 Git 不跟踪这些路径。首次接入仅预留 CodeGraph 挂载。
- 新增 `mygithub`，将 `master/a6ef127` 推送到 `duuu233/tq-plus-h5` 并核对远端提交。`origin/master` 继续作为 upstream。无业务源码改动或新增提交。
