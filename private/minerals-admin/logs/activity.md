# 正矿业务需求与变更流水明细

记录正矿前端由个人负责的所有需求、修复与技术改动。

---

## 历史记录（最新在最前）

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
