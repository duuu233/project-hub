# SSH新服务器接入相册APP

## 基础信息

- 日期：2026-10-22；执行环境：ssh（新服务器，Hub 在服务器内运行，`/home/cc/dh/project-hub`）；分支：main。
- 用户要求：`/home/cc/dh/` 下新增 flutter 项目，即【相册APP】，接入 Hub。
- Hub 开始工作区干净；显式 `git pull --ff-only origin main` 由 3f7a546 快进至 02e9881（他处正矿清报关附件记录），重读后再改。未切分支或修改 upstream。

## 身份核实（只读）

- 路径 `/home/cc/dh/flutter`：目录存在，`git rev-parse --show-toplevel` 即该目录。
- origin 为 `duuu233/flutter.git`，远端 HEAD 指向 main；Flutter 工程结构（`pubspec.yaml`、`lib/`、`android/`、`ios/`），含 `AGENTS.md`、`AI_CONTEXT.md`、`docs/`。work、home 两环境的 album-app 映射目录同为 flutter，因此复用已注册的 `album-app` 与原 Context，不新增公共记录。
- 当前分支 main / 78b8537，`git pull --ff-only origin main` 已是最新，工作区干净。接入只读取，未写入业务仓库。
- 仓库无 `.codegraph/`（`.gitignore` 已忽略），未初始化索引；无仓库级 `user.name` / `user.email`，作者来自服务器用户级配置。

## 改动清单

- `environments/ssh/projects.local.yaml`：新增 `album-app`（`transport: local`、`/home/cc/dh/flutter`、`default_branch: main`），头部说明同步。
- `environments/ssh/README.md`：状态、接入经过、当前映射表、本机工具状态（花盆APP、相册APP 的 Flutter 测试/构建暂不能跑，三仓均无索引）。
- `AGENTS.md`、`README.md`、`environments/README.md`、`docs/configuration.md`、私有目录 Symlink 方案：当前映射改为花盆APP、相册小程序、相册APP。
- 公共注册表 `projects.yaml`、`context/album-app.md`、work/home 映射均未改动。

## 验证

- PyYAML 解析 ssh 映射：3 项，ID 均在注册表内；路径存在、是 Git 根目录、origin 对应；映射只含 transport、path、default_branch，无凭据或主机地址。
- 本机仍未检出 `flutter`、`dart`、`node`、`codegraph`；`git diff --check` 通过。
