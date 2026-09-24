# 正矿业务需求与变更流水明细

记录正矿前端由个人负责的所有需求、修复与技术改动。

---

## 历史记录（最新在最前）

### 2026-09-24：国内销售提示条——核对后不补（`feature-v1.8.4`，`eb1f6cf`）
- 用户要求「国内销售的提示条也一起改成新样式」。核对：页面上**没有**这条提示（上一轮助手报告「还是旧的灰色 info 样式」有误，只看到了 styles.scss 里的残留样式）。
- 来历：`db6b7cc`（07-30 静态原型）加过「订单号规则：GNXS + 日期 + 10 位随机数；码头与堆场来源使用不同的商品字段。」；`d1edeb8`（08-03 同事接真实接口）把页面顶部整块注释掉，提示条一并去掉。
- 用户选择「不补，保持现状」，只删了 `domestic-sales/styles.scss` 里没用上的 `.trade-rule-banner`，sass 编译通过。

### 2026-09-24：11 项样式修复（`feature-v1.8.4`，`b867de7` / `b9a575a` / `b8250e5`）
- **环境**：ssh；已在 `feature-v1.8.4`，pull 最新后改。主会话做全局 4 项，页面还原分 3 个助手并行（各自只改自己模块目录），主会话统一校验、构建、提交。
- **1 列表加粗**：根因是 `ListTableCard` 的 `.lc-cell__text` 默认 700，几乎每列都粗。改为 400，只有「重要单号」加粗：自动判断第一列数据列是文本/链接且 prop 以 No/Nos/Code 结尾或标题含编号/单号（69 个列表页里 53 个命中），列可写 `strong` 覆盖。链接、剩余天数、进度步骤、行内操作、更多下拉都去粗；库存预警内联粗体、菜单父级 700→500。
- **2 详情页表单/表格**：皮肤层 `.el-col > .el-form-item > __content > :is(输入类):only-child { width:100% !important }`（一格多件的币种+金额不受影响）；`.el-table { width:100% !important }`（19 张表写了 `style="width: 80vw/50vw"`，是右侧大块留白的来源）；列宽全写死的 2 张表（进口采购商品、提单箱柜）width→min-width。顺带：上方标签的表单（label-top）标签回到文字高 + 8 间距（原被撑成 40）；开关尺寸改成直接写在 core/action 上（EP 2.14 不读 `--el-switch-width`，38×22 / 表格 32×18 原来都没生效）。
- **3 / 4（助手）**：进口采购详情合同信息 4 列→3 列按稿重排、商品/付款表与规则卡按稿、底栏改 `BottomFixedBtnsBox`；国内采购提示条改警示样式 + 「忽略」收起（只在当前页面，不存状态）。
- **5 / 6**：`ListSearchCard` 丢了旧 `TableSearch` 的「超过一行折叠」→ 页面都没写 `advanced` 时主行满 5 格后的字段自动进「更多筛选」（审批任务 6 个 → 5 + 1）。提单列表按稿 436:9440 补更多筛选：货运方式、代理客户名称、代理订单号、进口采购单号、融资状态（参数按接口 `PurchaseDeliveryPageDTO` 核对）；稿里「提单预警」「创建时间」接口无参数没放，「代理客户名称」无下拉数据源先做输入框。
- **7 / 8（助手）**：提单箱柜/散货表「批量」改品牌浅底小标签、行内开关 32×18 + 单侧状态字、标题行按钮小号；海运三稿（散货无尾程 / 编辑有尾程 / 详情集装箱）：海运状态三按钮、AI 船运跟踪独立成卡、尾程移入头程卡、删除该记录浅红按钮、关联集装箱标签；顺带修散货表「结果」批量在只读态可改的 bug。
- **9–11（助手）**：入库单详情、出库计划详情、出库单新增改成区块卡 + 上方标签三列表单、附件合并一块、底栏；删掉入库单模板里一行残留的「关联入库计划与入库货物明细" />」可见文字。
- **没做（下版本内容或缺数据）**：各页右侧 310 栏、顶部卡里需汇总/新字段、AI 分析/提示条、附件拖放样式（FileUpload 组件）、「数据已自动保存」。国内销售的同款提示条没改（不在本次范围）。
- **验证**：13 个改动的 SFC 用 `@vue/compiler-sfc` 编译通过；`node scripts/build.mjs --memory 1024 --concurrency 2` 构建通过（33s）；构建生成的 `src/types/auto-imports.d.ts` 改动已还原未提交，`dist` 已删。未在浏览器里看效果。

### 2026-09-24：列表操作列按按钮实际宽度定宽（`feature-v1.8.4`，`6b697ba`，试用）
- **来历**：09-23 18:01 留在工作区未提交的 `ListTableCard/index.vue` 改动；用户 09-24 要求「先提交上去，我看看效果和是否兼容，不行就改回来」。
- **内容**：每次渲染后量当前页每行实际显示的按钮组（`.lc-actions__group`），取最宽一行 + AI 钮 + 单元格内边距作为操作列宽（最小 80）；量不到时退回原来的 202 / 页面给的宽度。按钮 `flex: none` 不被压缩。数据或列变化时重新量。
- **验证**：提交前通读完整 diff，核对 `tableRef`、`.lc-actions__group`、`.lc-actions__ai` 都存在，watch 不会自触发循环；未跑构建（本机无 node_modules）。
- **回退**：效果或兼容性不行就 `git revert 6b697ba`。

### 2026-09-24：文本域高度改回与普通输入框一致（`feature-v1.8.4`，`27b2709`）
- **环境**：ssh；先确认已在 `feature-v1.8.4`，pull 为最新后再改。
- **需求**：「文本输入框 type="textarea" 以前说的高度不对，和其它 form 表单输入框的高度保持一致」——撤销 09-18 的「两倍高（80）」口径。
- **实施**：`src/assets/styles/zk/detail-page.scss` 皮肤层 `.el-textarea__inner` 由 `min-height: calc(控件高 × 2)` 改为 `height` / `min-height: var(--zk-size-control)`（40，均 `!important`，压 Element 按 rows 写的内联高度），内边距 `10px 12px`（行高 20 → 单行垂直居中），去掉被 `font` 简写覆盖、实际无效的 `line-height: 1.5`。DESIGN_SPEC 4.2 同步改写。
- **影响面**：只作用于挂了 `zk-detail-page` 的详情/编辑页；弹框（teleport 到 body）和 `import-data-dialog` 自带的 textarea 规则不受影响。页面里写的 `rows`（1–4）不再决定高度，多行内容在框内滚动。
- **验证**：单条 SCSS 规则改动，未跑 `vite build`（本机无 node_modules，装依赖要占 555M）；已人工核对选择器作用域和与 `font: var(--zk-font-label)`（13px/20px）的叠加结果。
- **未提交的遗留**：工作区里 `src/components/ListTableCard/index.vue` 有一份 09-23 18:01 的未提交改动（操作列按内容自动定宽 `measureActions`），不属于本次需求，原样留着没提交也没丢弃。

### 2026-09-09：ssh 环境提交作者名改为 dh
- **环境**：ssh（仅本机配置，无代码改动、无提交到团队仓库）
- **实施**：`git config --local user.name dh`，只动正矿仓库的 `.git/config`；全局仍是 `pg-dh`，同机的花盆、相册、Hub 各仓库不受影响。核对 `git var GIT_AUTHOR_IDENT` = `dh <xxxxx.com>`，committer 同步生效。
- **邮箱**：随后按用户要求一并改为 `duun235@163.com`（仓库级）。先实测过「留空」这条路——Git 允许，提交对象里是 `author dh <>`，但托管平台靠邮箱认账号，空邮箱在 Codeup 上归属不到人且可能被推送规则拦，故用真实邮箱。
- **未改**：已推送的历史提交（`08dfce1`、`6b7d0ae`、`ad31f92`、`a909a1a` 及 2026-09-01 那批）作者仍是 `pg-dh`——`feature-v1.8.3` 与团队共用，改写要强推，没做。
- **口径**：`.git/config` 不随 Git 同步，work / home 需各自再配一次；写入 `docs/development.md` 新增的「11. 提交身份」。

---

### 2026-09-09：码头直提按采购类型控制客户项并回传采购单字段
- **环境**：ssh
- **工作分支**：`feature-v1.8.3`（改前 `git pull --ff-only origin feature-v1.8.3` = Already up to date）
- **提交记录**：`a909a1a`（已推送）
- **需求与实现**（`views/sales-pickup/list/pier-add.vue`）：
  - `getWaitDeliveryPurchaseList` 后端新增 `purchaseType`（0 代理采购 / 1 自营采购）、`customerId`、`customerName`、`agentOrderNo`，`state.purchaseList` 映射时一并保留。
  - 表单把「进口采购单号」调到「客户」前面；客户项 `:required="!isSelfOperated"`，自营（`purchaseType === 1`）时禁用并清空，未选采购单时也禁用；`rules` 由普通对象改成 `computed`，配合 `:validate-on-rule-change="false"`，否则必填是 setup 时的快照、自营仍会被拦。
  - 代理采购按所选采购单的 `customerId` 回显客户（`customerOptions` 会把采购单带的客户补进下拉，避免客户列表里没有该客户时回显不出来），仍支持手动改选，`form.customerOrgName` 跟随选中项同步。
  - 保存 `createWharfDeliveryOrder` 新增 `purchaseType`、`agentOrderNo`（取自所选采购单）与 `customerId`/`customerName`（取自最终选中的客户，自营为空）；顺带修掉原来 `state.customerList.find(...).label` 在客户不在列表时会抛错的写法。
  - 集装箱取数条件改为 `canFetchGoods`：已选采购单，且代理采购下已选客户；自营没有客户，只按采购单号查（原条件写死要 `customerOrgId`，自营会永远查不出列表）。切换采购单清空已选集装箱与弹框列表。
- **口径待确认**：`customerId`/`customerName` 传的是**最终选中的客户**（因为客户支持手动改）；若后端要的是采购单原始委托客户，需要改成取 `selectedPurchaseOrder` 的值。
- **验证**：生产构建（1024MB 堆 / 2 线程）29.7s 通过；`codegraph sync` 已刷新。**未做浏览器实机验证**，自营 / 代理两种采购单的实际数据也没跑过。

---

### 2026-09-09：出库附件必填标识 + 码头直提集装箱弹框打开即查询
- **环境**：ssh
- **工作分支**：`feature-v1.8.3`（改前 `git pull --ff-only origin feature-v1.8.3` = Already up to date）
- **提交记录**：`ad31f92`（已推送）
- **需求与修复**：
  - 出库单新增/编辑 `views/out-warehouse/out-warehouse-list/template/handleDetail.vue`：「出库附件」`prop` 是复制粘贴残留的 `purchaseOrderFileList`，与 `FileUpload` 绑的 `form.stockOutFileList` 对不上，既没星号、必填校验也落在不存在的字段上。改为 `prop="stockOutFileList" required`，与入库单 `b56b251` 同一写法；同页只读的「提货单附件」`prop` 一并改回 `fileList`。
  - 码头直提新增 `views/sales-pickup/list/pier-add.vue`：「请选择集装箱」弹框原来只在点「查询」时才调 `getWaitDeliveryContainerList`，`openAddGoodsDialog` 改为打开即请求，与昨天堆场货物弹框的口径一致；客户或进口采购单号为空时只开弹框不发请求，弹框内「查询」按钮行为不变。
- **副作用（需实机确认）**：`required` 会同时拦提交，出库单没传附件将无法保存；编辑历史单据时详情把 `commonFiles` 回填到该字段，老数据没附件的要先补传。
- **验证**：生产构建（1024MB 堆 / 2 线程）30.7s 通过；`codegraph sync` 增量刷新（2 文件 / 474ms）。**未做浏览器实机验证**。
- **文档**：`docs/maintenance.md` 新增「附件必填星号不显示或必填校验落空」排障条目并修正过期的「本地文档不可跨机同步」；`docs/domain-map.md` 补码头直提弹框口径。

---

### 2026-09-09：ssh 装上 CodeGraph CLI，索引库改本机生成
- **环境**：ssh
- **实施**：`npm i -g @colbymchenry/codegraph`（1.6.0）；`codegraph sync` 重建本机索引（608 文件 / 16.2s / 10,121 节点 / 32,214 边）。
- **策略调整**：`codegraph.db` 从 Hub 版本控制移除并加入 `.codegraph/.gitignore`，改为每台机器本地生成；Hub 只留 `task-cache/` 与文档、规则、日志。避免 work / ssh 两处 sync 在 33MB 二进制上冲突。
- **实测**：原 work 那份索引在本机可直接读（源码路径是相对路径），但依赖侧存的是 `D:/new-project/minerals-frontend/node_modules/...` 这类绝对路径，连 work 现路径都对不上，跨机器共享价值有限——这也是改成本机自建的依据之一。
- **规则同步**：`AGENTS.md` 第 1、3 节改写（索引库不提交、CLI 每机各装一次、未装则退回源码检索）。

---

### 2026-09-09：ssh 环境补建私有挂载（5 个链接）
- **环境**：ssh
- **工作分支**：`feature-v1.8.3`（不产生团队仓库提交）
- **实施**：`node scripts/setup-links.mjs --env ssh --project minerals-admin` 建立 `.codegraph`、`docs`、`logs`、`AGENTS.md`、`AI_CONTEXT.md` 五个软链接，全部指向 Hub 的 `private/minerals-admin/`；`docs`、`logs`、`.codegraph` 写入 `.git/info/exclude`，两个 md 本就在团队 `.gitignore` 里。
- **冲突处理**：脚本原先报 `Real source exists: .../docs`（仓库实体 `docs/` 与 Hub 私有目标同时存在，两边都不覆盖）。本机 `docs/` 里只有 2026-08-25 打包优化的原始日志与脚本 `build-opt/`，`cp -a` + `diff -r` 校验一致后并入 `private/minerals-admin/docs/build-opt/`，删除仓库内原件再挂载；仓库内路径仍是 `docs/build-opt/`。
- **验证**：5 个链接 `readlink -f` 指向正确、可读；`git check-ignore` 全部命中；团队仓库 `git status` 干净。
- **遗留**：本机未安装 `codegraph` CLI，`.codegraph/` 是 work 机器的历史快照，ssh 上无法 sync；home 没有正矿仓库，映射与挂载待日后 clone 后补。
- **详细记录**：见 [`2026-09-09-ssh私有挂载补建.md`](2026-09-09-ssh私有挂载补建.md)。

---

### 2026-09-09：堆场提货「补充信息」批次号取 goodsList.stockBatchNo
- **环境**：ssh
- **工作分支**：`feature-v1.8.3`（改前 `git pull --ff-only origin feature-v1.8.3`，`08dfce1` → `1a516bd`）
- **提交记录**：`6b7d0ae`（已推送）
- **需求与修复**：
  - `yard-replenish.vue` 货物信息表「批次号」列由 `prop="batchNo"` 改为 `prop="stockBatchNo"`；`objectSpanMethod` 的 `mergeCols` 同步换成 `stockBatchNo`，保住该列的跨行合并。
  - 根因：`form.goodsList` 有两个来源——走 `stockInfoList` 时映射了 `stockBatchNo: item.batchNo`，直接用提货单详情返回的 `goodsList` 时只有 `stockBatchNo`，后者下整列为空且合并错位（详情页 `yard-detail.vue` 一直是按 `stockBatchNo` 渲染的）。
  - 排序用的 `compareFields = ['batchNo', ...]` 作用于库存原始行，保持不动；`pier-replenish.vue` 无批次号列，不受影响。
- **验证**：生产构建（1024MB 堆 / 2 线程）30.8s 通过；全量 `vue-tsc` 在本机 1GB 堆下 OOM 未跑完，按内存约定不上调堆；**未做浏览器实机验证**。
- **详细记录**：见 [`2026-09-09-堆场提货补充信息批次号.md`](2026-09-09-堆场提货补充信息批次号.md)。

---

### 2026-09-08：进口采购单新增/编辑校验规则修复
- **环境**：ssh
- **工作分支**：`feature-v1.8.3`
- **提交记录**：`08dfce1`（已提交待推送）
- **需求与排障修复**：
  - 定价依据 Collapse 外层包装 `<el-form ref="pricingBasisFormRef" :model="contractForm">`，解决组件脱离 el-form 导致 `prop="pricingBasisList.N.value"` 无法解析、用户输入一触发 change 就必现红字提示的问题。
  - `contractAmount`、`contractNo` 等字段必填 trigger 改为 `['blur', 'change']`，修复合同金额程序化回填后错误态不消失的问题。
  - 数据重建、详情回显、AI 回显处补清空校验。
- **验证**：单文件模板/脚本编译无错误，生产构建（1024MB 堆）32.2s 通过。

---

### 2026-09-08：私有目录 Symlink 方案落地与原文件迁移
- **环境**：work
- **工作分支**：`feature-v1.8.3`
- **需求与实施**：
  - 将正矿本地维护的私有文档（`docs/`）、AI 规则（`AGENTS.md`、`AI_CONTEXT.md`）、私有日志（`logs/`）和代码分析数据库（`.codegraph/`）完整迁移至 Project Hub 的 `private/minerals-admin/`。
  - 正矿原物理实体文件安全删除，替换为 Windows NTFS Junction / SymbolicLink 链接。
  - 配置业务仓库 `.git/info/exclude` 忽略规则，团队 Git 保持完全干净。
- **状态**：已完成落地，正矿工作区完全 clean。

---

### 2026-09-08：堆场提货与采购单规则修复
- **环境**：work
- **工作分支**：`feature-v1.8.3`
- **提交记录**：
  - `b56b251`：堆场货物隐藏成分列；必须先选进口采购单才可添加货物；查询与保存透传 `purchaseNo`；修正入库附件必填标识及对应字段。
  - `c16df7d`：堆场详情补齐 `deliveryStatus` 显示（1 已提货、2 待提货、3 提货中）。
- **验证**：采购单前置条件、查询/保存传参、切换清理、过期响应隔离、必填标识组件渲染与 CSS 规则、数字和字符串状态映射检查通过。
- **遗留**：全量类型检查存在外部历史报错（`dashboard.ts` 引用未导出的 `shipDynamicsWarning`），不影响本次堆场交付。
- **详细记录**：见 [`2026-09-08-堆场提货与采购单规则修复.md`](2026-09-08-堆场提货与采购单规则修复.md)。

---

### 2026-09-17：ListTableCard 按 Figma 节点还原视觉 + 思源黑体子集
- **环境**：ssh（SSH 开发机）
- **工作分支**：`1.8.4-list`
- **提交记录**：`ebaf6f1`（已推送）
- **设计来源**：Figma `yIJCGLnUaNKIoQyWIHcnaz` 节点 `2-16209`「提单业务列表」。
  ⚠️ 项目里配的 figma MCP 在本会话拿不到（server 配在仓库 `.mcp.json`，而会话 cwd 在 Hub，
  项目级 `.mcp.json` 不会加载），改走 Figma REST API 取节点 JSON 与渲染图，token 从仓库 `.mcp.json` 现读。
- **改动**：
  - 标题 17/500 `#29415c`、计数 `rgba(41,65,92,.6)`；**表头改成与正文同色的 400 常规字重**（原 800 `#5b7087`）。
  - 徽标去掉 1px 描边，底色改主色 10% 透明度、字重 500；行 hover `#fafbfe`、选中 `#edf5ff`。
  - 链接与操作列 `#1771dc`、危险项 `#e34855`、操作项间距 10；复制按钮 18×18 常显 72%；
    固定列左缘投影 `-3px 0 19px rgba(16,51,91,.25)`；序号列 60% 透明度。
  - 日期副行拆两态（默认弱化 11/400/60%，`subTone` 给了才是 13/700 彩色）；`subTone` 扩出 `blue`；
    新增 `lc-col-plain` 工具类对应稿里 12/400 的次要文本列。
  - **修 `dateFormat` 失效**：`utils/ruoyi` 的 `parseTime` 收下 pattern 后没用它，组件内改为自己格式化，未动共用函数。
  - 字体：官方 18MB `.otf` → `pyftsubset` 子集化 2.2MB woff2（7198 字，保留 `wght 250–900`），
    `@font-face` 在全局 `index.scss`，弹窗另带一份字体族（teleport 到 body 继承不到）。
- **验证**：Playwright 实测 computed style 与设计稿逐项吻合；字体 200/loaded、可变字重实测有效；
  改动文件 `vue-tsc` 0 错误（全量 1024MB 堆 OOM，改用只含改动文件的临时 tsconfig）。
- **遗留**：①18MB blob 已在 `origin/1.8.4-list` 历史里（`092d68b` 已推送），删文件清不掉历史，
  彻底清理需改写历史 + 强推共享分支；②只验了组件自带 `example.vue`，未逐个业务页面看效果；
  ③`/pgdata` 磁盘已 99%。

## 2026-09-17 | 设计规范落库（`909341c`，已推送）

- **背景**：用户要对正矿做整体样式重构，给了 Figma link（只指向「色彩和字体规范」一块），
  问能否全部读取，并要求在仓库里建一个所有人都能看见的 .md 专门记设计规范，后续改动都往里写。
- **读取**：`get_figma_data` 按 node 取。整份文件两个画布；「设计规范」画布下 16 个板，其中 4 个是分隔横幅。
  已读：色彩字体、按钮、图标、列表页面组件、表格样式、结构、详情页基本组件、详情页右侧组件、AI助手。
  未读：菜单栏（用户说导航和菜单不归他负责）。
  坑：`详情页基本组件` 3311×6479 单次超 token 上限，落盘后分段 grep；节点上的 `template=EL-xxx`
  指向 ELEMENTS 段的复用模板，不回查拿不到真实样式值。
- **产出**：根目录 `DESIGN_SPEC.md`（11 节）+ `src/assets/styles/design-tokens.scss`（`--zk-*` 令牌 +
  Element 全局映射）+ `index.scss` 接字体与正文色 + README 指路 + `list-card-tokens.scss` 注释指路。
- **判断**：没有把 `list-card-tokens.scss` 一并改成引用令牌 —— 它的值来自更早的静态稿、已上线验收，
  与 Figma 有色差（品牌蓝 `#0C6FE4` vs `#1771DC`、成功 `#08A567` vs `#0EB879`）；
  一次提交里不同时改「新令牌」和「已验收视觉」，差异写进 DESIGN_SPEC「待统一」等用户定。
- **遗留**：①未验证（无 node_modules、磁盘 1.5G 可用），全局 `--el-font-size-base: 13px` 与主色影响全站；
  ②DESIGN_SPEC 里放了 Figma 文件链接，若该文件未对全组共享需要用户确认是否保留；
  ③三处品牌蓝、两套语义色待设计确认收敛。

## 2026-09-17 | 提单详情页按设计规范换皮（`6df564c`，已推送）

- 用户要求：按上一轮建的设计规范改 `src/views/bill-lading` 的样式，只改稿里出现过的内容，
  「页面导航与框架」再次申明不归他负责、不要干预。
- 现状盘点：列表页 `index.vue` 上一轮已用 ListSearchCard/ListTableCard 做过，本轮没动；
  真正要改的是详情页——`template/handleDetail.vue` + 6 个 Tab 组件（基础信息/货物/海运/清报关/检测/结算）。
- **决策：不动公共组件**。`Collapse` 79 个文件在用、`BottomFixedBtnsBox` 9 个，改了就是全站改版，
  超出本轮范围。做法是模块级主题 `detail-theme.scss`，详情页根节点挂 `.zk-bill-detail`。
- **权重坑**：公共组件 scoped 样式编译成 `[data-v-x]` 属性选择器，与「两个类」的权重打平，
  覆盖与否取决于 CSS 打包顺序。把作用域类写两遍 `.zk-bill-detail.zk-bill-detail` 抬一档解决。
- **按钮配色的坑**：一开始给 `.el-button` 直接写白底，会把 warning / info 这些没单独覆盖的类型一起吃成白底。
  改成「形状对所有按钮生效、配色只覆盖稿里出现过的类型」，默认皮肤用 `:not(...)` 排除各 type 与 link/text；
  注意不能用 `:not([class*='el-button--'])`，那会把 `el-button--small` 这种尺寸类也误排除。
- ⚠️ **自己的失误**：批量改 4 个组件 `.switch-label` 时用了跨行惰性正则，在 BillBasicInfo 里越过块边界
  把 `.upload-item` 整段删了。已重写该样式段并补 `.status-switch` 的 flex 居中（原对齐靠 `line-height:40px`）。
- **验证**：`npx sass@1.103.1` 逐个编译 `detail-theme.scss`、`design-tokens.scss` 与 7 个改动文件的 style 块，
  全部通过。没起页面（无 node_modules、磁盘 93%）。
- **遗留**：①Element 弹层（select/date 面板、dialog）teleport 到 body，不在作用域内，未按规范处理；
  ②AI 面板（AiMonitor/AiTracking）与物流轨迹图是自带设计、规范里没有对应板，保持原样，里面还留着 `#409eff`/`#1E65A5`；
  ③设计稿的顶部固定信息卡、右侧 310px 栏当前页面没有，按用户口径没加。

## 2026-09-17 | Tab 药丸 bug、详情页皮肤升为全局层（`c72bba3`，已推送）

- **复现页方案（可复用）**：`.codex-tmp/zk-preview/` —— vue/element-plus UMD + 官方 CSS 本地化，
  `index.scss` 用 dart-sass 编译，公共组件与页面的 scoped 样式用脚本补 `[data-v-xxx]` 后**放在主题之后**加载
  （既复现真实权重，又能验证「类名写两遍」是否真的压得住）；Playwright 截图 + `getComputedStyle` 量测。
  这套比"手写静态 DOM"准得多，以后改样式都可以用。
- **真因**：`el-segmented` 指示器的 `height:100%` 是 JS 写的内联样式。内联 > 任何选择器，
  所以上一轮的 `height:3px` 无效。教训：**凡是 Element 用 JS 定位/量尺寸的元素（segmented 指示器、tabs 的 active-bar、
  affix、fixed 列的贴边条），几何属性都可能是内联的，改它们要么换承载元素（::after），要么才考虑 !important。**
- **按钮配色第二个坑**（上一轮埋的）：默认皮肤若用 `:not([class*='el-button--'])` 排除，会把 `el-button--small`
  这种尺寸类也误排除；已改成逐个 type 排除。
- **全局分层**（写进 DESIGN_SPEC 第 10 节）：① 令牌 `design-tokens.scss` ② 页面皮肤 `zk/*.scss`（开关类生效）
  ③ 通用组件 ④ 模块私有。关键是②：全局下发但靠类名开关，于是可以按模块渐进迁移，不会一改全站抖。
- **漏读设计稿的教训**：`get_figma_data` 加 `depth` 会静默丢掉叶子节点。大板要么分子节点取，要么落盘后分段读，
  **不能**用一次 depth 截断的结果就当"读完了"。这次补回 6.1/6.5/6.6 三块。
- **遗留**：①底部按钮用户说有问题，我这边复现页量测与稿一致，已回问具体现象；
  ②稿里的顶部固定信息卡（8 格关键字段）当前页面没有，属新增功能，待用户决定要不要做；
  ③Element 弹层、FileUpload 上传区仍未按稿处理。

## 2026-09-17 | 设计稿逐块重读（`fb4ac2f`，已推送）

- **教训坐实**：上一轮说的「`depth` 会静默截断叶子节点」这次付出了实际代价——
  详情页表格的表头字号/字色我按列表页那套写了，实际稿里是 12 Medium `#516880`，
  单元格输入框也不是 40 而是 36。**凡是要写进规范的板子，必须按子节点读全，不能用一次 depth 的结果。**
- 已读全并记录的板子：按钮 5:7451、图标 5:7543、AI助手 2:14473（含 2:14972 详情页版）、
  右侧组件 6:7901、详情页基本组件 4:3967（含 4:4205 / 4:6507 / 4:7374 / 5:7410）、表格样式 3:3266、
  列表页面组件 3:1846、结构 2:13805、列表结构 1:12959。3:1840 / 4:3965 / 3:1844 / 1:13602 / 3:1842 是分隔横幅。
- **同一语义在不同页面不是一套值**，这点写进规范正文提醒：列表页表头 13/19.5 `#29415C` 配 `#F6F9FD`，
  详情页内嵌表格表头 12/18 Medium `#516880` 配 `#F5F8FC`；搜索卡标签 13 Bold，详情页表单标签 13 Medium。
- 1:12959 还带出左侧一级导航 Rail 的完整规格（88 宽 `#0B2947`、选中 68×64 渐变 + 光晕、折叠钮 50×48）——
  按用户要求**只记录不改**，写在第 8 节并注明由导航负责人维护。
- **遗留**：①底部按钮的具体问题用户还没回；②顶部固定信息卡是否要做待定；
  ③Element 弹层、FileUpload 上传区仍未按稿处理。

## 2026-09-17 | 对照整页稿核对 app-main 以下所有盒子（`798f1f0`，已推送）

- **教训**：组件板（4:3967）给的是「零件」，整页稿（1:2098）才给「零件怎么摆」。
  只看组件板会把顶部卡的皮肤误当成所有卡的皮肤，也看不出页面自己多缩了一层。
  **以后核对样式，组件板 + 整页稿都要看。**
- 整页稿量出的骨架：工作区 1832（1920 − Rail 88）；顶部卡 1788×209 → Tab 1788×45 →
  主内容 1454 + 24 + 右栏 310 → 底部栏 1832×66。内容左右 20 的留白由 `.app-main` 给。
- 已修：区块卡纯白 + `#DFE9F4` + 圆角 14 + 间距 12 + 内容 padding 18；去掉 `.tab-box` 和 `.collapse-box`
  多加的 20 横向内缩；页面底色改工作区渐变。
- **待用户拍板**：顶部固定信息卡（8 格关键字段 + AI 提示条 + AI 分析按钮）、右侧 310 栏
  （关键时间节点 / 关联信息 / AI 智能洞察）——都要绑数据，属于新增功能。
- 其余仍未处理：Element 弹层、FileUpload 上传区；底部栏宽度用的是公共组件的 `calc(100vw - 276px)`，
  稿里是贴 Rail 到最右 1832，差异来自当前菜单宽度，属于框架侧。

- 补充（`2955d65`）：**「底部按钮有问题」的真因找到了** —— 不是按钮本身的样式，是**位置**：
  `BottomFixedBtnsBox` 的 `right:18px` + `width: calc(100vw - 276px)` 让按钮比卡片右移 16px。
  稿里底部栏贴左侧导航右缘铺到最右。在详情页作用域内覆盖 `right/width` 解决，没动公共组件。
  教训：用户说「样式有问题」时，先量**位置和对齐**，不要只盯着颜色圆角。

## 2026-09-17 | 顶部固定信息卡（`0708899`，已推送）

- 用户在四个选项里选了「只做顶部固定信息卡」。做成可复用组件而不是写死在提单页，理由是后面
  入库/出库/代理订单详情都要用同一张卡，写死就得抄四遍。
- **字段来源逐个核实过**（没有猜字段名）：`oceanDeliveryNo` / `status` / `financeFlag` / `shipCompanyId`
  / `CargoInfo[].containerWeight` 累加 / `SeaInfo` 头程 `expecteArrivalDate` / `updateTime`；
  异常预警确实没有字段，占位破折号 —— 列表页那一列也是同样处境，口径一致。
- **新增一条验证手段**：`.codex-tmp/sfc-check` 里装 `@vue/compiler-sfc@3.3.9`（不进项目仓），
  对改动过的 SFC 逐个 parse + compileScript + compileTemplate。本机跑不了 vite，这一步能兜住
  `defineProps` 泛型、模板语法错误。以后改 .vue 都应该跑一遍。
- **遗留**：右侧 310 栏 + 内容收窄 1454 + 表单宽度 280→440（用户本轮明确先不做）；
  顶部卡的 AI 提示条与「AI 分析」按钮组件已支持（`notice` / `#actions`），但页面级 AI 分析还没有后端，暂未接。

## 2026-09-17 | 底色接缝与阴影过重（`24778bc`，已推送）

- **两条可复用的结论**：
  1. **背景只能有一层**。app-main / 页面根 / Tab 条各画一层同名渐变，结果是留白处露底、
     69px 高的 Tab 条把整条渐变走完 → 上下硬边。整页稿里底色就是画在最外层画布上的。
  2. **Figma 阴影标注值不能照抄进 CSS**。实测：同参数下 CSS 比 Figma 渲染重 1.7~2.5 倍。
     做法：`download_figma_images` 导**透明底 PNG** → canvas 逐行量 alpha → 和浏览器渲染的候选参数做 RMS 拟合。
     卡片 .06 → .035，主按钮 (8,18,.24) → (5,12,.14)，误差都 <1。
- 导出图还看出：**稿里表单是上下结构**（标签在输入框上方 + 控件 440 宽），实现是左侧 120px 标签 + 280 宽。
  用户上一轮已说「内容收窄 1454 + 表单 440 先不做」，故只记录。
- 脚本留在 `.codex-tmp/zk-preview/`：`shadow-alpha.mjs`（量 alpha）、`shadow-fit.mjs` / `btn-fit.mjs`（拟合）、
  `seam.mjs`（量各层背景与接缝）。

## 2026-09-17 | 滚动条与工作区底色（`976b4e6` / `7e66085` / `e3f3989`）

- 用户口径：**盒子之间不要底色，只靠阴影分隔**。稿里工作区是浅蓝渐变，按用户决定改白底，
  令牌保留、一行可回退，DESIGN_SPEC 1.2 已注明是谁定的、为什么。
- 决定前先用脚本扫了 `.zk-detail-page` 子树里所有在画背景的元素，确认除卡片/控件外没有别的层，
  避免又改错地方 —— 这个 `bgscan.mjs` 留在 `.codex-tmp/zk-preview/`。
- **提交作者名的教训**：会话开头环境信息给的 "Git user" 是全局 config，不等于仓库实际身份。
  仓库自己配了 `dh <duun235@163.com>`，我却在每次提交上显式覆盖成 pg-dh，11 个提交都推上去了。
  以后**一律不带 `-c user.name/-c user.email`**，不确定就先 `git config user.name` 看一眼。

## 2026-09-17 | 阴影才是"底色不搭"的真因（`b3de9df`）

- **我的思路偏差**：之前拿"阴影总墨量"去拟合设计稿（`0 6px 18px .035`，总量 54 ≈ 稿 56），
  数字很好看，但**观感上要紧的是边缘那一下，不是总量**。18px 的模糊把墨摊得又远又薄，
  边缘反而不够、周围一圈发灰——卡之间的渐变被熏脏，就成了用户说的"底色和外层不搭"。
- 用户直接给了答案：`3px 3px`。实测 `0 3px 3px .035`：边缘 alpha 8（稿 7.7，几乎一致），总量只有 24（稿 56）。
- **教训**：量化对比要挑对指标。以后比阴影，先看**边缘 alpha**，再看铺开范围，不要只看积分值。
- 附带纠正：因为"治错了症"，我还一度把工作区底色从稿里的渐变改成白底，现在已还原。
  改视觉之前应该先把「是背景的问题还是前景的问题」分清楚。

## 2026-09-17 | Element 控件高度的三套来源（`1bbbb84`）

- **最值得记的一条**：Element 的控件高度**不是一个变量统管**。
  `el-input` / `el-date-picker` / `el-input-number` → `--el-input-height` → `--el-component-size`；
  **`el-select` 的 wrapper 是硬编码 `min-height:32px`**；
  **`el-form-item__label` 的高度按 size 变体硬编码 32**。
  只设 `--el-component-size: 40px` 会得到「输入框 40、下拉 32、标签 32」的参差 —— 正是用户报的问题。
  以后调控件尺寸，这三处要一起给。
- 表格内那档 36 用的是 `height`，而给 select 补的 40 是 `min-height` —— **min-height 会压过 height**，
  所以表格内也要同时写 `min-height: 36px`。差点漏掉。
- Tab 下划线：之前躲 `!important` 用 `::after` 画，代价是没有动画。改回用 Element 指示器后，
  只在 `height` 上用一处 `!important`，宽度用「透明边框 + background-clip: content-box」收窄 ——
  这样既拿到 JS 驱动的滑动，又拿到稿里的窄下划线。
- 顶部卡：又一次「Figma 标注 ≠ 渲染结果」。取色证明稿里那张卡基本是白的，标注的 135deg 渐变写成 CSS 会偏蓝。

## 2026-09-17 | 两条自己埋的坑（`8099dc7`）

- **`font:` 简写会重置 `line-height`**。`line-height: 40px; font: 500 13px/20px ...;` —— 后者赢，行高变 20。
  配合 `.el-form-item__label` 本身是 `align-items: flex-start` 的 inline-flex，文字贴顶，比控件高 10px。
  **量化的教训**：上一轮我量的是"标签盒中线 vs 控件盒中线"，两边都 40 高，差 0，于是以为修好了；
  但用户看的是**文字**。这轮改用 `Range.getClientRects()` 量文字本身的位置才暴露出来。
  以后验证对齐，量文字不量盒子。
- **皮肤层的选择器不能裸写组件类名**。Tab 条样式我写成 `.el-segmented`，结果把 SeaInfo 里
  「海运状态」那个分段控件（待启运/运输中/已抵港）也改成了 Tab 样子，药丸滑块变下划线，交互语义没了。
  已收窄到 `.tab-box .el-segmented`。**页面皮肤层给 Element 组件写规则，一律限定容器**。

## 2026-09-18 | 文本域高度（内联样式第三次咬人）

- 用户要 textarea 高度 = 普通输入框 ×2。写在皮肤层统一兜底，模板不改 `rows`。
- **Element 内联样式清单（本仓已遇到三处，改这类属性先想到它）**：
  1. `el-segmented` 指示器的 `width/height/transform`（JS 定位）；
  2. `el-textarea` 的 `min-height`（按 `rows` 算）；
  3. `el-affix` 固定态的 `top/width`。
  这些都得靠 `!important` 或换承载元素，纯选择器权重无效。

## 2026-09-18 | 图标可以直接取设计稿原件

- `download_figma_images` 不只是导 PNG 截图，**矢量节点能直接导 SVG**。这次把「数字步进」图标
  （node 4:4555）导出来，做成 data URI 放进令牌，用 `mask` + `background-color: currentColor` 上色。
  好处：hover/disabled 只改 `color`，不用每个状态一张图；上下箭头共用一张图靠 `mask-position` 取半。
- 图标默认落在 `.codex-tmp/figma-images/`（已 gitignore）。要进仓库的话，项目用的是 `virtual:svg-icons`，
  目录 `src/assets/icons/svg/`，配 `SvgIcon` 组件 —— 但 Element 内部渲染的图标插不进去，
  那种场景只能像这次一样用 mask 替换。
- ⚠️ 覆盖 Element 控件 padding 的教训：`.el-input__wrapper` 是 `padding: 1px 11px`，
  **上下那 1px 参与盒高**，清零就矮 2px。

## 2026-09-18 | 折叠开关与 Figma 静态资源

- 折叠开关：29×29 / 圆角 8 / `#F5F8FC` / 15px chevron `#667D94`。换皮写在 `.collapse-title-box .right-icon-box`，
  **Collapse 组件没动**。`el-icon` 的 `:size` 是内联 font-size，尺寸直接定 `svg` 更稳。
- **Figma 静态资源的取法**（用户问过）：`download_figma_images`
  - 矢量节点 → SVG 原件（能看到 stroke 色值/宽度/端点，比肉眼估准）；
  - 任意节点 → PNG（`pngScale` 控倍率），用于阴影 alpha、取色这类定量比对；
  - 落盘目录 `.codex-tmp/figma-images/`（gitignore）。
  - 进仓库走 `src/assets/icons/svg/` + `virtual:svg-icons`；Element 内部渲染的图标插不进去，
    只能用 `mask` + `currentColor` 替换（数字步进就是这么做的）。

## 2026-09-18 | 第一次真正改公共组件

- 之前一直坚持「不动 Collapse」，这次是用户明确要全站生效，才把折叠开关的样式写进组件自身。
  **分层的判断依据**：这块是组件自己的控件、和业务无关 → 属于「通用组件」层；
  而卡片外观、表单控件尺寸那些是「页面皮肤」层，仍然靠 `.zk-detail-page` 开关类。
- 复现页的工具链修了个 bug：`:deep(x)` 不能简单换成 `:is(x)` 再补 `[data-v]`——
  vue 是把属性挂在 `:deep` 之前那一截、括号内不加。改对后复现页才反映真实的组件层样式。

## 2026-09-20 | 底栏对不齐的真正原因：同一条规则被抄了五份

- 用户报「底部按钮因为菜单宽度缩小没适配」。菜单现在是 88 的 Rail（`$base-sidebar-width`），
  而底栏的宽度写的是**旧菜单**：公共组件 `calc(100vw - 276px)` / 收起态 100，详情页皮肤又抄了一份
  240 / 64，质押页 284，码头与堆场补录页各 284，融资页 `left:260 + calc(100vw-280px)`。
  **五份字面量，改了菜单没人跟着改** —— 和「限制控件前先找到真的那个」是同一类毛病。
- 收法：框架用 CSS 变量下发（`sidebar.scss` 里 `--zk-layout-sidebar` / `--zk-layout-ai-panel`），
  组件只写 `left: var(...); right: var(...)`，**不再出现 100vw 减法**。
  用 left/right 两端锚定还顺手躲掉了 `100vw` 含滚动条宽度的老问题。
- AI 抽屉展开时主内容 `margin-right: 420`，底栏以前会钻到抽屉底下；现在右缘读同一个变量。
  420 这个值原来在 `layout/index.vue` 和 `GlobalAiChat` 各写一遍，也并成了 `$ai-panel-width`。
- 「给底栏让位」的下边距同样是四份并存（60 / 80 / 84 / 86），其中 **60 的两页真的被压住 6px**
  （栏高已按规范抬到 66）。统一成皮肤层的 `.form-have-bottom-btn`，值 = `--zk-size-footer-bar + 20`。

## 2026-09-20 | 详情页铺开：55 个页面接同一套皮肤

- 做法就是规范 10.2 那五步，**没有新写样式**：根节点加 `zk-detail-page`（54 个 handleDetail
  + 码头/堆场补录两页），删页面自画的卡片皮肤，88 处字面色值换令牌。
- 只换皮肤，**没有给每页补 6.1 顶部信息卡和 6.8 右侧栏** —— 那两块要按页定字段，属于新增内容。
- 新补进皮肤层的只有一类：`el-descriptions`（18 个详情页的「系统信息 / 融资信息」都用它，
  设计稿里没单独画）。取 4.2 只读字段的字号字色 + 6.4 表格容器的边框圆角，
  顺手把 Element 默认的加粗标签改回不加粗。
- 收掉的重复：国内采购与国内销售的 `styles.scss` 是**两份逐字相同的文件**，本轮同样改了两遍；
  想彻底治要合成一份，本轮没动（跨模块搬文件，影响面另算）。
- ⚠️ **基线本身是坏的，和本轮无关**：`ledger/ledger-list`、`information/customs-data`、
  `car/car-list` 三个列表页在之前的列表页迁移里被 `migrate-list-page.mjs` **截断**了——
  统计条/工具条的开标签被搬进 `#toolbar` 槽、尾巴留在原地，`vite build` 直接报
  "Element is missing end tag"。按 git 历史补回后全仓 477 个 SFC 才解析通过。
  **教训**：那个迁移脚本切标签不可靠，用它迁完必须跑一次构建，别只看页面长得对不对。
- 本机门禁：`vite build` 通过（1024MB 堆）；**`vue-tsc --noEmit` 在 1GB 堆下 OOM**，
  按用户约定不加堆；nas 上没有 node，所以全量类型检查这轮没跑，只用 grep 核对了删掉的符号没有残留引用。

## 2026-09-20 | 「进页面就弹框 + 调了个删除接口」的真凶是 el-switch

- 现象：咨询列表、帮助中心管理**一进页面**就弹「确认操作该项吗？」，网络面板里还有个 delete 请求。
- 真凶在 Element Plus 的 switch 源码里（`switch.vue` setup 段，**组件创建时同步执行**）：

  ```js
  if (![props.activeValue, props.inactiveValue].includes(actualValue.value)) {
    emit(UPDATE_MODEL_EVENT, props.inactiveValue)
    emit(CHANGE_EVENT, props.inactiveValue)   // ← 页面的 @change 就是被这一下触发的
  }
  ```

  绑定值**只要不严格等于** activeValue / inactiveValue 其中之一，开关就会「自纠」：
  既 emit change（弹框、发接口），又把 v-model 写成 inactiveValue（**悄悄改数据**）。
  用户说的「特定情况下」= 某些行的字段是 null / 类型不一致。
- 两页的具体成因：
  - 咨询列表：`status/topStatus/carouselStatus` 后端是**可空 Integer**（swagger 已核对），
    从没设过置顶/轮播的行就是 `null`，而开关写的是 `:activeValue="1"`。
  - 帮助中心：`String(item.status ?? '0')` 只兜住 null/undefined，后端给 `''` 或别的值照样漏。
- 那个「删除接口」**不是删数据**：`/help/center/updateStatus` 后端就定义成 **DELETE 方法**
  （dev swagger `/system-service/v3/api-docs` 里确认），前端封装没写错，看着像删除而已。
  咨询列表那边对应的是 POST `/informationContent/updateStatus`。
- 修法两层：① 入列表前把开关字段归一成 activeValue/inactiveValue 之一；
  ② 换数据那一帧置 `hydrating` 标记，`nextTick` 后清掉，期间的 change 一律丢弃
  （后端将来多返回一个取值也不会复发）。
- **同类隐患全仓审了一遍**（11 处带 @change + 17 处不带）：
  - 应付采购 `form.settleFlag`：详情整体覆盖 form 后变 undefined → 进页面弹「请先选择关联提单号！」
    并把值取反；顺手把 `form.value.oceanShipIds.length` 改成可选链（那行本来就会 TypeError）。
  - 进口采购 `contractCompleted`、提单基础信息 `electStatus`：回填时归一。
  - 出库计划单/出库单的「客户派车」是 **disabled 只读开关**，后端 1/0 对上默认的 true/false ——
    一直显示成「关」，改成 `:model-value` 单向展示（这个不弹框，属于显示错）。
  - 用户管理、定时任务：`active-value="0"` 是字符串，后端 SysUser.status 也是字符串，对得上，没动。
- **以后写开关记住**：`active-value` / `inactive-value` 的**类型**必须和后端字段严格一致，
  可空字段一律先归一，否则「进页面自己发请求」这种鬼故事还会再来。

## 2026-09-20 | 弹框没修掉的原因：我拦的窗口太窄

- 上一条记录里我把「一进页面弹《确认操作该项吗？》」归因到 el-switch 的创建期自纠 —— **归因没错**
  （用户确认弹框文案正是这句），但**修法不到位**：我只在页面里做了两件事，
  ① 拉列表时把字段归一，② 换数据那一帧设 `hydrating` 标记丢弃 change。
- 漏在哪：**开关不止在「换数据那一帧」被创建**。翻页、改列设置（ListTableCard 的列显隐）、
  表格重渲染都会重新创建单元格里的开关，每次创建 Element 都会再自纠一次，
  而 `hydrating` 那个标记 `nextTick` 就清掉了，后面的时机一个都盖不住。
  归一化本身也只保护「当前这次接口返回」的数据，别处改过 row 的值照样会漏。
- 正确做法是**把拦截放到组件层**：新增 `src/components/StatusSwitch/index.vue`，
  ① 传给 el-switch 的值永远是 activeValue / inactiveValue 之一（自纠条件不成立）；
  ② 组件自身 `onMounted` 之前收到的 change 一律丢弃 —— 自纠发生在子组件 setup 阶段，
  必定早于父组件的 onMounted，用户点击必定晚于它，两者能干净地区分。
  **每个开关实例各有一份守卫**，所以无论什么时候被创建都拦得住。
- 全仓 `@change` 的 el-switch 已全部换成 StatusSwitch（9 处：帮助中心、资讯列表×3、用户管理、
  定时任务、提单基础信息、海运信息、进口采购、应付采购），页面层那两道临时兜底删掉了。
- 剩下 17 处不带 `@change` 的开关只会「悄悄改值 / 显示成关」，不弹框，本轮没动
  （出库计划单与出库单那两个只读开关上一轮已改成 `:model-value` 单向展示）。
- **教训**：这类「框架组件在生命周期里替你改数据」的坑，兜底必须放在**组件实例这一层**，
  放在页面的某个时间窗口里一定会漏时机。

## 2026-09-20 | 海关数据页：错乱是因为「卡中卡」

- 页面用三层 `el-card` 分别包住筛选区、图表区、表格区，而 `ListSearchCard` / `ListTableCard`
  **自带卡片外观和 52 高的卡头**，于是出现双层边框、双层卡头、两套圆角内边距 —— 这就是「样式错乱」。
- 重构：去掉三层 el-card；搜索卡与列表卡回到顶层（列表卡的标题用 `title` 属性、导出按钮放 `#toolbar`）；
  其余块改用新增的 ② 层皮肤 `assets/styles/zk/list-page.scss`：
  `zk-panel`（卡身 + 52 卡头）/ `zk-stat-card`（规范 5.2 统计卡：106 高、圆角 16、28 Bold 数值、
  64×64 图标块）/ `zk-chip`（规范 8 的一级切换，替掉自画的下划线 tab）。
- 图表维度切换从三个 `el-radio-button` 换成 `el-segmented`（值不变）；图表格子、图例、空态换令牌。
- ⚠️ 顺带发现：`.list-page` 这个容器类在 **69 个页面里各写了一份**（值都一样）。
  本轮把它收进 `zk/list-page.scss` 定义一份，但没去删那 69 份副本（改动面太大，留作后续）。

## 2026-09-20 | 列表页五处按设计规范返工：Tab 进卡头、搜索标签、操作按钮语义色、操作列宽

用户一次提了五条（审批任务的 Tab、价格行情/海关数据的日期筛选没对齐、操作按钮该按功能分色、
进口采购单操作栏被裁、提单列表操作栏右边空白）。五条里有三条的根因在**共用组件**，不在页面。

### 1. 审批任务管理：Tab 浮在两张卡之间

`el-tabs` 单独摆在搜索卡和列表卡中间，落在工作区底色上——既不是白底，又把「同一张列表的三个档」
视觉上切成两块。`ListTableCard` 新增 `tabs` + `v-model:active-tab`：页签排进 52 高的白色卡头左侧，
和「共 N 条」同一行，样式取规范 8 子系统切换行的 chip（高度抬到 32 配卡头），条数做成页签里的小徽标，
选中时跟着变品牌色。页面删掉 `el-tabs` 和它那 30 行 `::v-deep(.el-tabs__nav)` 覆盖样式，
顺手把「关联业务单据号」从内联 `#2aadee` 的 div 换成组件内置的 `type: 'link'` 列。

### 2. 价格行情 / 海关数据：日期筛选比同排高一行

用户猜「是不是因为没有 label」——**就是**。`ListSearchCard` 的一格是「标签在上、控件在下」，
标签为空时那个 div 里没有行盒、高度塌成 0（`line-height` 对空元素不起作用），
控件就整整上移 19.5px。两处修：① `search-card.scss` 给 `.lc-field__label` 补 `min-height: 19.5px`
兜底；② 两个字段补上真名字（价格日期 / 统计月份）——没有名字的日期区间，用户也看不出它筛的是什么。

### 3. 操作按钮按功能分色

规范 5.4.1 只写了「常规蓝 / 删除红」，实现里却是**所有按钮都照抄 `type="primary"`**
（含 10 处「删除」），按 type 上色等于没上。改成 **`ListTableCard` 按按钮文案判定语义**：
删除类红 `#E34855`、取消·撤销·禁用类橙 `#ED8B18`、启用·确认类绿 `#0A9B62`、其余品牌蓝，
取值全部是规范里表格文字已有的颜色（`--zk-tag-*-text`），没用 Element 的一套。

- 文字取自 vnode：`el-button` 在 `default` 插槽，包在 `el-popconfirm` 里的（本仓「删除」几乎都是）
  在 `reference` 插槽，所以要往下钻一层；动态文案 `{{ row.status ? '禁用' : '启用' }}` 跟着当前文字走。
- 页面显式写 `danger/warning/success/info` 时以页面为准（`primary` 不算数，它是默认抄来的）。
- 上色必须压到按钮元素上：Element 的 `.el-button--primary.is-link` 自己写了 `--el-button-text-color`，
  元素上的值盖过外层继承来的；组件里原有的两条按 type 上色的 `:deep` 规则特指度也更高，
  所以语义色那条要再多一层类名（`.el-table__body .lc-act .el-button.is-link`）才压得住。
- 顺带把融资列表的「融资取消申请 / 预申请取消」从 `type="danger"` 改成 `warning`：它不是删除。
- 覆盖面：全仓 156 个操作按钮 → 蓝 102、橙 20、绿 17、红 17（另 8 个页面已显式指定）。

### 4. 进口采购单：操作栏被裁

按钮是「编辑 / 查看概览 / 详情 / 编辑附件 / 取消」，最宽的一组是
`编辑 + 查看概览 + 详情 + 更多 + AI 钮` ≈ 221px，而列宽给的是 190（组件抬到基准 202）——差一截，
被右固定列裁掉。按规范 5.4.1 规则 3「文案更长的页面自己加宽」改成 230。
顺带扫了一遍同类：代理订单（220，需 221）→ 230、站点列表（200，「二维码」三个字，需 209）→ 220。

### 5. 提单列表：操作栏右边一条空白

**不是操作列的问题，是整张表没铺满卡片。** 提单列表 10 列全写死了 `width`，
Element 的 `updateColumnsWidth` 只在「存在没写死宽度的列」时才把富余宽度分下去
（已从 element-plus 2.14.5 的 `table-layout.mjs` 逐行核过：无弹性列时 `bodyWidth = bodyMinWidth`），
于是表格只有各列之和（1722 ≈ 比 1790 的卡片窄 68）那么宽，右边空出一条：
表头底色和行分隔线都到不了卡片右缘，右固定列跟着浮在半空。
`ListTableCard` 在「一列弹性列都没有」时把非固定列的 `width` 降级成 `minWidth`
（不够宽时照样按这个值撑开横向滚动，有富余时由 Element 按比例分掉），列设置隐藏几列之后同理。

另外把操作列的 `justify-content` 从 `space-between` 改成 `safe center`：
稿里列宽是按内容量的，「贴列右缘」和「紧跟按钮」是同一件事；实现里列宽是常数，
常常比内容宽一截，再用 space-between 就在按钮和 AI 钮之间豁一个洞（提单列表富余 55px）。
`safe` 保证内容撑不下时退回左对齐，不会连左边一起裁掉。

### 验证与限制

- 本机没装依赖（依赖 555M、磁盘只剩 1.2G），跑不了 `npm run lint` / `vue-tsc` / 构建。
  改过的 7 个 `.vue` 用 `@vue/compiler-sfc` 单文件编译过（script setup + template 均通过），
  两段 SCSS 用 dart-sass 编译过，Element 的列宽算法是解包 2.14.5 的产物逐行核的。
- **没有在浏览器里看过效果**：像素级的留白、页签在卡头里的观感、四种语义色的实际观感待用户复核。
- 语义色是按**文案关键字**判定的，新按钮文案若不在关键字表里会落回品牌蓝（不会出错，只是不着色）。

## 2026-09-20 | 工作区（.app-main）竖向高度口径 + 滚动条藏起来

用户问「为什么很多列表页都有滚动条，是上下高度没算好吗？或者能不能像详情页那样把滚动条挪到可视区外」。
两件事都是真的：**有算错的，也有本来就该滚的**。

### 竖向预算只有三段

整屏 = 顶栏（顶栏 64 + 页签条 34 = 98）+ `.app-main` 自己的 20 上下留白 + 内容。
所以 1080 的屏幕上页面真正能用的是 **1080 - 98 - 40 = 942**。

### 算错的两类（都是常驻滚动条，滚动距离只有几十 px）

1. `.app-container`（`index.scss`，**14 个老页面**在用）写的是 `min-height: calc(100vh - 130px)`
   —— 比可用高度多 8px，于是内容再短也常驻一条滚动条。改成 `min-height: 100%`
   （百分比相对 `.app-main` 的内容盒，顶栏或留白改了不用跟着改）。
2. 首页 `.default-index-page` 与工作台 `.workbench-page` 写的是 `calc(100vh - 98px)`
   —— 那个数字不含工作区自己的 20 留白，多要 40px。同样改成 `min-height: 100%`。

### 顶栏 fixed 时的盒子算错了（设置面板可开，localStorage 持久化）

`.fixed-header + .app-main` 只给了 `padding-top: 98px`，高度仍是 `calc(100vh - 98px)` ——
盒子是 border-box，`padding-top` 已经让过一次顶栏，高度再扣一次等于**扣两遍**：
内容盒比可用高度少整整一个顶栏，屏幕底部还空着 98px 没有底色的带子。
改成 fixed 分支里 `height: 100vh` / `min-height: 100vh`。
（⚠️ `.hasTagsView .app-main` 与 `.fixed-header + .app-main` 特指度相同、靠顺序取胜，
所以 `height` 必须写在 `.hasTagsView .fixed-header + .app-main` 这条里才压得住。）

### 真列表页的滚动是正常的

10 行两行高的数据行 ≈ 840，加卡头 52、表头 42、分页 60，再加搜索卡 ≈ 90 —— 1100 上下，
942 的可用高度本来就放不下。这种滚动不该治，要治的是**那根条**：

`.app-main` 按详情页 `.flex-main` 的同一口径把滚动条藏掉
（`scrollbar-width: none` + `-ms-overflow-style: none` + `::-webkit-scrollbar { width:0; height:0 }`）。
它原本画在工作区右缘、压在 20 的留白上，还吃掉 6px 宽度（全局 `::-webkit-scrollbar` 给的），
卡片因此比设计稿窄 6px。藏起来后滚轮 / 触控板 / 键盘照常。
**表格内部的横向滚动条没动** —— 那条是「右边还有列没看到」的唯一提示；
`scrollbar-width` 不继承、`::-webkit-scrollbar` 只作用于元素自身，所以不会波及子元素。

### 验证与限制

- 依赖没装（磁盘只剩 1.1G），跑不了构建；`AppMain.vue` / 首页 / 工作台用 `@vue/compiler-sfc` 编译通过，
  `index.scss` 连整条 `@import` 链用 dart-sass 编译通过，编译产物里的 `.app-main` / `.app-container` 规则逐条看过。
- 顶栏与页签条的 64 / 34 是回源码核的（都是 border-box，1px 下边框已含在内），合计正好 98。
- **没在浏览器里看过**：藏掉滚动条后长列表的滚动手感、以及 14 个老页面改成 `min-height: 100%` 后的观感待复核。
- 顺手把 Hub 的 SFC 检查脚本教会了两件事：模板里的 TS 表达式（`as string[]`）要开 `expressionPlugins`、
  空 `<script setup>` 不算错误 —— 之前这两种都会报假错。

## 2026-09-20 | 顶部页签条按稿落地（node 6:10654）：选中样式一直没生效的原因是内联 style

用户指「`#tags-view-container` 就是顶部导航 tab 栏，选中样式不对」，给了 Figma 链接（node 6:10654）。
用 figma MCP 拉下来的就是规范 8 的「子系统切换行」，一字不差：

- 行：高 **46**、padding `0 22`、间距 8、下边 1px `#DCE7F3`（稿里这行**没有阴影**，`fills` 也是空的）；
- 页签（chip）：高 30、padding `0 12`、圆角 6、白底 + 1px `#DCE7F3`、字 12/18 Regular `#6B7D92`；
- **选中**：底 `#EDF5FF` + `linear-gradient(90deg, rgba(11,102,195,.11), rgba(28,200,255,.1))`
  + 1px `rgba(23,113,220,.35)` + 字 12/18 **Medium** `#1771DC`，尾部 `×` 是 11/19.5 Medium 同色。

### 选中样式为什么「不对」——**内联 style 压过了 CSS**

模板上挂着 `:style="activeStyle(tag)"`，`activeStyle()` 给选中项返回
`{ 'background-color': '#F1F2FF', 'border-color': '#F1F2FF' }` —— **内联样式压过任何 class**，
所以 scoped CSS 里写的 `.active`（`#eaf4ff` / `#2f7fe8` / 600）从来没生效，看到的是一块淡紫灰底。
删掉这个函数和 `:style` 绑定，选中态只由 `.is-active` 决定。

### 改法：页签复用全局 `.zk-chip`，不再另写一份

`zk/list-page.scss` 里的 `.zk-chip` 当初就是照这一行的 chip 做的（海关数据页的一级切换在用），
所以页签直接 `class="tags-view-item zk-chip"` + `:class="{ 'is-active': ... }"`，
组件里只留页签条特有的部分：行的尺寸/边框、滚动区占位、`×`、右侧「更多」、右键菜单。
`.zk-chip` 补了 `gap: 8px`（稿里 chip 内部文字与 × 的间距）。

⚠️ 一个坑：全局 `a { color: inherit }` 与 `.zk-chip` **同为一个类选择器、又排在它后面**
（`index.scss` 第 3 行就 `@import` 了 list-page.scss，`a` 规则在第 69 行），
所以未选中页签的字色必须在组件里补一遍，否则会继承容器色。

### 行高 34 → 46，顺手把两条栏高收进令牌

- 新增 `--zk-layout-navbar: 64px` / `--zk-layout-tags-view: 46px`（`design-tokens.scss`，只此一处）；
  `Navbar`、`TagsView` 读它们，`.app-main` 用它们做减法 —— 上一轮刚把 98 写进 `.app-main`，
  这一轮行高一改就会漏；菜单宽度当年就是这么错的（`--zk-layout-sidebar` 的由来）。
- `ScrollPane` 原来写死 `.el-scrollbar__wrap { height: 39px }`（34 的旧栏高 + 5px 把原生横条挤出视野），
  改成 `height: 100%` + 直接藏掉原生横条，`.el-scrollbar__view` 用 flex 居中、gap 8。
- `.tags-view-wrapper` 原来是 `width: 90vw`（整屏九成，没扣菜单也没扣 AI 抽屉），改成 `flex: 1; min-width: 0`。

### 顺手（同一组件内、明显偏规范的）

- 右侧「更多」：原来是 22px 灰图标 + 内联写死的旧主题色 `#1E65A5`，改成 12/18 品牌色文字链；
- 右键菜单：纯黑投影 + 4 圆角 → 卡片口径（圆角 8、1px `#DCE7F3`、`--zk-shadow-card`、hover 浅蓝）；
- 顶栏下边框 `#e5ebf2` → `--zk-border-card`（规范 8 是 `#DCE7F3`）。

### 验证与限制

- 依赖仍没装，跑不了构建。4 个改过的 SFC 用 `@vue/compiler-sfc` 编译通过，
  改过的样式块与整条 `index.scss` 用 dart-sass 编译通过，产物里的 `.zk-chip` / `.tags-view-container` 逐条看过。
- **没在浏览器里看过**：46 的行高、页签垂直居中、`×` 的位置与选中态观感待复核。
- 规范 8 标的顶栏是 76，实现仍是 64（不在本轮范围，令牌注释里写明了由导航负责人收口）。

## 2026-09-21 | 提单详情报错排查（用户未给报错原文）

用户只说「提单详情报错了」，没有控制台报错原文。排查过程与结论：

- 提单详情链路（`detail.vue` → `template/handleDetail.vue` → 六个 Tab 组件 + `DetailHeaderCard` / `StatusSwitch` /
  `AiResultCompare` / `BottomFixedBtnsBox`）13 个 SFC 用 `@vue/compiler-sfc` 全部编译通过 —— **不是模板/语法错误，是运行时**。
- `handleDetail.vue` 自身写得很防御（`?.` / `|| []` / try-catch 都有），`CargoInfo` 的 props watcher 也有判空。
- **确定会抛错的两处，已修（`a818871`）**：
  1. `SettlementInfo.vue` 的 `syncWithInspectionInfo`：`product_ingredients.value.find(o => o.value == v.ingredient).label`
     没判空。字典是异步加载的，价格接口也可能回字典里没有的成分编码 → `Cannot read properties of undefined (reading 'label')`。
     触发时机：**切到「结算信息」Tab 或点保存 / 移交仓储**（`coordinateDataSync` 会调它）。改成 `?.label ?? v.ingredient`。
     与队友 `fc90c3c`（融资详情 `options[0].value`）是同一类问题。
  2. `CustomsInfo.vue` 的 `showDialog`：`JSON.parse(item.containerNos / statusNode)` 没兜底，历史数据不是 JSON 时点开弹窗就抛
     `SyntaxError`。抽成 `parseJsonList`，解析失败按空数组。
- 顺带确认：队友 kimi 的 `chore: automated batch synchronization`（如 `5bce8a9`）会**删掉文件里的注释**
  （`StatusSwitch`、`ListTableCard` 各少了三十来行），只删注释、不动代码，与本次报错无关。
  ⚠️ 但这意味着**写在业务仓代码注释里的说明会被抹掉**，重要口径要同时写进 `DESIGN_SPEC.md` / README（这两类没被删）。
- **未确认这就是用户遇到的那一个**：已请用户提供控制台第一条红字报错 + 堆栈。

## 2026-09-21 | 详情页顶部信息卡：只在详情显示 + 全量补标题与副标题（`de8b086`）

用户口径：提单的「新建提单 / 查看与管理提单的全流程信息…」这块在新建、编辑时都不要，只有详情要；
其余模块的详情页也补上这块（标题 + 副标题），例：出库计划详情「查看与管理出库计划、关联提货单与计划出库货物明细」，其它自拟。

- **提单**：`<DetailHeaderCard v-if="+pageType === 3" title="提单详情" …>`，删掉只为新建/编辑服务的 `PAGE_TITLE` / `headerTitle`。
- **共用 `handleDetail.vue` 的 47 个页面**：在模板根节点下第一个位置插
  `<DetailHeaderCard v-if="+pageType === 3" title="XX详情" subtitle="…" />` + import（脚本批量插入：解析根节点开标签的
  结束位置、跳过引号里的 `>`；插入后逐个抽查、54 个改动的 SFC 全部编译通过）。`+pageType` 兼容路由里传进来的字符串。
- **只有详情、组件里没有 `pageType` 的**：金融产品（`financial-project`）无条件显示。
- **详情走自定义 `detail.vue` 的**：提货、帮助中心、小程序直接放；资讯详情原来是单根 `Collapse`，
  外面包一层 `div` 再放卡（保持单根——`AppMain` 外面有 `transition mode="out-in"`，多根会动画失效并告警）；
  贷后详情是按事项类型分发的壳，包一层 `div`，只在 `pageType=3` 时显示，标题带类型（「贷后详情 · 海运」）。
- **跳过两处**：国内采购订单（`deomestic-purchasing`）自带标题区（`trade-page-intro`，还是静态原型页），加了就重复；
  消息设置（`system/news`）是配置页、自带「消息设置」标题。
- **间距**：区块卡 `.collapse-box` 只有下边距，卡片紧贴第一块区块卡 —— 在 `zk/detail-page.scss` 里加
  `.zk-detail-header { margin-bottom: 12px }`，并用 `.zk-detail-header:has(+ .el-affix) { margin-bottom: 0 }`
  让紧跟 Tab 条的页面（提单、资产）不叠成 24。写在 `.zk-detail-page` 外面，自定义详情页也吃得到。
- 文档：`DESIGN_SPEC.md` 6.1 + 变更记录、`DetailHeaderCard/README.md` 约定。
- ⚠️ 未在浏览器里看过；副标题是按各页区块内容自拟的，全表在 Hub 的 iterations 里，供产品改字。

## 2026-09-21 | 工作区顶栏（.navbar）按稿落地（node 371:2852，`3fb5356`）

用 figma MCP 拉了节点 371:2852 并导出整条预览与四个图标（控制塔、新窗口、上下文箭头、头像下拉箭头）。

- **栏高 64 → 76**：只改令牌 `--zk-layout-navbar`。上一轮把栏高收进令牌就是为了这一步——工作区高度（`AppMain`）
  自动跟着减；另外发现侧边栏的弹出面板写死了 `--panel-top: 64px`（面板从顶栏下沿开始），改成读同一个令牌。
- **品牌区**：18/18 Bold `#29415C` + 12/18 `rgba(41,65,92,.6)`、间距 6、左边距 26。
  ⚠️ 规范 8 早先从整页稿扫的是 `#0B1F35` / `#6B7D92`，节点 371:2852 给的是 `#29415C` / 60%，按节点改并在规范里注明。
- **右侧一排**（统一 gap 28，稿里 24~34 不等）：AI 入口 48×48（稿里的投影是跟着图形走的，用 `filter: drop-shadow`
  而不是 `box-shadow`，否则画成方块；图还是仓库里那张会动的 `ai-logo.svg`，没换成稿里 1254×1254 的位图）
  ｜ 竖线 ｜ 控制塔：原来是浅蓝底描边的小按钮，改成稿里的文字链（20 图标 + 14 Medium 品牌蓝 + 16 新窗口图标，图标用稿里导出的路径）
  · 上下文切换框 326×40（`#EEF5FC` 底、1px `#DCE7F3`、圆角 9、14/19.5 Medium 品牌蓝、细线箭头）
  ｜ 竖线 ｜ 帮助中心 ｜ 竖线 ｜ 头像 32 圆（白描边 + 蓝色外发光）+ 用户名 14 + 20 下拉箭头。
- **帮助中心**：稿里没有这个按钮，但两条竖线之间正好空着一段——判断是给它留的位，保留并改成与控制塔同款的文字链（正文色）。
- 删掉若依遗留的一堆没用的样式（`breadcrumb-container` / `errLog-container` / `right-menu-sub-item` 等）。
- 规范 8 补全顶栏各元素规格，5.1 竖向预算改为 76 + 46 = 122，变更记录一行。
- 验证：三个 SFC 编译通过、样式块 dart-sass 编译通过；**未在浏览器里看过**，窄屏下右侧一排会不会挤（切换框 min-width 160）待看。

## 2026-09-21 | 顶栏复核返工：机器人图、帮助中心图标、图标居中（`142ef82`）

用户复核指出三处：机器人没换成稿里的、帮助中心左边的图标不对、控制塔右边的图标没上下居中；要求图从 Figma 直接下载用。

- **机器人**：上一轮保留了仓库里会动的 `ai-logo.svg`，嫌稿里原图 1254×1254 / 1.1MB 太大——这是我自作主张。
  改为用 figma MCP 按**节点渲染**导出（`pngScale: 2`）：得到 154×154、26KB，**投影已烘焙在图里**（48 的图四周各多 14.5）。
  放进 `src/assets/images/navbar/ai-assistant-2x.png`，显示 77×77、`margin: -14.5px` 把占位收回 48×48。
  （MCP 用 `imageRef` 下的是原始填充图；不带 `imageRef` 按节点导出才是按尺寸渲染的成品——以后要「稿里的图」走后者。）
- **帮助中心图标**：新旧两版顶栏节点（371:2852、1:12959）里都**没有帮助中心**，没有原件可导，
  按控制塔图标同一套画法重画（20×20、2.2 粗描边、圆角端点、跟随文字色）。已告知用户，若另有指定图标给节点链接即导出。
- **居中**：文字链里的 svg 改 `display: block`，`.navbar-link` 固定 20 高。
- **这次真的看了效果**：本机有 `~/.cache/ms-playwright` 的 headless Chromium，借用 `/pgdata/pg/work/.../playwright-core`（只读 import）
  把 `Navbar.vue` 的模板和样式抽成静态 HTML 渲染，量出各图标与文字的竖直中心都是 37.5（差 0px），并与 Figma 导出图逐段并排比对。
  坑：Vue 模板里合法的 `<span class="navbar-divider" />` 直接当 HTML 渲染会被当成开标签、后面元素全套进去——mock 里要先改成成对标签；真实页面不受影响。
  产物在 Hub `.codex-tmp/navbar-check/`（`compare.png`）。以后改纯样式可以照这个办法先截图再推。

## 2026-09-21 | 角色新增 / 编辑 / 详情按稿重做（`7f54f00`）

- **环境**：ssh · `feature-v1.8.4`（改前 pull = Already up to date；中途同事推了 `cd93267 更新UI`，只动 Navbar 与 auto-imports，不冲突）
- **稿**：353:387（新增）、353:1690（未关联系统）、353:1004（管理关联系统弹窗）；图标（展开/折叠箭头、搜索、关闭、勾/半选）都从 Figma 导出原路径。
- **文件**：`views/system/role/template/handleDetail.vue` 重写；新增 `permission-tree.ts`（纯逻辑）、`components/RoleCheck.vue`（16px 复选框）、
  `components/PermissionTable.vue`（工具条 + 树表）、`components/SystemManageDialog.vue`（弹窗，teleport 到 body，样式不带 scoped）。
  系统列表合并、菜单归一、小程序过滤那批辅助函数原样搬过来。
- **行类型判定**：叶子且 `menuType === 'F'` 算操作权限；没有 menuType 时看兄弟节点，兄弟全是叶子才算操作。有非操作子节点的是分组行，其余是页面行。
- **缩进**（从表格外框量）：一级分组 箭头 14 / 复选框 53 / 文字 86；二级 50 / 83 / 116；页面 147 / 181。更深的层按公式外推（`indentStyle`）。
- **提交**：`menuIds` = 勾满 + 半选节点的原始 id，外加顶层节点非 0 的 parentId；`systemId` 优先用角色数据里的原值。旧实现 `getMenuAllCheckedKeys`
  沿 parentId 往上找祖先时在「父级的 parentId 为 0」处停，**顶层 id 只有在它本身勾满时才会带上**——3 层以上只勾一部分会漏。新结果是旧结果的超集。
- **草稿**：`localStorage` 键 `zk:role-draft:<userId>:<new|roleId>`；与进入页面时一致就删草稿；恢复框「不恢复」删草稿，点 × 保留。
- **1px 口径**：Figma 描边画在框内不占位，CSS border 占 1px → 卡内边距要比稿上的读数少 1（右卡 `padding-left: 19`）。
  另外 Figma 子层累加会算上被父框裁掉的部分（基本信息卡子层合计 165，实际 163），以导出图实测为准。
- **坑**：全局 `ruoyi.scss` 的 `.el-dialog:not(.is-fullscreen){margin-top:10vh}` 与 Element 的 `.el-dialog.is-align-center{margin:auto}` 同权重、后加载，
  `align-center` 全站其实都不生效；这里用 `.el-dialog.role-system-dialog.is-align-center` 抬权重。Element 输入框 wrapper 的上下 1px 内边距不能清（清了只剩 38 高）。
- **验证**：四个 SFC 编译 + 样式块 scoped 编译通过；`.codex-tmp/sfc-render/`（vue 3.3.9 + element-plus 2.13.1 + esbuild，`build.mjs` 打真组件、`mocks/` 假接口按稿造树）
  渲染三种状态与 Figma 导出图叠图比对（`cmp-*.png`），横坐标逐像素一致；`test.cjs` 50 项交互自测通过、控制台无警告。
  没跑 vue-tsc / eslint（本机没装依赖），没连真实后端（`menuTreeList` 是否带 `menuType` 未知，没有就走兄弟节点兜底）。
- **与稿不一致**：「数据看板」只勾两项却画成全选 → 半选；7 个操作的行稿里 4+3 → 按宽度自动换行；页面名字重 400/500 混用 → 500；
  折叠箭头右偏 4px → 与展开箭头对齐；右卡稿宽 1517 比基本信息卡少 1px → 按栅格撑满，没抠；工作区上内边距稿 14、实现 20（全局，没动）。

## 2026-09-21 | DESIGN_SPEC 去掉「12. 变更记录」（`51e1b1d`）

- 用户：「DESIGN_SPEC.md 里面的 12. 变更记录就不要写到这个文档里面，按要求在这个统筹项目中记录了就行」。
- 整节 29 行按日期倒序搬到 `private/minerals-admin/logs/DESIGN_SPEC-变更记录.md`；规范里「末尾有变更记录」「10.4 在变更记录加一行」两处一并改掉。

## 2026-09-21 | 顶栏 AI 入口「小乾」眼睛跟随鼠标、悬停/点击台词（`aa1e974`）

- **用户**：「让它的双眼始终指向用户鼠标的移动位置……谨慎实现，我看看效果好不好，可能也会去掉；hover 或点击给些文案」。
- **抹眼睛**：原图（154×154）左眼约 x58–66 / y67–73、右眼 x78–87 / y68–74，面罩 x50–97 / y57–83。
  盒子 `[55,64,70,77]`、`[75,65,91,79]` 内每个像素取「左右边界横向插值」与「上下边界纵向插值」的平均；8 倍放大能看出很淡的边界，77px 显示看不出。
  工具脚本在 Hub `.codex-tmp/robot/`（`inpaint.cjs`、`preview2.cjs`）。
- **新眼睛**：SVG 两段「∩」（`M59.4 73.4V72.1A3.5 3.4 0 0 1 66.4 72.1V73.4` / `M80.3 74.3V72.9A3.45 3.4 0 0 1 87.2 72.9V74.3`），
  外层 `#2F8DFF` 3.8 粗 + 高斯模糊 1.3 做光晕，内芯 `#9FE3FF` 1.5 粗；原图核心色取样约 `rgb(170,235,252)`。
- **视线**：`reach = d / (d + 160)`，眼睛平移 `4×3`（原图单位 = 显示 2×1.5px），头 `perspective(240px) rotateY(±10°) rotateX(±8°)`。
- **性能口径**：passive `pointermove` + rAF 合并；只写 `--gaze-x/y` 两个变量；眨眼用 `setTimeout` 切类名（无限 CSS 动画会每帧重绘 SVG）；`document.hidden` 时跳过；`prefers-reduced-motion` 不挂监听。
- **气泡**：`.navbar` 是 `overflow:hidden`，只能 teleport —— 用受控 `el-tooltip`（`:visible`），`popper-class="ai-bot-bubble"`。
- **验证**：渲染台 `.codex-tmp/sfc-render/bot.html` + `bot-test.cjs` 11 项通过（尺寸、四个方向、600 次移动只写 2 次、悬停/移开/点击开关/2.2 秒收起、减少动态效果）；截图 `bot-montage.png`。未在真实整页里跑。

## 2026-09-21 | 小乾跟随幅度加大（`64129cd`）

- 用户：没感觉到头部转动，幅度大点。实测原参数下左转约 23°（`matrix3d` 的 cos≈0.918），平面图只是窄了 8%，不像转头。
- 观感主要靠**歪头**（`rotate(gaze-x × 10°)`）和**整颗头位移**（5px），转头加到 30° / 22°、透视 160px；眼睛位移 6×4（面罩内沿到眼睛左右余量 ≥6，不出界）。
- 变量：`--turn-y` `--turn-x` `--tilt` `--lean` `--eye-x` `--eye-y`，都在 `.ai-assistant-btn` 上；`reach` 改为 `d / (d + 100)`，离得不远也能用到大部分幅度。
- 坑：渲染台里用 `addStyleTag` 覆盖变量时，`.ai-assistant-btn{}` 权重低于 scoped 的 `.ai-assistant-btn[data-v]`，第一次对比图三档其实一样；改成三连类名才生效。

## 2026-09-21 | 上下文切换框宽度跟随文案（`782189b`）

- `AuthContextSwitcher.vue` 的 `.context-trigger`：`width: auto`、`min-width: 120px`、`max-width: min(480px, 100%)`。
  标签 span 本来就是 `overflow:hidden`，flex 最小尺寸按 0 算，收窄时能出省略号；外层 `.auth-context-switcher` 与 `.right-menu` 都是 `min-width:0`，窄屏会让它先收。
- 480 的由来：1366 屏减去菜单 88、左右 52、品牌区约 150、右侧其它项（AI、控制塔、帮助、头像、6 个 28 间距）约 650，剩约 420~450；1920 下给到 480 足够显示「系统 / 组织 / 角色」三段。
- 实测：Hub `.codex-tmp/robot/switcher.cjs`（`switcher-1920.png` / `switcher-1366.png`）。
- 规范第 8 节：切换框改写为「高 40、宽度跟随文案 120~480」；AI 入口那句原来还指向已删除的 `ai-assistant-2x.png`，改成去眼底图 + SVG 眼睛。

## 2026-09-21 | 小乾去掉跟随鼠标，改 8 秒循环待机动画（`225f838`）

- 用户决定不要跟随鼠标；要一段循环动画，时间我定，轻微跳动摇晃 + 眼神变化。
- 结构：`button.ai-assistant-btn`（悬停放大 1.06）> `.ai-bot__figure`（身体动画 `ai-bot-idle`，轴心 50% 80% 即脚下）> 去眼底图 + `.ai-bot__eyes`（眼睛动画 `ai-bot-look`，轴心为两眼中心 47.6% 46.4%）。
- 时间线（8s）：0–8% 静止；8–22% 往左看（身体 12% 左晃 -4°、上浮 2px）；25–28.5% 眨眼；36–46% 往右上看（37% 右晃 4°）；
  55% 蹲（1.05×0.93）→ 60% 起跳 -6px → 65% 落地回弹 → 69% 复原，57–64% 眼睛压成 0.6 当笑眼；76–86% 低头看；90% / 93% 连眨两下；84% 再轻晃一下。
- 之前避开「无限 CSS 动画」是因为动的是 SVG 里的 `<g>`（主线程重绘）；这次把眼睛包进 HTML 层、动画挂在 HTML 元素的 transform 上，合成线程跑。
  CDP `Performance.getMetrics` 静置 3 秒：RecalcStyleCount +0、LayoutCount +0、ScriptDuration +0。
- 测试脚本：Hub `.codex-tmp/sfc-render/idle-test.cjs`（用 `document.getAnimations()` 定格到指定毫秒截图）。

