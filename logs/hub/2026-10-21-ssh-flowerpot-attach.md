# SSH新服务器接入花盆APP

## 基础信息

- 日期：2026-10-21；执行环境：ssh（新服务器，Hub 在服务器内运行，`/home/cc/dh/project-hub`）；分支：main。
- 用户要求：当前是 ssh 环境，接入 flowerpot 项目；目前 SSH 上只有这一个项目，其他后续再说。
- Hub 开始工作区干净；核实 origin 及远端同名 main 后执行 `git pull --ff-only origin main`，由 c42c867 快进至 80a6d09（含旧 SSH 映射作废、等待接入的提交），随后重读变化的规则与环境文档。未切分支或修改 upstream。

## 身份核实（只读）

- 路径 `/home/cc/dh/flowerpot`：目录存在，`git rev-parse --show-toplevel` 即该目录。
- origin 为 `duuu233/flowerpot.git`，远端 HEAD 指向 main；README 为 Flutter 智能花盆客户端，含 `AGENTS.md`、`AI_CONTEXT.md`、`docs/`，与已注册的「花盆APP」（`flowerpot-app`，其他环境目录名同为 flowerpot）一致，复用原 ID 与 Context，不新增公共记录。
- 当前分支 main / 2cbf14a，与 origin/main 一致，工作区干净。接入只读取，未 pull、未写入业务仓库。
- 仓库无 `.codegraph/`（`.gitignore` 已忽略该目录），未初始化索引。

## 可写边界

按规则新服务器须重新明确可写范围。用户本次确认：**只许写 `/home/cc/dh/`**，目录外只读；临时产物写 `/home/cc/dh/project-hub/.codex-tmp/`。已写入 `AGENTS.md` 与 `environments/ssh/README.md`。

## 改动清单

- `environments/ssh/projects.local.yaml`：由空 `paths: {}` 改为只映射 `flowerpot-app`（`transport: local`、`/home/cc/dh/flowerpot`、`default_branch: main`）。
- `environments/ssh/README.md`：状态改为新服务器已接入，记录当前映射、可写边界和本机工具状态。
- `AGENTS.md`：SSH 段由「等待接入」改为新服务器可写边界规则。
- `README.md`、`environments/README.md`、`docs/configuration.md`（SSH 状态与正矿挂载表）、`environments/projects.local.example.yaml`、私有目录 Symlink 方案：同步 SSH 状态。
- `logs/solutions/pdf-text-extract-without-poppler.md`、`private/minerals-admin/docs/development.md`：把「等待接入」改为新服务器现状（未检出 node / 未映射正矿）。
- 公共注册表 `projects.yaml`、`context/flowerpot-app.md`、work/home 映射均未改动。

## 本机工具

接入时未检出 `flutter`、`dart`、`node`、`codegraph`，有 `python3`（PyYAML 6.0）。因此本机暂不能跑花盆APP 的 Flutter 测试/构建，也不能运行 `scripts/setup-links.mjs`；是否安装由用户决定。

## 验证

- 用 python3 + PyYAML 解析公共注册表与三份环境映射：版本均为 1，environment 与目录名一致；ssh 1 项、work 7 项、home 7 项，ID 均在注册表内，context 文件存在。
- ssh 映射路径存在、是 Git 根目录、origin 对应花盆APP；映射内容只有路径、transport 与 default_branch，无凭据或主机地址。
- 有效文档中不再残留 SSH「等待接入」表述；`git diff --check` 通过。
- 未运行业务构建或测试（本轮无业务代码改动）。
