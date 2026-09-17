# Project Hub 自身操作总流水

记录 Project Hub 自身架构、脚本工具、工作规则与配置维护的每一次操作。

---

## 操作流水（最新在最前）

### 2026-09-09：ssh 安装 CodeGraph CLI，索引库改为本机生成不再进 Git
- **环境**：ssh（SSH 开发机）
- **分支**：main
- **操作类型**：工具链 + 版本控制策略调整
- **背景**：ssh 补建挂载后 `.codegraph/` 软链接已存在，但本机没有 `codegraph` 命令，后续 session 会按规则去调 `codegraph explore` 然后失败。排查发现这台机器 2026-07-29 装过 1.5.0（`~/.codegraph/telemetry.json`、`daemons/*.json` 记录 root 为已废弃的 `/home/pg/dh/photo-album`），随 node 版本更替丢失（现只剩 v24.16.0，全局包只有 corepack + npm）。
- **实施**：
  - 安装 `npm i -g @colbymchenry/codegraph`（1.6.0，self-contained，bin 为 `codegraph`）。
  - `git rm --cached private/minerals-admin/.codegraph/codegraph.db`，并在 `private/minerals-admin/.codegraph/.gitignore` 增加 `codegraph.db`：索引库改为每台机器本地生成，Hub 在该目录下只跟踪人工维护的 `task-cache/`。理由是两台机器都 sync 会在 33MB 二进制上产生不可合并冲突，且每次提交都往 Hub 里再压一份（`.git` 目前 11MB）；其余 5 个项目的 `.gitignore` 本来就整体忽略 `.codegraph/`，本次是拉齐口径。
  - `codegraph sync` 在本机重建索引：608 个文件重解析，16.2s，10,121 节点 / 32,214 边，DB 32.5MB。
  - 口径同步进 `README.md`、`docs/configuration.md`（补 CLI 安装命令与索引库策略）、正矿 `instructions/AGENTS.md`（第 1、3 节：索引库不提交、CLI 每机各装一次、没装就退回源码检索）。
- **验证**：`codegraph --version` = 1.6.0；`codegraph status` 读到 629 文件；`codegraph explore` 实测可用（正确列出 `stockInfoList` 的 14 个调用方）；sync 后 Hub `git status` 不再出现 DB 改动。
- **顺带核实**：正矿团队仓库自己的 `.gitignore`（`db6b7cc`，2026-07-30）第 26、29~31 行已忽略 `.codegraph/`、`/AGENTS.md`、`/AI_CONTEXT.md`、`/docs/`，脚本写入 `.git/info/exclude` 的条目属双保险，真正只靠 exclude 的是 `logs/`。

---

### 2026-09-09：ssh 环境补建正矿私有挂载，补写各环境挂载状态与冲突处理
- **环境**：ssh（SSH 开发机）
- **分支**：main
- **操作类型**：环境挂载 + 文档维护
- **背景**：本轮正矿任务发现 ssh 机器上 `minerals-frontend` 根本没有 private_mounts 软链接（`docs/` 还是本机遗留实体目录，`.git/info/exclude` 无忽略行），任务只能直接读写 Hub 原文件。用户确认：私有文档与 CodeGraph 只有正矿有这个需求，三端软链接都指向 Hub 里的同一份，统一在 Hub 维护，缺的补上。
- **实施**：
  - 用 `scripts/setup-links.mjs --env ssh --project minerals-admin` 建立 5 个软链接并写入 `.git/info/exclude`；冲突的 `docs/build-opt/`（2026-08-25 打包优化原始产物，24 文件 / 601894 字节）先 `cp -a` 并入 `private/minerals-admin/docs/build-opt/`、`diff -r` 校验一致后再删除仓库内原件。
  - `docs/configuration.md` 私有挂载章节新增「各环境挂载状态与冲突处理」：三端挂载状态表（work 2026-09-08 已挂载 / ssh 2026-09-09 已挂载 / home 未映射）、`Real source exists` 的正确处理顺序（`--migrate` 只适用于私有目标不存在的首次迁移）、以及挂载后 CodeGraph 索引仍是上次 sync 机器快照的提醒。
  - 修正正矿 `instructions/AGENTS.md` 里指向不存在的 `docs/private-mounts.md` 的引用，改为 `docs/configuration.md` 的私有挂载章节。
  - 按用户澄清补写「归属口径」：所有项目都是文档 + CodeGraph 长期维护，但 5 个个人自有仓库的 `AGENTS.md`/`AI_CONTEXT.md`/`docs/` 就提交在各自仓库、`.codegraph/` 各自 `.gitignore` 忽略并本机生成，一律不进 Hub；只有正矿因为是企业团队仓库不能放私人内容才做私有化，三端各自配路径、共用同一份挂载定义指向 Hub 同一份资料。写入 `README.md` 私有目录章节与 `docs/configuration.md`。核实依据：5 个仓库均实有 `AGENTS.md`/`AI_CONTEXT.md`/`docs/`（`git ls-files` 计数 22~132 个文件）且 `.gitignore` 均含 `.codegraph/`。
- **验证范围**：`--dry-run` 先行；挂载后 5 个链接 `readlink -f` 指向正确并可读，`git check-ignore -v` 全部命中，`minerals-frontend` 的 `git status` 干净。
- **交付状态**：与本轮正矿代码提交分开，Hub 单独提交推送；`private/minerals-admin/logs/2026-09-09-ssh私有挂载补建.md` 留详细记录。

---

### 2026-09-09：工作约定改为「完成并验证后默认 pull + push」
- **环境**：ssh（SSH 开发机）
- **分支**：main
- **操作类型**：工作规则维护
- **背景**：用户指出「每次完成任务，没有特殊要求的情况下，给对应的项目、包括 Hub 自身，先 pull 再 push」这条约定文档里没有，而且本轮 flowerpot-admin 的改动确实既没先 pull、也没提交推送。核对确认原文档写的是相反口径（`AGENTS.md` 原第 17 行「commit 和 push 均由用户决定」）。
- **实施**：`AGENTS.md` 用新章节「任务完成后的默认动作：再 pull 一次，然后 push」替换原约定，保留四条边界——验证未过或半成品不提交、push 前 pull 出现分叉冲突即停不自动 merge/rebase/强推、无 upstream 时先问、PR / 合并 / 发布 / 部署仍需单独指令，并要求逐仓库报告提交号；`README.md` 首段口径、文件用途表与「提交迭代需求」说明同步；6 份项目 Context 与 `context/_template.md` 的「commit 和 push 均等待用户明确指令」全部改写，minerals-admin 保留功能分支无 upstream 时用显式 `<remote> <branch>` 的例外。
- **验证范围**：`grep` 复查仓内不再残留旧口径；Hub 与 flowerpot-admin 均在 push 前 `git pull --ff-only` 确认最新。
- **交付状态**：本条规则变更与 flowerpot-admin `61f8e76` 同批推送，详见 `iterations/current.md` 本轮记录。

---

### 2026-09-08：家里环境项目映射与当前分支同步
- **环境**：home（家里电脑）
- **分支**：main
- **操作类型**：环境接入与仓库同步
- **实施**：新增 `environments/home/projects.local.yaml`，按项目文档与仓库身份复用花盆、相册系列 5 个既有项目 ID；正矿本机不存在，不添加映射。Hub 自身先完成 `git pull --ff-only`，当前为 `2d9633d`。
- **同步结果**：花盆 APP、相册 APP、相册后台、相册小程序均在当前 `main` 分支拉取成功，并完成已有 CodeGraph 索引同步；花盆后台因 `dist.zip` 未提交修改，等待用户决定处理方式。
- **验证范围**：核对目录、Git 根目录、项目身份、当前分支和 `origin/main` upstream；本轮仅接入与同步，不执行业务构建或测试。
- **交付状态**：映射与记录保留在工作区，未提交、未推送；详见 `iterations/current.md` 本轮记录。此前迭代原文保留。

---

### 2026-09-08：多维度日志留痕体系与跨项目方案库建设
- **环境**：work（公司电脑）
- **分支**：main
- **操作类型**：架构与日志体系增强
- **需求与实施**：
  - 建立统筹层全局日志目录 logs/：
    - logs/hub/：Project Hub 自身操作的每一次留痕（遵循子项目留痕规则）；
    - logs/projects/：记录通过 Hub 统筹修改各业务项目的全局变更看板；
    - logs/solutions/：从各业务子项目中提炼、学习并沉淀的跨项目通用方案库。
  - 规范私有大文件夹 private/：所有具有私人需求的项目统一收拢在 private/<project_id>/ 下，通过项目 ID 物理隔离，支持未来无限扩展。
  - 正矿项目专用私人日志沉淀于 private/minerals-admin/logs/，并作为 private_mounts 挂载到正矿本地。
- **验证**：软链接挂载测试通过、业务仓库 Git 干净，单元测试 6/6 全过。
- **详见记录**：[2026-09-08-多维度日志留痕体系与跨项目方案库建设.md](2026-09-08-多维度日志留痕体系与跨项目方案库建设.md)

---

### 2026-09-08：私有目录 Symlink 管理方案与自动化脚本落地
- **环境**：work（公司电脑）
- **分支**：main
- **操作类型**：核心能力建设
- **需求与实施**：
  - 根据《Project Hub 私有目录 Symlink 方案.md》，实现 scripts/setup-links.mjs 和 scripts/setup-links.sh，支持单项目/批量恢复、安全迁移（--migrate）与解绑（--detach）。
  - 在 projects.yaml 增加 private_mounts 规范；调整根级 .gitignore 放行 private/ 内的项目级 .codegraph。
  - 编写并运行原生测试套件 scripts/setup-links.test.mjs，包含 6 组自动化测试。
  - 将正矿（minerals-admin）已有私有文档与 CodeGraph 安全迁移至 private/minerals-admin/，业务项目原物理实体彻底删除并替换为 NTFS 链接。
- **验证**：
ode --test 6 项全过，git diff --check 通过，正矿工作区干净。
- **详见记录**：[2026-09-08-私有目录Symlink管理方案落地.md](2026-09-08-私有目录Symlink管理方案落地.md)

---

### 2026-09-17：SSH 开发机磁盘清理（仅 /pgdata/pg/dh）
- **环境**：ssh（SSH 开发机）
- **分支**：main
- **操作类型**：执行环境维护（未改 Hub 代码与规则）
- **背景**：`/pgdata`（20GB，独立盘）只剩 426MB，正矿本轮字体子集化差点没地方落盘。
- **实施**（动手前逐仓确认工作区干净、无 stash）：
  - 删 `dist/`：minerals-frontend 35M、flowerpot-web 4.5M、web-ui-v2 4.7M。
  - 删全部 `node_modules`：minerals-frontend 555M、flowerpot-web 295M、web-ui-v2 295M，外加 `node_modules/.vite`。
  - 7 个仓 `git gc`（普通模式，不 aggressive、不 prune=now）：回收 105M，flowerpot `.git` 141M→106M、photo-album 82M→50M。
- **结果**：`/pgdata` 可用 426MB → **1.8GB**（98% → 91%）；`/pgdata/pg/dh` 合计 1.8G → **491M**。
- ⚠️ **本机不再能跑 vite / vue-tsc / Playwright 验证**，改动效果只能靠用户本地拉代码看。
  需要时先 `npm ci` 装回（正矿约 600MB）。用户口径：他在本地拉代码测试就行。
- ⚠️ **`/pgdata` 占用的真正大头不在 dh**：`/pgdata/pg/work/zettlab-product-dev` 占 15GB
  （其中 `.wt-batch0805` 1.9G、`.wt-pg907` 1.7G、`.wt-pg0915` 1.2G 三个 worktree 合计 4.8GB）。
  **用户明确「只有 /dh 下面的问题就 其它的 不要动」，未做任何处理。**
- ⚠️ 另一条易踩的：`/home/pg` 在 `/`（100GB，剩 27GB）上，不在 `/pgdata` 上——
  `~/.cache`（9.9G，其中 go-build 8G）、`~/.npm`（4G）再大也不占 `/pgdata`，清了对这块没用。

---

### 2026-09-17：给 Hub 会话配上 figma MCP（local scope，不影响其它目录）
- **环境**：ssh（SSH 开发机）
- **操作类型**：执行环境配置（未改 Hub 代码与规则）
- **起因**：本轮做正矿 Figma 还原时，`figma` MCP 在 Hub 会话里拿不到，只能改走 Figma REST API。
- **两件事查清楚了**：
  1. **scope 决定可见范围**：`claude mcp add -s <local|user|project>`。
     `user` 写进 `~/.claude.json` 顶层，**所有目录可见**（现有 `mcp-clickhouse` 就是这种，所以到处都有）；
     `local` 写进 `~/.claude.json` 的 `projects.<目录>.mcpServers`，只在该目录可见；
     `project` 是仓库里的 `.mcp.json`，随 Git 走、首次需批准。
     MCP 按**会话启动时的 cwd** 解析，与「我正在改哪个仓」无关——所以正矿仓里的 `.mcp.json`
     在 Hub 会话里永远不会加载。
  2. **用户那份正矿 `.mcp.json` 本身是坏的**，两处都不对，等于从来没连上过：
     - 缺 `--stdio`：不带这个参数进程按 HTTP 模式跑，stdio 连接立刻关闭（`CONNECTION_CLOSED`）；
     - 环境变量名写成 `FIGMA_ACCESS_TOKEN`，实际要 **`FIGMA_API_KEY`**
       （实测报 "Either FIGMA_API_KEY or FIGMA_OAUTH_TOKEN is required"）。
- **实施**：`claude mcp add -s local figma -e FIGMA_API_KEY=… -e FRAMELINK_TELEMETRY=off
  -e DO_NOT_TRACK=1 -e IMAGE_DIR=…/.codex-tmp/figma-images -- npx -y figma-developer-mcp --stdio`。
  按用户「不上传任何内容到外部服务」的口径关掉该包默认开启的 usage telemetry；
  `npx -y` 首次下载会超过 30s 健康检查超时，先 `npx -y figma-developer-mcp --help` 预热。
- **验证**：Hub 目录 `claude mcp list` → figma ✔ Connected；
  逐个抽查 flowerpot / web-ui-v2 / photo-album / `~` → **0 个 figma 条目**，未受影响；
  zettlab 仍是它自己那份官方 HTTP 版，未动。
- ⚠️ **新增 MCP 对正在运行的会话无效**：工具集在会话启动时固定，实测加完后本会话仍搜不到 figma 工具，
  必须重启 `claude` 才能用。
- **遗留**：正矿仓那份坏掉的 `.mcp.json`（已 gitignore，含同一个 token）未动，待用户决定是修还是删。

---

### 2026-09-17：删掉正矿那份 figma MCP 配置；把「只动 /pgdata/pg/dh」写成硬规矩
- **环境**：ssh（SSH 开发机）
- **操作类型**：规则升级 + 执行环境配置
- **实施**：
  1. 删除 `minerals-frontend/.mcp.json`（本就未跟踪且已 gitignore，删除不影响仓库；
     内容备份在 `.codex-tmp/minerals-mcp.json.bak`）。该文件的配置是坏的（缺 `--stdio`、
     环境变量名错写成 `FIGMA_ACCESS_TOKEN`），从来没连上过，且里面存了一份 token。
     删后正矿目录 `claude mcp list` 已无 figma 条目，仓库工作区干净。figma 只保留 Hub 的 local scope 那一份。
  2. `AGENTS.md` 新增「可写边界：SSH 环境下只许动 `/pgdata/pg/dh`」一节，置于「信息隔离」之前。
     两条规矩区分清楚：信息隔离管**不把 Hub 痕迹写进别人能看到的仓库**，
     可写边界管**不去碰别人的文件**。
- **边界的准确口径（同日用户补充）**：**读可以，写绝对不行**——允许只读借用别人目录里的插件 / 工具包 / 依赖
  （此前跑 Playwright 截图引 `/pgdata/pg/work/.../node_modules/playwright-core` 属于合规借用，只 import 未改动），
  但绝对不可在 `dh` 之外新增、修改、删除任何文件，产物一律写回 `dh` 下。

- **figma MCP 端到端验证通过**（同日）：直接对 stdio 发 `initialize` / `tools/list` / `tools/call`，
  拿到工具 `get_figma_data`、`download_figma_images`，并成功取回节点 `2-16209` 的结构数据。
  该 token 属于 Figma 账号 `john125`——**用户确认是本人的另一个号**，不是外借凭据，无需另行处置。
  它对正矿设计文件是 `role: viewer` / `linkAccess: view`，即靠「链接可查看」拿到的权限，
  不是被邀请进文件。所以**光有正确链接不够，文件还必须对该账号开放**；稿子权限收紧时会 403。
