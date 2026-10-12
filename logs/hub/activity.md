# Project Hub 自身操作总流水

记录 Project Hub 自身架构、脚本工具、工作规则与配置维护的每一次操作。

---

## 操作流水（最新在最前）

### 2026-10-12：相册 APP 苹果收据文档复核与真机日志留痕
- **环境 / 分支**：work / main。
- **操作**：登记相册 APP main / 2f3a67c 的安全调试日志与当前文档复核结论；记录用户按最新参数准备真机测试，以及原 ios 定时复核已按用户指令删除。保留此前迭代，不调整映射或规则。
- **验证**：两仓修改前显式 pull 当前同名 main；业务提交后再次 pull 并已 push，61 项相关回归通过，修改 Dart 文件 analyze 无问题。原有两文件内容哈希一致未提交，差异/信息隔离和 CodeGraph 检查通过；未编译 iOS、未真实支付或部署。统筹记录 diff 检查后提交，再 pull 当前 main 后 push。

### 2026-10-12：相册 APP iOS 内购交付与发布后复核留痕
- **环境 / 分支**：work / main。
- **操作**：登记相册 APP main / 6a8e2b0、bfce1a1 的内购前端和后端三个新参数交付；记录新返回契约/沙盒待复核及本聊天只读后续检查，保留此前迭代，不修改项目映射或规则。
- **验证**：业务开始与推送前显式 pull 当前 main，已 push；61 项相关回归通过，新增参数静态分析无问题，完整分析保留 5 条既有 info。用户两处旧改动原样保留未提交，文档/差异/信息隔离和 CodeGraph 检查通过；未编译 iOS、未真实支付或部署。统筹记录 diff 检查后提交，再次 pull 当前 main 后 push。

### 2026-10-11：qianrong 负责模块与特殊列表交付留痕
- **环境 / 分支**：home / main。
- **操作**：记录 13 个负责模块的 PRD 阅读结论、登录权限沿用及菜单权限迁移等待后端的实际安排；更新泰乾超级文档入口、背景和特殊列表维护约定，登记业务 master / 97f1e31 的交付，保留此前迭代。
- **验证**：三仓库开始前均 pull 当前同名分支成功；业务提交后再次 pull 并已 push。构建、16 个隔离页面/组件及原 demo 八种尺寸回归、原函数/按钮绑定核对通过；无 POST/真实业务请求或部署。正矿保持 feature-v1.8.5 / f152a42，锁文件保留且未提交。统筹文档差异/链接检查后提交，再次 pull 当前 main 后 push。

### 2026-10-11：qianrong 测试接口代理交付留痕
- **环境 / 分支**：home / main。
- **操作**：登记泰乾超级 master / dbe5853 的本地测试接口代理配置与使用说明；保留此前迭代，项目当前代理口径及详细验证放入该项目维护文档，未调整映射或规则。
- **验证**：业务配置加载、路径改写及生产构建通过，提交后再次 pull 并已 push；用户确认保留 pnpm-lock.yaml，未提交或改动。按用户要求未启动开发服务/代理。统筹 diff 检查后提交，再次 pull 当前 main 后 push。

### 2026-10-11：泰乾超级身份、私人挂载与 qianrong 交付留痕
- **环境 / 分支**：home / main。
- **操作**：taiqian-front 改名泰乾超级，保留 ID 和 home 映射；登记子应用泰乾超级-qianrong，配置五项私人维护挂载与文档入口；记录业务 7e1a00a 的列表、搜索、固定底栏及公开示例交付，保留此前迭代。
- **验证**：五项挂载目标及本地忽略有效，注册表/Context/home 身份一致；业务构建、八种桌面尺寸及隔离交互验收通过，业务提交后再次 pull 并已 push；正矿仅参照且干净。Hub diff 检查后提交，提交后再次 pull 当前 main 并 push。

### 2026-10-11：home 接入泰乾前端与正矿
- **环境 / 分支**：home / main。
- **操作**：新增 taiqian-front 公共身份、Context、home 映射及 README 入口；复用 minerals-admin 增加 home 映射，更新实际挂载状态；登记正矿切换同步结果，保留此前迭代，其他环境未改。
- **验证**：配置及两仓库身份校验通过；正矿五项挂载目标/忽略有效，feature-v1.8.5 已拉取至 f152a42，CodeGraph 重建后最新；两业务仓库干净、无源码改动。Hub diff 检查后提交，提交后再次 pull 同名 main 并 push。

### 2026-10-10：花盆后台原始文件名上传交付留痕
- **环境 / 分支**：home / main。
- **操作**：登记花盆后台 e653396 的上传原名参数、名称只读回填、操作期间保护与业务文档更新，保留此前迭代，未修改映射或规则。
- **验证**：业务最终生产构建 13.91 秒、语法及隔离浏览器验收通过，业务再次 pull 后 push，工作区干净；未真实上传或部署。统筹补丁检查后提交，再次 pull 当前 main 后 push。

### 2026-10-10：花盆APP DP115异常弹窗交付留痕
- **环境 / 分支**：home / main。
- **操作**：登记花盆APP d15eef0 的DP115回执关联、低优先级异常框、协议纳入、迟到回执与小屏适配；用户确认保留新增协议先pull并一并提交。未改映射或规则，保留此前迭代。
- **验证**：业务111项割草机回归及核心analyze通过，CodeGraph最新，diff与信息隔离检查通过；业务提交后再次pull并已push，未真机或打包。统筹记录提交后再次pull同名main再push。

### 2026-10-10：花盆后台文件管理交付留痕
- **环境 / 分支**：work / main。
- **操作**：登记业务 5f0684a 的文件管理、实际菜单同步、验证与未部署边界；记录用户授权保护 dist.zip，保留此前迭代，未改映射或规则。
- **验证**：业务最终生产构建、隔离交互、真实只读列表和菜单复查通过；统筹记录 diff 检查，提交后再次 pull 同名 main 并 push。

### 2026-10-09：花盆割草机首页两项 UI 修复留痕
- **环境 / 分支**：work / main。
- **操作**：登记花盆APP 8ce4749 的按钮 loading 与离线 Wi-Fi 展示修复、实际验证和未完成事项；保留此前迭代记录，未调整项目映射或规则。
- **验证**：记录 diff 检查；花盆修复提交后 pull --ff-only 再 push，Hub 本轮同步后提交记录并再次 pull、push。

### 2026-10-09：正矿分支切换同步后续留痕
- **环境 / 分支**：work / main。
- **操作**：登记用户授权的正矿 feature-v1.8.5 切换和同步结果，保留原分支；登记本机索引缺失重建及相册APP尚待决定的分叉。未改注册表、环境映射或规则。
- **验证**：正矿工作区干净、当前提交 b0f8e3c0、CodeGraph status 最新；记录文件 diff 检查，Hub 提交后 pull --ff-only 再 push。

### 2026-10-09：work 批量同步与花盆删除确认交付留痕
- **环境 / 分支**：work / main。
- **操作**：按当前环境映射核对六个业务仓库，登记本轮同步结果、用户授权的 dist.zip 暂存恢复、两项同步阻塞及花盆 `18dbe2a` 修复交付；保留此前迭代原文。未修改注册表、映射或工作规则。
- **验证**：花盆 9 条专项回归通过，扩大回归与静态分析限制如实记录；记录文件 diff 检查，Hub 提交后 pull --ff-only 再 push。


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

- **重启会话后在会话内实测可用**（同日，补上上一条的 ⚠️ 遗留）：重启 `claude` 后 `figma` 的两个工具
  确实进了本会话工具集（`ToolSearch select:` 能取到 schema），不再需要绕 REST API。
  两个工具都走通了：`get_figma_data`（`yIJCGLnUaNKIoQyWIHcnaz` 节点 `2-16209`，`depth=1` 拿到
  文件名「正矿后台设计重构」与三层 GROUP 结构）、`download_figma_images`（节点 `2-16382` 导出
  242×504 PNG）。图片落在 `IMAGE_DIR` = `.codex-tmp/figma-images/`，`git check-ignore` 确认被忽略，
  smoke test 产物已删除、工作区干净。**结论：「加完 MCP 必须重启会话」这条已双向验证**——
  重启前搜不到、重启后可用。

## 2026-10-09｜work｜正矿仓储文档与迭代留痕

新增仓储 Figma 资源映射/接口边界/验证文档，更新文档入口、业务地图、上下文与项目流水，追加迭代而不覆盖历史。文档 diff 与信息隔离待提交前复核。

## 2026-10-09｜work｜提单校验文档与仓储交付记录

仓储文档 40f94c5 已提交并 pull 最新；追加提单校验业务口径与回归矩阵，记录仓储业务提交 0eaf6014，继续保留先前迭代原文。

- 用户明确默认同步规则：显式 pull/push origin 的本地当前同名分支，不设置 upstream，合并须明确要求。更新 AGENTS.md 与 context/minerals-admin.md，修正旧文中默认分支/不自动提交的冲突表述；业务已推送 0eaf6014 / f152a424。文档 diff 检查通过。

## 2026-10-10｜work｜花盆 APP 交付留痕

追加当前迭代与跨项目流水，记录业务 main 提交 f5905d7、76 项回归与 Android 编译结果，以及未真机复现闪退的证据边界。此前未完成事项保留，具体实现与维护记录留在目标项目文档。统筹文档 diff 检查通过。

## 2026-10-10｜work｜相册 APP 入口恢复交付留痕

追加当前迭代和跨项目流水，记录相册 APP main 交付 68e4dee、41 项现有回归通过、仅开启入口供截图的用户范围，以及原有两处本地改动的暂存恢复。此前迭代保留，具体实施文档留在业务仓库。统筹文档 diff 检查通过。

## 2026-10-10｜work｜花盆 APP 提示一致性检查留痕

追加本轮迭代与跨项目流水，记录花盆 APP main 030ed0e、65 项回归和静态分析结果，以及割草机 Wi-Fi 离线可进入连接蓝牙的有意差异。先前迭代保留，完整检查记录在目标项目维护，统筹差异检查通过。

## 2026-10-10｜work｜花盆 APP 启动安全流程交付留痕

追加迭代与跨项目流水，记录花盆APP main交付eb7b10f、每次安全确认与DP119整小时、18点截止，以及88项回归和静态分析结果。保留此前迭代；具体实现及契约在目标项目维护。本轮用户关闭Excel临时锁文件后按同名main再次pull并push，未修改该文件。统筹差异检查通过。


## 2026-10-12｜home｜qianrong 全局规范交付留痕

更新泰乾超级文档索引、当前规范入口与负责模块边界，追加设计来源/逐模块对照、验收记录、私人流水及当前迭代/跨项目看板。记录业务 master / 7d3dd63 已推送，正矿 feature-v1.8.5 / f152a424 只作参照，用户根锁文件保留不提交；此前迭代保留，映射与其他项目未改。统筹文档差异检查通过，按默认流程提交、再 pull main 后 push。


## 2026-10-12｜work｜全部项目同步与泰乾超级公司关联

统筹先 pull 至 ae81f90，七个业务仓库显式 pull 当前同名分支成功。四个用户文件按授权精确暂存、恢复且哈希一致。复用 home 注册，补泰乾超级 work 映射、五项挂载和本机索引；正矿挂载正常，七索引最新。更新关联文档及旧 Context 同步口径，保留此前迭代与 home 映射。详细验收及各仓库提交见 2026-10-12-work-project-sync.md。统筹修改按默认流程提交、再次 pull 后 push。

## 2026-10-12｜work｜花盆 APP OTA 核查留痕

追加本轮迭代与跨项目摘要，记录业务 main / 7ce31b3 文档交付、42 项回归通过和 2 项基线失败、未真机及未确认耗时根因的边界。具体 SDK/设备固件职责与实测步骤由业务项目 OTA 文档维护，不复制到 Context；此前事项及其他项目工作区保留。统筹差异检查后按默认流程提交、再次 pull main 后 push。

## 2026-10-12｜work｜花盆 APP 三项 OTA 优化留痕

统筹与花盆 APP 开始前均 pull 当前同名 main 成功，目标先读自身规则/当前文档并用 CodeGraph 定位。登记业务 61a71b7 三项 OTA 修复及验证边界；只追加本轮摘要与跨项目流水，保留此前未完成内容，未改注册表或路径映射。业务 111 项 Flutter 回归、23 项 SDK 断言和 Kotlin 编译通过，真实耗时未验证；业务再次 pull 后已 push。统筹记录 diff 检查后提交，再次 pull origin main 并 push。


## 2026-10-12｜work｜花盆 Wi-Fi 与后台表情文案交付留痕

统筹及两业务仓库均先同步当前同名 main，业务按自身文档与 CodeGraph 规则实施。记录 APP 2f863f3、后台 db02ba1 的已推送交付和验证结果，保留此前迭代；Android 通道核查与 iOS 原有缺口、后台未写真实数据/菜单/部署、dist.zip 按授权暂存后恢复均如实登记。统筹仅更新迭代及两类流水，未改映射或身份 Context，差异检查后提交、再次 pull main 并 push。
