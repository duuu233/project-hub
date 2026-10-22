# SSH新服务器接入相册小程序

## 基础信息

- 日期：2026-10-22；执行环境：ssh（新服务器，Hub 在服务器内运行，`/home/cc/dh/project-hub`）；分支：main。
- 用户要求：当前是 ssh 环境，`/home/cc/dh/` 下新引入了 photo-album，即相册小程序，纳入 Hub 同步管理。
- Hub 开始工作区干净；核实 origin 及远端同名 main 后执行 `git pull --ff-only origin main`，由 f870623 快进至 3a64f28（他处正矿交付记录、文档改名与 work 分叉合并），重读变化的文档后再改。未切分支或修改 upstream。

## 身份核实（只读）

- 路径 `/home/cc/dh/photo-album`：目录存在，`git rev-parse --show-toplevel` 即该目录。
- origin 为 `duuu233/photo-album.git`，远端 HEAD 指向 main；根目录为微信小程序结构（`app.json`、`project.config.json`、`pages/`、`subpackages/`），含 `AGENTS.md`、`AI_CONTEXT.md`、`docs/`、`tests/`。work、home 两环境的 album-miniapp 映射目录同为 photo-album，Hub 历史记录也以 photo-album 指代相册小程序，因此复用已注册的 `album-miniapp` 与原 Context，不新增公共记录。
- 当前分支 main / 70d4660，upstream 为 origin/main，`git ls-remote` 远端 main 同为 70d4660，工作区干净，已与远端一致，无需 pull。接入只读取，未写入业务仓库。
- 仓库无 `.codegraph/`（`.gitignore` 已忽略该目录），未初始化索引。
- 无仓库级 `user.name` / `user.email`；生效作者来自服务器用户级配置 `duun`，与本服务器花盆APP 的提交作者一致。

## 改动清单

- `environments/ssh/projects.local.yaml`：新增 `album-miniapp`（`transport: local`、`/home/cc/dh/photo-album`、`default_branch: main`），头部说明同步。
- `environments/ssh/README.md`：状态、当前映射表、本机工具状态（node 缺失导致小程序 `tests/*.test.js` 暂不能跑、两仓均无索引、提交作者来源）。
- `AGENTS.md`、`README.md`、`environments/README.md`、`docs/configuration.md`（SSH 状态与正矿挂载表）、私有目录 Symlink 方案：「只映射花盆APP」改为花盆APP、相册小程序。
- 公共注册表 `projects.yaml`、`context/album-miniapp.md`、work/home 映射均未改动。

## 本机工具

复核仍未检出 `flutter`、`dart`、`node`、`codegraph`，有 `python3`（PyYAML）。相册小程序的测试是纯 node 脚本（项目 `AGENTS.md` 写明 `node tests/<名字>.test.js`），本机暂不能运行；是否安装由用户决定，安装位置受 `/home/cc/dh/` 可写边界约束。

## 验证

- python3 + PyYAML 解析公共注册表与三份环境映射：版本均为 1，environment 与目录名一致；ssh 2 项、work 7 项、home 7 项，ID 均在注册表内，name 唯一，context 文件存在，enabled 为布尔。
- ssh 两项映射路径均存在、是 Git 根目录、origin 分别对应花盆APP 与相册小程序、当前分支 main；映射只含 transport、path、default_branch，无凭据或主机地址。
- 有效文档中不再残留「只映射花盆APP」表述；`git diff --check` 通过。
- 未运行业务构建或测试（本轮无业务代码改动）。
