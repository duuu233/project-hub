# qianrong 列表、搜索与固定底栏

本轮按正矿的现行设计规范、列表需求流水和 dh 提交落实共用视觉要求。技术入口与面向同事的接入说明以业务应用 `LIST_PAGE_DEMO.md` 和实际源码为准；本文件记录维护边界和验收口径。

## 封装边界

- 保留原生 vxe-grid：页面拥有列、数据、分页、事件、ref、列设置及全屏，不新增第二层表格包装，不转发实例方法。
- 升级原有 TableSearch 和 BottomFixedBtnsBox；新增轻量 ListRowActions、ListToolbarTitle 和原生配置/测量辅助函数。
- qianrong 原 41 个 Vue 文件中 42 处 vxe-grid 接入视觉规范，39 处 active 插槽使用行操作组件；部门树表不分页。2026-10-12 又有 34 个页面表单接入详情统一皮肤，负责模块逐项对照见 qianrong-design-standard.md。首页旧 el-table 接入通用卡片/搜索视觉。
- 不改 qianlian、共享 packages、API 模块或接口字段；不虚构通用关键词、AI 功能、自动保存状态或后端能力。

## 视觉与行为

- 品牌蓝 1771DC、正文 29415C、标题 0B1F35、边框 E2EBF5，工作区浅色渐变；卡片圆角 16、阴影 0 3px 3px rgba(16,51,91,.035)、卡片间距 12。
- 思源黑体同源字形子集以派生名 Qianrong Sans 随应用分发，保留版权与 OFL；字形及可变字重等 19 张表与原资产一致，仅修改命名/校验表，避免依赖系统是否安装字体。字体约 2.29MB，font-display: swap，生僻字系统回退。
- 搜索标签在上、13px 加粗，控件高 40 / 圆角 9，按钮高 38 / 圆角 9；搜索和重置在最右且与表格原生工具按钮右边缘一致。重置为白色描边，搜索为品牌蓝。
- 按卡片宽度选择 1/3/4/5/6/7 列的基准，再扣除按钮空间，以普通输入至少 200px 收紧列数。主区一行、溢出自动进入高级区，advanced 强制折叠，span 支持占两列，小于 600 视口按钮换行。以实际宽度而非屏幕硬塞固定列数。
- 选中条件可移除，0 是有效值；禁用字段的标签不可清除。重置恢复所有配置项的初始值，包含未挂载的折叠项，复制保留 Date；不改变未声明字段。日期区间对应 searchProps，开始 YYYY-MM-DD HH:mm:ss、结束当日 23:59:59，清空时一起清空。
- 列表标题显示路由名称/指定标题和真实 total；继续使用页面原有新增、导出与原生列设置、全屏。列原有 align 保留，操作表头居中/正文靠左；非固定数据列全部写死宽度时转换为 minWidth，以填满可用宽度，序号和固定列不参与。
- 权限/v-if 过滤后前三项直显，恰好三项没有更多；额外操作保持原按钮与 popconfirm 的事件，不直接触发确认函数。权限指令提供 isAllowed，隐藏项不占数量。显式按钮 type 优先，普通文案识别删除红、取消/禁用橙、启用/确认绿，其余蓝。
- 当前页按位置取按钮最大实际宽度，采用共享网格轨道对齐行间按钮；真实测量结果加间距与内边距调整原生列宽，最小 80，空数据保留原配置宽度。没有 field 的 active 列补 __qr_actions 作为视觉定位字段；不更改接口参数。ResizeObserver/MutationObserver 在卸载清理，字体加载后重测。
- 表格横向滚动使用原生独立滚动结构，不给 body 引入横向溢出；固定右列使用原生机制。顶层预付款预警标签与表格共用卡片背景。
- 超宽内容上限 3360 并居中；实际侧栏宽度 220 / 54 / 0。固定底栏 min-height 66、间距 9、按钮 38、绿色主提交、白色描边返回，按钮左边缘随内容居中；主滚动区域留 86，嵌入模式 sticky 继续沿用原有行为。

## 维护与验证

### 系统模块的特殊列表补齐（2026-10-11）

负责模块与需求边界见 `qianrong-owned-modules.md`。这轮以正矿 `feature-v1.8.5 / f152a42` 为准，补齐此前普通 vxe-grid 之外的菜单树、日志、授权列表和个人中心。

- `ListPageHeader`：标题默认取路由菜单名；页面传副标题和回退标题，页面级新增放 actions 右侧。
- `ListTablePanel`：只服务保留原生 Element 表格的特殊列表；提供卡片、标题/真实总数、列显隐/恢复/本地保存、全屏/Escape及行操作测量。原表格 ref、树、排序、选择和分页仍由页面管理，不用它再次包 vxe-grid。
- 部门使用 vxe 原生树，deptId 为行键，children 为树子项，24px 缩进，默认展开，卡头显示所有节点数；树列表关闭分页。
- 六个旧表单及账号分配角色补现有固定底栏；个人中心的按钮留在卡内，不使用固定栏。
- 菜单权限归属暂不改变。当前缺少接口日志页面，登录页不属于本轮列表改造。

本轮详细验证和交付见 `history/2026-10-11-qianrong-owned-module-ui.md`。

颜色、尺寸与字体集中维护 design-tokens.scss，列表规则在 list-page.scss，详情布局及控件在 detail-page.scss；公开规范为 UI_DESIGN_SPEC.md。搜索内边距 13/14/12，卡头 52、分页 60，行操作 12px 常规，首数据列匹配重要编号时加粗；strong 可显式控制。接入新列表按公开说明使用原生组件，保留页面真实业务函数。框架升级后检查原生 DOM 类名和 setColumnWidth/getColumns 行为，特别是操作列测量、分页、列设置和全屏。

推荐八种桌面验收尺寸：1280×720、1366×768、1440×900、1536×864、1920×1080、2560×1080、3440×1440、5120×1440。桌面检查主输入宽度、两栏右边缘、body 溢出、固定列按钮、侧栏状态和底栏遮挡；详情嵌入模式另核对 sticky 和原有隐藏按钮规则。

## 列按接口返回字段渲染（2026-10-30 ssh dev/308a36f，用户明确）

- 口径（用户）：所有列表有一份初始列配置；接口返回了某个 key，值为空（null / 空字符串 / 空数组）表示业务数据为空，照常展示；没有返回这个 key 表示该字段因权限被隐藏，该列直接不渲染。菜单管理这类特殊列表不需要遵循。
- 范围：24 个用 `withListGridStyle` 的 vxe-grid 标准列表。按本文「系统模块的特殊列表」一节，保留原生 Element 表格、走 `ListTablePanel` 的 8 个特殊列表（菜单管理、第三方日志、日志清理、授权用户 / 待授权用户、用户分配角色、菜单 / 角色列字段工作区）不接入；同节的部门树（vxe 树表）也按特殊列表处理，写 `responseColumns: false` 关闭。详情页内嵌表格、弹窗表格不在范围。
- 实现：`src/utils/responseColumns.js` 放判断（返回字段 = 当前行数据 Object.keys 的并集；无行返回 null 不判断；`type` 列、`active` / `__qr_actions` / 插槽 active 的操作列不参与；嵌套字段按首段判断；列可写 `responseKey` 字符串 / 数组 / false；分组表头子列全隐藏则整组去掉）。`withListGridStyle` 把 `data` 定义为访问器：页面照常 `gridOptions.data = rows`，setter 存到不可枚举的 `__qrRows` 并按返回字段重算 `columns`（隐藏集合不变时不重赋，避免每次重载列）；空数据保持上一次的列。被过滤的列不传给 vxe-grid，列设置里也没有。`listGrid` 指令测量操作列时比对列对象，列重新加载后重新设宽。
- 为什么不在请求层打标：曾考虑在响应拦截器给每行挂 Symbol 记录原始 key（可穿透 `{...row}`），但会作用到全部接口、影响深比较；改为约束「行数据保持接口原样」，只有两个页面往行里补过字段，改成 formatter。
- 页面改动：角色列表不再往行里补 orgName，「所属企业」改 formatter（null 仍显示「企业 {orgId}」，没返回 orgName 就整列隐藏，不拿 orgId 兜底）；准入列表不再补 areaName，「地区」改 formatter，`responseKey: ['provinceCode','cityCode','areaCode']`；企业链「阶段进度」来自另一个接口，`responseKey: false`；流程定义「结构」按 `nodeTypeSeq`。`updateTime || createTime` 这类兜底列按列自身字段严格判断，未加 responseKey。
- 风险：列 field 与接口 key 不一致的列会被误隐藏（已逐页核对 24 页字段，只发现上述 4 处派生列，未对照真实响应）；首屏先显示全部列、数据回来后再收起；以后新页面若往行里补字段，补的字段会被当成已返回。
- 公开说明写在 `apps/qianrong/README.md`「列表列按接口字段展示」。测试 `tests/response-columns.test.mjs`（规则、分组、withListGridStyle 赋值与透传、页面源码断言，Python 核过正则）。无 Node，未运行、未构建 / 浏览器 / 联调。

## 列设置：原生显示/隐藏、拖拽排序与本地持久化（2026-11-03 ssh dev/1b09a7c，用户明确）

- 需求（用户）：① 列表都是 vxe-table，用官网的列设置控制列是否展示；② 所有列的展示顺序支持手动拖拽，并本地持久化（浏览器缓存或更好的方式），下次进入仍按用户调整的顺序展示。
- 现状核对：24 个标准列表全部经 `withListGridStyle`，工具栏早已 `custom: true`；vxe-table 4.21.10 默认 `customConfig` 就是 allowVisible / allowSort / showSortDragButton，面板本身能勾显隐、拖排序，但没配 `id` 与 `storage`，刷新即丢。源码依据（unpkg 只读下载到 `.codex-tmp/vxe/`）：`es/table/src/table.js` 的 `restoreCustomStorage` 在每次 `handleInitColumn` 都执行（因此 responseColumns 重赋 columns 后仍会套用存储）；存储键 `VXE_CUSTOM_STORE`，按 `_v === getConfig().version` 校验，vxe 升级即作废；列键 `column.getKey()` = field 或 `type=xxx`；`handleCustomStoreConfig` 里 `storage: true` 会把未声明项（含 pager）默认全存，所以用对象形式并同写 `storeOptions`（storeOptions 覆盖 storage）。
- 实现：`listGrid.js` 在工具栏开着列设置时统一追加 `columnConfig.drag: true`、`columnDragConfig { trigger: 'cell', showIcon: false, disabledMethod: type 列 }`（整格拖表头不加图标；固定列 vxe 本身不允许拖；拉列宽手柄 mousedown 已 stopPropagation，不冲突），页面传 `id` 时 `customConfig.storage = storeOptions = { visible, sort, fixed, resizable }`（不存分页条数，避免与页面 queryParams 不一致）。页面自己的 columnConfig / columnDragConfig / customConfig 优先。表头拖拽结束 vxe 自己调 `saveCustomStore('update:sort')`，面板点确认同样落盘，「重置」清存储。
- 「更好的方式」：没有后端保存接口，按 localStorage；但存储 id 带登录用户编号 `qr-list:<id>@<userId>`（`setListGridOwner` 由 main.js 注入 `useUserStore().id`，listGrid.js 保持不依赖 store 以便 node 测试直接导入），同浏览器换账号各存各的，也和各账号的字段权限不同相匹配。以后若要跨设备，可用 vxe 的 `restoreStore` / `updateStore` 接后端，接口需后端提供。
- id：24 页按 views 目录路径（如 `config-audit/notice`、`organization/dept`）；DefListPage 用 `config-audit/workflow-def/${props.kind}`，AdmissionTable 用 `supply-chain/admission-list/${props.type}`（两类列不同，分开存）。
- 风险 / 已知：① 因权限被 responseColumns 去掉的列不在 sortData 里，之后该列再返回时按初始序号插回，位置可能与用户期望不同；期间用户再保存会覆盖掉它的旧位置。② 用户编号在页面 setup 时取，若不重新挂载就切账号会沿用旧键（现有退出流程会整页重载，未实测）。③ 表头 `trigger: 'cell'` 与远端排序（日志页 sortConfig trigger cell）同在表头：点击仍是排序，按住拖动才换位，未浏览器实测。④ 用户列表首屏 data 为空，首个有数据的响应才确定列，存储在每次列重载时套用。
- 公开说明：`apps/qianrong/README.md`「列设置与本地记忆」。测试 `tests/list-column-custom.test.mjs`（配置合成、用户键、页面覆盖、24 页 id 存在且不重复、main.js 注入；正则用 Python 核过）。无 Node，测试 / 构建 / 浏览器均未运行。

## 列表列按生效列字段配置动态渲染（2026-11-03 ssh dev/5439e32，用户明确）

- 需求（用户）：所有列表的列字段动态获取——调菜单列表接口过滤出「是否列表」的列表菜单，按路由匹配拿到 menuPerm，调 `/api-qianrong/system/menu/column/policyColumns?menuPerm=`（previewRoleId 可选，不传按登录角色），动态渲染列，然后再调原来的列表数据接口。合并口径用户选「接口定列，复用页面渲染」。
- 实现：`utils/policyColumnsModel.js`（纯函数：menuFullPath / listMenuTargets / findListMenu / mergePolicyColumns / policyCell）+ `utils/policyColumns.js`（listMenu 每会话按 token 缓存一次、失败记为空不重试；currentRouteInfo；applyPolicyColumns）；`listGrid.js` 把列状态挪到 WeakMap（raw 原始列 / all 生效列 / signature），新增 listBaseColumns、setListColumns（替换后按已有行重算 responseColumns）、setListColumnSource / listColumnsReady / whenListColumnsReady（来源失败直接放行），`policyColumns: false` 关闭；main.js 注入 applyPolicyColumns；permission store 的 filterAsyncRouter 把字符串组件路径存进 `route.meta.view`（routes 里 component 会被替换成加载函数，否则拿不到）；24 页首次加载改 `whenListColumnsReady(gridOptions, getList|load)`（user/index 是 setup 顶层调用，dict/data 在 loadContext 里 await）；api 加 policyColumns。
- 匹配：isList=1、status≠1、perms 非空；F 按钮列表作用在父级页面（与 10-30 列字段口径「按钮占位 → 页面」一致），C 作用在自身；路由路径（matched 末项 path 或 route.path）= 菜单完整路径优先，其次 meta.view = 菜单 component；多个取 orderNum 最小。
- 合并：HIDDEN 与未配置的列不显示；fieldCode 依次按 field、responseKey、嵌套首段、末段对应页面列，沿用格式化 / 插槽 / 宽度、标题换 fieldName（空则保留原标题）；对不上的新增纯文本列（minWidth 140，数组用「、」拼、对象 JSON）；type 列在前、操作列在后，responseKey: false 的列保留在数据列后。无配置 / 无匹配 / 失败 → 保持原列。responseColumns 过滤与 vxe 列设置存储照常作用在合并结果上。
- 风险 / 待确认：① `system/menu/list` 后端若要求 system:menu:list，没有菜单管理权限的用户取不到 → 全部列表保持原列，且请求拦截器会弹一次错误通知（会话内不重试）；若是这样，需要后端放开或在 getRouters 里带 isList / perms。② 准入列表一个路由下按类型分多张表，若各类型各有列表菜单，目前都取 orderNum 最小的那个，需按真实菜单确认。③ 列 field 与 fieldCode 命名不一致又不符合上述四种对应时会变成纯文本新列、原列消失（未对照真实配置）。④ 字典数据（dict/data）等前端内置隐藏路由没有 meta.view，只能靠路径匹配。⑤ 首屏多两个请求的等待时间。
- 测试 `tests/policy-columns.test.mjs`。无 Node，未运行、未构建 / 浏览器 / 联调。

### 2026-11-03 ssh dev/25efecc：用户反馈没看到 policyColumns 调用

- 原因（代码推断，未拿真实菜单数据核对）：5439e32 只有匹配到列表菜单才调接口，匹配失败静默返回。可能的漏洞：① 按钮类型只认 F，系统里还有 B（column-model.js isButtonMenu = F/B），B 类「XX列表」被当成页面自身，组件匹配必然失败；② 菜单完整路径与路由路径前缀层级不一致（如多一层系统根）时路径匹配失败；③ 列表菜单 perms 为空被直接过滤；④ 菜单列表失败被缓存成空数组，整个会话都不再调。
- 改动：listMenuPage——F/B 从上级开始，往上找最近的真实页面菜单（C 且组件不是 Layout/ParentView/InnerLink/空）；menuPerm 取列表菜单自身 perms，空则用页面 perms；findListMenu 依次：完整路径 → 组件 → 路径末段（取两边较短的段数比较）→ 页面菜单名 = 路由 meta.title；菜单列表只缓存成功结果；开发环境（import.meta.env.DEV）控制台输出 `[列表列字段]` 原因，没匹配时列出所有候选列表菜单的名称 / 类型 / menuPerm / 页面路径 / 组件，方便对照。
- 仍未做：页签缓存切回不重新挂载，不会重新调 policyColumns。
- 同日后续 dev/d5b543b（用户口径）：「菜单接口里的那列表其实是占位用的，应该找它的上一级」「进入对应列表，获取对应的权限标识，拿这个字段调 policyColumns」「权限标识是空的才找它的上一级」。改为：isList 菜单一律视为占位，页面 = 它的上一级（上一级不是真实页面再往上找），不再把 isList 的页面菜单当自身；menuPerm = 占位自身 perms，为空取直接上一级 perms，再空取最近页面菜单 perms。测试数据改成「页面 + 占位」结构。
- 测试 policy-columns 补两例。无 Node，未运行。

## 无权限页面进 401、公告信息按权限显示（2026-11-03 ssh dev/5439e32，用户明确）

- 404（用户）：「检查下有这个按钮就行」——404 页本有「返回首页」（router-link /，守卫转 firstAccessiblePath(addRoutes)），未改；「现在没有这个路由会返回到 404，其实应该返回到 401，做一下判断」。
- 实现：`utils/routeAccess.js`（isNotFoundRoute 认 catch-all `/:pathMatch(.*)*`；viewPagePaths 由 import.meta.glob 键得到页面地址，排除 error/login/register/redirect 与 components、template 子目录；isKnownPagePath）；permission.js 在路由已就绪分支、`/` 之后加判断：未匹配且已知页面 → `next('/401', replace)`。已知页面 = `src/views/<路径>(/index).vue` 存在，或命中 dynamicRoutes（用内存 history 的探测 router 解析，带参数正则，如 role-permission/index/:roleId(\\d+)）。首次加载分支 `next({...to})` 会重入守卫，因此同样生效。
- 局限：依赖「菜单路径 = 视图目录」，菜单 path 与目录不一致的页面仍判 404；地址恰好对应某视图文件但不是菜单页面时会判 401。
- 公告（用户第 5 点）：右上角「公告信息」需 system:notice:list，Navbar `v-if="!isEmbedded && canViewNotice"`，canViewNotice = auth.hasPermi（含 *:*:*），没权限不渲染也不请求公告；分隔线保留。
- 测试 `tests/route-access.test.mjs`、policy-columns 末例。无 Node，未运行。

## 起止日期列拆成开始 / 结束两列（2026-11-03 ssh dev/e61d620，用户明确）

- 问题（用户）：所有涉及起止日期的列表，开始日期这一列取值有问题，是不是拼了结束日期；应只要开始日期，或合并成一列「开始至结束」。
- 原因：三处列 field 只写开始字段，formatter 却拼了区间——融资方案「有效起止日期」field=startDate、`start ~ end`；授信管理「授信期限」field=startDate、`start 至 end`；银行政策快照「合作期限」field=validFrom、`from 至 to`。按 policyColumns 动态渲染后，接口配置的 startDate（fieldName 如「开始日期」）匹配到这一列，沿用拼接 formatter，显示成整段区间。
- 选择：用户给的第一种「只要开始日期」——开始、结束各一列（有效开始 / 结束日期、授信开始 / 结束日期、合作开始 / 结束日期），toDateText，空显示 --。没选合并成一列：动态列按单字段配置，合并列会让配置里的 endDate 再生成一列纯文本，或标题与内容不符。bank-policy-snapshot 删除不再使用的 periodText。详情页、版本对比里的「有效起止日期 / 授信期限」不在列表范围，未改。
- 测试 tests/date-range-columns.test.mjs（源码不拼接、两列存在；mergePolicyColumns 两字段各对应一列）。无 Node，未运行。

## 富文本字段在动态纯文本列里显示成文字（2026-11-03 ssh dev/e1d81b2，用户明确）

- 问题（用户）：通知公告列表「公告内容」展示的是带 HTML 标签的内容，兼容一下渲染出来。
- 原因：通知公告页 columns 里没有 noticeContent；「公告内容」是 policyColumns 配置的 fieldCode 对不上页面列、由 mergePolicyColumns 新增的纯文本列，policyCell 原样 String 输出编辑器存的 HTML。
- 改动：policyColumnsModel 新增 htmlToText（像 HTML 才处理：去 script/style 及内容、注释，br 与 p/div/li/h*/tr/blockquote 结束处留空格，去标签，还原常见命名实体与 &#数字; / &#x十六进制;，合并空白）；policyCell 对字符串（含数组元素）走它。作用于所有动态新增的纯文本列，页面自带列不受影响。
- 选择：单元格显示纯文本、不 v-html——行高会被段落和图片撑开，项目无 DOMPurify 等净化依赖，有注入风险。如需按富文本样式查看，可另做「查看内容」弹窗（NoticeMessage 详情已用 v-html）。
- 测试 policy-columns 新增一例（Python 按同规则核过期望值）。无 Node，未运行。

## 只按接口渲染列（2026-11-03 ssh dev/866b4f5，用户明确，测试阶段）

- 口径（用户）：先屏蔽兜底的写死列数据，都按接口返回渲染，序号和操作不变，用户要测试。
- 改动：main.js `setListColumnSource(applyPolicyColumns, { strict: true })`；listGrid 记 columnStrict，withListGridStyle 在走动态列（byPolicy 且有来源且 strict）时首屏 columns = fixedPolicyColumns（type 列 + 操作列），raw 仍存页面全部列；policyColumns 合并时 `{ unrelated: !strict }`——字段对上页面列仍沿用渲染，responseKey: false 的无关列不保留；没匹配到列表菜单、无配置、菜单 / 策略请求失败都停在只有序号与操作列。policyColumns: false 的特殊列表（菜单管理）不受影响。恢复兜底把 strict 改 false。
- 测试 policy-columns 补一例并改入口断言。无 Node，未运行。

## 页面切换慢、有留白：与正矿对比分析（2026-11-03 ssh，仅分析未改）

- 用户：每次切换页面时间长、有留白，正矿切换丝滑很多，先不急着改。
- 主因（读码判断，未实测）：AppMain 过渡写法不同。qianrong `<router-view v-slot><transition name="fade-transform" mode="out-in"><keep-alive>…` 把 transition 放在 router-view 插槽内，路由切换真的走 out-in：旧页先播 .25s 离场（opacity→0、右移 30px），播完才挂新页；进场类名用的是 Vue 2 的 `.fade-transform-enter`（Vue 3 应为 `-enter-from`），进场没有动画——观感就是「淡出 → 空白 → 突然出现」。正矿是 `<transition><router-view v-slot>…</router-view></transition>`，transition 的直接子节点是 RouterView 本身、路由切换时不变，过渡实际不触发，新页直接替换，所以显得丝滑。两边 transition.scss 完全相同。
- 叠加因素：① 今天的列表动态列让标准列表首屏要先等「菜单列表（会话首次）+ policyColumns」再发列表请求，期间表格没有 loading，strict 模式下数据列也要等配置回来才出现；② 接口字段过滤（responseColumns）在数据回来后会再重载一次列，表格重排一次；③ 首次访问页面的路由组件是懒加载 chunk，需网络请求（两边同为 import.meta.glob；正矿有 manualChunks 拆 vendor 便于缓存，qianrong 用默认拆分 + vite-plugin-lazy-import 按需引 vxe 样式，开发环境首次进页编译更明显）；④ 守卫每次跳转只做 syncSsoSystemContext / refreshListOnReturn 等轻量判断，不是瓶颈。
- 建议（待用户决定）：去掉 out-in（改 mode 默认或直接去掉 transition，或照正矿写法），预期即可消除大部分留白；列表等列配置期间给 loading，并把 policyColumns 与列表请求并行；可选：build 加 vendor manualChunks。
- 同日后续 dev/bfb7dda（用户选建议 1）：AppMain 去掉 `<transition name="fade-transform" mode="out-in">`，router-view 插槽内直接 keep-alive + getKeepAliveShell 外壳（页签缓存匹配不变）；transition.scss 的 fade-transform 样式保留未删（无其它引用）。建议 2（等列期间 loading、列配置与数据并行）、3（vendor 拆包）未做。测试 tests/route-switch-no-transition.test.mjs。无 Node，未运行、未浏览器验证。
- 同日后续 dev/48b77ac（用户选建议 2）：whenListColumnsReady 改为列配置（listColumnsReady）与 load 并行，Promise.all 都结束才 resolve 并返回 load 结果；withListGridStyle 对走动态列的列表把 loading 定义为访问器（页面写入存 __qrLoading，listColumnsReady 期间 __qrColumnsLoading=true，表格读到二者之一为真即 loading；按 columnsToken 只让最后一次结束清标记）。数据先到时按当前列渲染（strict 下只有序号 / 操作 + loading 遮罩），列配置到后 setListColumns 按 __qrRows 重算隐藏。页面无需改动（无页面拿 loading 做防重入，只有日志 / 角色刷新按钮用它显示转圈）。测试 policy-columns 重写并行用例。无 Node，未运行、未浏览器验证。建议 3（vendor 拆包）未做。
