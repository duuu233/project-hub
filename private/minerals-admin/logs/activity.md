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
