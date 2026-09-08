# 当前迭代

状态：已完成并推送
日期：2026-09-08
环境：ssh（SSH 开发机，Hub 在服务器内部运行）

## 需求

1. 把当前 SSH 环境上的全部项目接入 Hub，并建立完整映射关系。
2. 各环境配置文件按 `home` / `work` / `ssh` 分目录存放，Hub 根目录不再堆放本机映射文件。目录名一律小写英文，Markdown 文件名可用中文。
3. 明确分支约定：同步、修改和提交都在仓库当前检出的分支上进行，没有特殊说明不切分支（例如正矿当前停在 `feature-v1.8.3`）。

## 分发与映射结果

本环境已扫描的项目父目录下共 6 个受管项目（Hub 自身不作为受管项目登记）：

| 项目名称 | project_id | 本环境目录名 | 身份依据 | 默认分支 |
| --- | --- | --- | --- | --- |
| 花盆APP | flowerpot-app | flowerpot | Flutter，YSplanter 智能花盆客户端 | main |
| 花盆后台 | flowerpot-admin | flowerpot-web | Vue3 后台，YSplanter/花盆 PC 管理后台 | main |
| 相册APP | album-app | flutter | Flutter，BoltStar 智能相框客户端 | main |
| 相册后台 | album-admin | web-ui-v2 | Vue3 后台，BoltFox PC 管理后台 | main |
| 相册小程序 | album-miniapp | photo-album | 微信小程序，BoltStar 相框客户端 | main |
| 正矿 | minerals-admin | minerals-frontend | Vue3 后台，README/package.json 标注“正矿管理系统” | master |

前 5 个为已有注册项目，本次只补本环境路径映射，复用原 ID 与 Context。第 6 个为新接入项目，新增公共注册记录与 `context/minerals-admin.md`。

## 同步记录

- project-hub：默认分支 main，`git pull --ff-only` 成功（Already up to date），同步后提交 c2226ef。
- 本轮只做接入与配置整理，未对任何被管理项目执行 pull 或写入；6 个仓库均只做只读身份核实。

## 实施与验证

Hub 内改动：

- 新增 `environments/`：`home/`、`work/`、`ssh/` 三个环境目录，`projects.local.example.yaml`（从根目录移入）和 `README.md`（环境判定规则）。
- 新增本机映射 `environments/ssh/projects.local.yaml`，6 个项目全部 `transport: local`（Hub 与项目同在服务器内）。该文件被 Git 忽略。
- `projects.yaml`：新增 `minerals-admin`；为全部 6 个项目补 `default_branch`（依据远端 HEAD 与本地跟踪分支核实）。
- 新增 `context/minerals-admin.md`；`AGENTS.md`、`README.md`、`docs/configuration.md` 同步新的环境目录布局。
- 修正 5 份已有 Context 的两处失实描述：`.codegraph/` 改为“本机产物，随环境而定”（本环境 6 个仓库均无索引目录）；默认分支改为已在共享配置中登记。
- `AGENTS.md` / `README.md` / `docs/configuration.md` / 6 份 Context 落实分支约定：工作分支 = 当前检出分支，`default_branch` 降级为“远端默认分支记录”，不作为自动切换目标；功能分支无 upstream 时不猜远端分支。
- `context/minerals-admin.md` 记录正矿的例外：私钥有口令，pull / commit / push 由用户自行完成；口令解除后可去掉该例外。

校验结果：

- 两份 YAML 解析通过，version 均为 1，无重复键；ID 均匹配 `^[a-z][a-z0-9-]*$`，name 唯一；context 文件全部存在。
- 6 个映射路径均存在且是对应仓库的 Git 根目录；本机映射无未知 ID。
- `git check-ignore environments/ssh/projects.local.yaml` 命中，`git ls-files` 未跟踪该文件；`git diff --check` 通过；共享文件未写入本机绝对路径、SSH 主机或凭据。
- 未执行任何项目的 lint / 测试 / 构建（本轮无代码改动）。

## 待确认与阻塞

- `minerals-admin` 的项目名称按用户指定改为「正矿」，ID 保持 `minerals-admin` 不变（改名不改 ID）。
- `minerals-admin`（正矿）走 Codeup 远端和单独的 SSH 身份，该私钥设了口令，Agent 非交互环境无法使用（`ls-remote` 被拒绝为 publickey）。按用户约定：pull / commit / push 由用户自行完成，Agent 只改动和验证。其余 5 个仓库远端可达，按通用约定执行。
- 本环境所有仓库都没有 `.codegraph/` 索引，定位代码时按项目自身方式检索；是否建索引由用户决定。
- `home` 与 `work` 目录当前为空占位，各自机器上再放入自己的 `projects.local.yaml`。

## 交付

按用户本次指令执行：Hub 改动已 commit 并 push 到 origin/main。工作约定本身未改动，后续仍按 AGENTS.md 由用户决定提交。被管理项目本轮无改动，未产生提交。
