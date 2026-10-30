# 角色配置权限工作区

当前口径：2026-10-26 ssh，用户明确行级、列级、预览三个标签不是新功能，改接现有接口；功能权限标签仍为前端模型。配置权限已是独立页面（`permissions.vue`，`/system/role-permission/index/:roleId`），下文 work 静态版描述中的“弹窗”“行级五档”“列级演示三态”“合成样例预览”均已被本节取代。

## 2026-10-26 ssh 接口化（当前有效）

- **行级**：去掉“选择列表”与五档预设。就是角色列表“数据权限”按钮的功能：抽出 `RoleDataScopeForm`（getRole + `role/scopeList` + `role/deptTree/{roleId}` 读取，`PUT role/dataScope` 保存），列表弹窗 `RoleDataScopeDialog` 与本页 `RoleDataScopePanel` 共用。权限范围去掉标签以“本企业”开头的选项（按标签判断，不知道后端 key）；角色当前已是本企业时保留为禁用项显示，保存会提示重新选择。列表弹窗同样去掉了本企业（共用组件，两处一致）。面板暴露 dirty/busy，未保存切页签/离开仍走原确认。
- **列级**：就是角色列表“列字段配置”的功能：抽出 `RoleColumnConfig`（列表选择 + `RoleColumnWorkspace`；10-30 起选项口径见文末），`RoleColumnDialog`（列表/角色详情只读）与 `RoleColumnPanel` 共用；各操作即时保存，无 dirty。
- **预览**：选列表即调用本系统该列表的接口，多传 `previewRoleId`=当前页角色编号。菜单不存接口地址，故前端维护 `preview-sources.js`：菜单 component 路径 → 该页面现用的列表 API 函数（23 个，均为 GET + pageNum/pageSize；准入 admission 需 type 参数、在线用户走 system-service，未登记）。可选列表 = `roleMenuOptions` 里角色已授权且 component 在对照表中的页面（roleMenuOptions 选项新增 component 字段）。取第 1 页 20 条，按顶层非空字段数降序（同数保持原序）取 3 条；表头优先读该角色该菜单的列字段配置（`role/column/list`，失败退回接口字段名）。total 显示接口 total。
- **角色编号来源**：三个标签用 permissions.vue 在本页 load 时记下的 `roleId` ref，不直接绑 `route.params.roleId`，避免缓存页在“分配用户”等带 roleId 的页面激活时按别的角色重载（同 10-26 系统中心点列表调详情问题）。
- **未定/风险**：`previewRoleId` 只是前端多传的查询参数，后端是否已在这 23 个列表接口生效未核实；“当前系统”按本前端能调用的列表理解，未用登录上下文 systemId（刷新后 store.context 为空）。“本企业”按标签前缀识别。
- **验证**：ssh 无 Node，`node --test`、构建、浏览器均未运行；测试文件已按新口径重写（模型函数、共用组件、previewRoleId 调用、对照表页面存在、页签只认本页角色编号）。

## 来源与范围

- [S05最新原型](https://ul4w2yrkrq.feishu.cn/wiki/MRngwyI2Kilg9mkNfn5c9Gu6n9d)：浏览器可完整读取，页面标注V0.4.0 C3、生命周期段落V0.4.1；此前记录的飞书无法访问只代表当时现场。
- 四个Tab：功能权限、数据权限·行级、数据权限·列级、权限预览。保留当前后台蓝灰令牌和权限两列表格，不改共享包或qianlian。
- 配置权限为角色列表内的独立弹窗，头部展示所选角色身份；其权限、列表、字段、样例均独立静态模型，明确标识，不冒充所选角色真实权限。

## 当前交互

功能权限按系统切换，提供只读可选范围与权限表。行级按列表分别暂存全部数据、仅本人、本部门、本部门及下属部门、本企业五档，不展示规则状态表、恢复按钮或其状态流转。

列级按列表展示字段名称、编码、三态、脱敏方式和字段状态；新增字段默认不可见，失效字段禁用。批量作用于已选字段；未选择时明确作用于当前列表全部可配置字段，跳过失效字段。非脱敏策略清空方式，脱敏需选择FULL或KEEP_FIRST_LAST。

预览仅反映当前弹窗已暂存的演示配置。功能树只读、越界点以示例标识；数据预览有列表选择、示例命中数、3条合成样例与隐藏/脱敏/失效渲染。示例不是网关鉴权结果，不展示伪造ruleVersion。取消列表查询需确认，暂存后对应列表从数据配置与预览选项中移除，原演示配置保留；重新勾选可恢复。未暂存离开需确认，关闭重开全部重置，无localStorage及后台写入。

## 后续接口边界

已核对dev Swagger 300条路径：`system/role/dataScope`是角色整体范围，无列表维度；`system/role/column/*`六接口已存在，`user/groups/menuTreeList`是登录用户用户组可选树。未找到按列表保存五档行规则、指定目标企业权限上限以及同网关的功能/数据预览契约。局域网旧文档地址本轮8秒超时。用户要求静态优先后，新增四Tab不接这些接口，不把旧整体范围映射成按列表规则。

后续恢复接口工作需重新核对最新契约；不要直接将演示枚举、样例ID、命中数写入业务接口。既有角色/菜单API、表单、字段工作区本轮未改动。

## 验证

- `node --test apps/qianrong/tests/*.test.mjs`：55项通过，包含新增5组演示状态隔离、查询可选范围、批量作用域、隐藏脱敏、零业务接口/零持久化守卫。
- qianrong生产构建通过，既有Sass弃用/包体积提示保留，无独立lint/typecheck脚本。
- 真实Vue组件隔离浏览器验证四Tab、范围暂存、未保存提示、批量脱敏及预览联动、取消查询确认与选项收窄、关闭重置；合成环境请求记录始终为空。1280桌面、600与390宽度检查，窄屏卡片换列、Tab滚动、字段表横向滚动。
- 未真实权限写入、业务数据查询、网关联调或部署。详细交付见本轮history。

## 2026-10-29 ssh dev：列级标签页输入框无限变宽

- 现象：配置权限页「数据权限·列级」打开后，搜索栏输入框一直变宽，宽度有时来回跳。
- 原因：`RoleColumnPanel` 的外层是 `display:grid`，没有写列模板，隐式列按 `auto` 计算，宽度至少等于内容的最小宽度；这一层的 grid 子项也没有 `min-width:0`。而这一层里面有两个按自身宽度调整内容的公共组件：
  - `el-table` 按根元素宽度设定内部表格的像素宽度，这个宽度又成了内容的最小宽度；
  - `TableSearch` 用 ResizeObserver 按卡片宽度算列数，只有一个搜索项，所以输入框占 1/N 行。
  内容一变宽，这一列就跟着变宽，再也缩不回来；列数在阈值处跳变，所以宽度会来回变。
- 对照：同页「权限预览」也是 grid 包 `el-table`，但 grid 子项 `.permission-preview-card` 写了 `min-width:0`，不受影响；列表页和 `RoleColumnDialog` 里的同一组件，祖先都是普通块级元素，宽度不随内容变化。
- 修复：`.role-column-panel` 加 `grid-template-columns:minmax(0,1fr)`，列宽只由容器决定。公共组件和全局样式未改。
- 公共组件与全局样式的检查结论：
  - `TableSearch` 和 `ListTablePanel` 自身的样式没问题（`min-width:0`、`minmax(0,1fr)`、按钮宽度测量不回写自身），但它们都依赖「祖先宽度不随内容变化」。放进 grid 的 auto 列、没写 `min-width:0` 的 flex 子项、`inline-block` / `fit-content` 容器时，都会出现同样的问题。
  - `detail-page.scss` 的 `.qr-detail-page .el-table`（加边框、`width:100% !important`）也会作用到详情页里的列表组件；不是这次问题的原因，但列表样式会与列表页不一致。
  - 如要在公共组件里彻底防住，可以给 `.qr-search-card`、`.qr-native-table-panel` 加 `contain: inline-size`。代价是放进收缩包裹（shrink-to-fit）的容器时宽度会变成 0。共 30 处 / 8 处调用需要逐页确认，未做。
- 验证：无 Node、无浏览器，未构建、未复现；依据是上面的布局推理和同页预览标签的对照。

## 2026-10-30 ssh dev/b07b507：列级「列表」选项按是否列表过滤（用户明确）

- 口径（用户）：现在真实的列表页菜单都叫「XX管理」（C），其下会冗余一个类型为按钮、名为「XX列表」的占位菜单；列级下拉只列这些占位（是否列表=是），不要再列「XX管理」，但实际生效的仍是它的父级。
- 改动：`role-model.js` 新增 `roleListMenuOptions`——取 `isList=1` 的启用菜单（不限类型），父级在启用菜单中存在，且父级或占位本身在角色该系统授权的 menuIds 里即可选；同一占位跨系统去重。选项显示「系统 / XX列表」，带 `targetMenuId`=父级。`RoleColumnConfig` 改用它，选中后 `getMenu(父级)` 并把父级交给 `RoleColumnWorkspace`，`role/column/*` 的 menuId 都是父级；去掉「仅支持 C」的校验。下拉标签、空状态文案改为「列表」。
- 影响：列级标签与角色列表 / 角色详情的「列字段配置」弹窗共用此组件，三处一致。权限预览仍用 `roleMenuOptions`（已授权 C 页面 + 对照表），未改。
- 已处理（同日后续）：入口改为按是否列表显示，目标规则统一为 `columnTargetMenuId`（见 qianrong-menu-column-entry.md）。原待确认：菜单管理的「列字段设置」入口仍是「C 且名称含『列表』」（见 qianrong-menu-column-entry.md），按新的命名，父级「XX管理」不含「列表」、占位又是按钮，入口可能哪一行都不显示；字段定义若需挂在父级上，需另行调整该入口。
- 测试：`tests/role-contract.test.mjs` 加 roleListMenuOptions 用例（授权父级 / 授权占位 / 停用父级 / 未授权）与源码断言（Python 核过正则）。无 Node，未运行、未构建 / 浏览器 / 联调。
