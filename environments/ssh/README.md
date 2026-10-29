# SSH 环境

**状态：新服务器已接入（2026-10-21），当前映射花盆APP、相册小程序、相册APP、相册后台、泰乾超级、正矿。**

2026-10-21 用户确认已更换服务器，旧服务器的全部项目映射、目录和写入范围、挂载状态及工具依赖位置均已作废。同日用户在新服务器内运行 Hub，声明当前为 ssh 环境，接入了第一个项目花盆APP；2026-10-22 用户在 `/home/cc/dh/` 下引入 photo-album，核实后作为相册小程序接入；同日又在该目录下新增 flutter，用户指明即相册APP，核实后接入；2026-10-23 用户引入 web-ui-v2，指明即相册后台，核实后接入；2026-10-26 用户引入 tq-plus，称「超级泰乾-qianrong」，核实即已有项目泰乾超级（taiqian-front，qianrong 为其子应用）后接入，并按正矿方式恢复私有挂载；同日又引入 zk，即正矿（minerals-admin），核实后接入并恢复私有挂载。其他项目后续再定。

## 当前映射

| 项目 | project_id | 路径 | 默认分支 |
| --- | --- | --- | --- |
| 花盆APP | flowerpot-app | `/home/cc/dh/flowerpot` | main |
| 相册小程序 | album-miniapp | `/home/cc/dh/photo-album` | main |
| 相册APP | album-app | `/home/cc/dh/flutter` | main |
| 相册后台 | album-admin | `/home/cc/dh/web-ui-v2` | main |
| 泰乾超级（含子应用 qianrong） | taiqian-front | `/home/cc/dh/tq-plus` | master（远端默认；开发分支为 dev，2026-10-28 用户明确） |
| 正矿 | minerals-admin | `/home/cc/dh/zk` | feature-v1.8.5（本机远端只有此分支，共享配置记 master） |

Hub 自身位于 `/home/cc/dh/project-hub`。全部使用 `transport: local`（Hub 与项目同在服务器内）。

## 私有挂载（泰乾超级）

泰乾超级按用户要求和正矿一样走私人配置：`AGENTS.md`、`AI_CONTEXT.md`、`docs/`、`logs/`、`.codegraph/` 的真实文件在 `private/taiqian-front/`，业务根目录只放本地忽略的软链接；文档、日志更新一律写进私人目录，不在业务仓库里生成。

- 2026-10-26 接入时核实：tq-plus 是 Git 根目录，当前 master 与 origin/master 一致（9975d7f），Hub 私人日志里记录的多个提交号均在该仓库历史中，确认与 home/work 的 front 仓库为同一项目。origin 为用户 GitHub 上的 tq-plus 仓库（与 home/work 相同），pull/push 按规则走 origin 的同名分支。
- 本机没有 `node`，`scripts/setup-links.mjs` 无法运行；按脚本同样的规则手动建立五项绝对路径软链接，并在 `.git/info/exclude` 追加 `/.codegraph`、`/docs`、`/AGENTS.md`、`/AI_CONTEXT.md`、`/logs`。`git check-ignore -v` 五项全部命中，业务 `git status` 干净。
- 本机没有 `codegraph`，索引未初始化；装好 CLI 后在业务根目录执行 `codegraph init .`（之后用 `codegraph sync .`）。是否安装由用户决定。

## 私有挂载（正矿）

正矿的五项私人资料在 `private/minerals-admin/`，业务根目录只放本地忽略的软链接，规则、文档、日志只写私人目录。

- 2026-10-26 接入时核实：`/home/cc/dh/zk` 是 Git 根目录，当前 feature-v1.8.5 与 origin 一致（1c9e465，796 个提交），Hub 正矿私人日志记录的 152 个提交号中 115 个在该仓库历史中，确认是同一项目。origin 为用户 GitHub 上的 zk 仓库，远端只有 feature-v1.8.5（origin/HEAD 也指向它），按规则在当前分支同步。
- 同样无 node，按 setup-links 规则手动建立五项绝对路径软链接，`.git/info/exclude` 追加 `/.codegraph`、`/docs`、`/AGENTS.md`、`/AI_CONTEXT.md`、`/logs`（业务 `.gitignore` 本身也忽略 `.codegraph/`、`/AGENTS.md`、`/AI_CONTEXT.md`、`/docs/`）。`git check-ignore -v` 五项命中，业务 `git status` 干净。
- 无 codegraph，索引未初始化；无 node，构建与类型检查不能运行。

## 可写边界（2026-10-21 用户明确）

**可写范围只有 `/home/cc/dh/` 这一个目录。** 目录之外只读：可以查看或只读借用已有工具，但不得新增、修改、删除、移动或清理文件，也不执行 `install` / `build` / `git gc` / `checkout` / `clean` 等有副作用的命令。磁盘告急也不构成清理目录外内容的理由，如实报告即可，处理与否由用户决定。

临时产物写在 `/home/cc/dh/project-hub/.codex-tmp/`（已 gitignore）。

## 远端：一律 GitHub（2026-10-26 用户明确，2026-10-29 再次明确 ssh 只管 GitHub）

所有提交只推送到 GitHub，提交前核对 `git remote get-url origin`，不是 GitHub 就暂停询问用户，不提交、不推送。规则见 AGENTS.md「任务完成后的默认动作」第 0 条；该条只有 work 环境例外（work 保持各仓库原有 remote 不变），ssh 不适用该例外。

2026-10-26 核实：flowerpot、photo-album、flutter、web-ui-v2、tq-plus 与 Hub 的 origin 均为用户 GitHub 仓库。

## 本机工具状态（2026-10-21 接入时核实，2026-10-22 复核）

- 未检出 `flutter`、`dart`、`node`、`codegraph` 命令；有 `python3`（含 PyYAML）。
- 因此暂不能在本机运行花盆APP、相册APP的 Flutter 测试/构建，也不能运行相册小程序的 `tests/*.test.js`（纯 node 脚本）和 `scripts/setup-links.mjs`；是否安装由用户决定，安装位置同样受上面的可写边界约束。
- 泰乾超级、正矿同样无法运行构建与 `setup-links.mjs`，挂载已手动建立（见上）。
- 花盆APP、相册小程序、相册APP、相册后台仓库内都没有 `.codegraph/`（四仓 `.gitignore` 均已忽略），是否建索引由用户决定；相册后台的 `npm run build` / `node --test` 同样因无 Node 暂不能运行。
- Git 提交作者来自服务器用户级配置（`duun`），各仓都没有仓库级 `user.name` / `user.email`，不需要另配。

## 约束

- 不连接旧服务器，不从历史记录恢复旧路径、别名、挂载或授权结论；历史迭代、旧日志及构建记录仅供追溯。
- 新增项目时由用户提供仓库位置，逐项核实目录存在、是 Git 根目录、仓库身份、分支与 origin 后再登记，不猜测或自动创建位置、不 clone。
- 凭据由 SSH 工具管理，密码、私钥、Token 和实际主机地址不得写入共享配置。
- 公司 `work`、家里 `home` 的现有映射和项目身份不受影响。
