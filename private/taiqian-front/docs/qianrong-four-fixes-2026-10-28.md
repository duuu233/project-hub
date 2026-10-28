# qianrong 四项修正（2026-10-28 ssh dev/787dbff）

## 1. 企业用户管理：监管仓库不要银行类型

- 原逻辑：`orgType == '3'` 就显示「银行类型」（必填）。10-27 起企业用户类型改按字典 `org_type`，而 `ORG_KIND.WAREHOUSE` 也是 3，推测 3 在 `org_type` 里就是监管仓库，所以监管仓库被要求选银行类型。
- 改法：`showBankType` = 原条件 且 所选 `org_type` 标签不是「监管仓库」；按标签判断，不写死字典值。隐藏时提交体不带 `bankType`。
- 若字典 3 确为监管仓库，则银行类型在现有类型下不会再出现；后续若有「银行」类型需要它，按该类型的字典值改条件。

## 2. 操作日志 / 登录日志：分页与样式

- 原页面用 el-table + ListTablePanel + `<pagination v-show="total > 0">`，与其它列表页（vxe-grid + qr-list-grid）不同；分页器只在 total>0 时出现。
- 改为与角色等列表页一致的 vxe-grid：`withListGridStyle`、`v-list-grid`、pagerConfig 常驻（Total/Sizes/Prev/Number/Next/FullJump）、工具栏 ListToolbarTitle + 导出 + 刷新，列设置 / 全屏用表格自带 custom/zoom；新增序号列。
- 保留：TableSearch 搜索项、时间戳查询范围、导出地址与参数（含当前页码）、详情弹窗、LogWorkspace 三标签、权限指令。排序改 vxe 远程排序，参数仍为 `orderByColumn` + `isAsc`（ascending/descending），排序时回第一页。
- 去掉：「筛选」显隐按钮（其它列表页没有）、未用的多选状态、旧 ListTablePanel 列显隐的本地缓存键。
- 若后端返回 total 本来就缺失，分页器会显示「共 0 条」只有一页，需后端补 total。

## 3. 角色管理：所属企业下拉

- 根因：`/system/org/list` 行主键是 `id`，角色表单按 `item.orgId` 过滤，选项全被滤掉，有返回但选不了；编辑时企业详情同样按 `data.orgId` 比较，会报「所属企业信息不匹配」。
- 改法：进页面 `loadEnterprises` 调 `/system/org/list`（pageNum 1、pageSize 1000），`enterpriseOption` 统一成 `{ orgId, orgName }`（兼容详情包在 `sysOrg`）；已选企业不在列表时补查详情；选项值与表单 orgId 同类型以便回显。下拉改普通 filterable 选择，去掉 remote 搜索。草稿恢复改为在已加载选项里找企业。
- 未改：已有企业归属的角色编辑时仍锁定所属企业（既有口径「已有企业归属固定」）。企业列表加载失败时整页报错可重试。

## 4. 账户管理：账户类型 userType

- 新增/编辑/详情加「账户类型」下拉，必填，本地枚举 00 平台管理员 / 01 平台用户 / 02 企业管理员 / 03 企业用户；回填时转两位字符串；详情头卡显示名称。提交随整份表单带 `userType`。

## 验证

- 本机无 node / node_modules，未构建、未浏览器、未联调；改动文件标签与括号配对、`git diff --check`、信息隔离自查通过。
