# qianrong 账户列表翻页参数、角色越界提醒（2026-11-12）

> ssh dev/95a30a5（用户未指定分支，按项目默认 dev）；同日用户追问后 cherry-pick 到 test/cd2fec5（无冲突）。

## 1. 账户管理列表翻页仍传第 1 页

- 原因：`user/index.vue` 的 getList 只展开 `queryParams`（初始化写死 `pageNum: 1, pageSize: 10`）和搜索条件，从没带表格分页器的 `currentPage / pageSize`；pageChange 改了分页器、请求参数不变。
- 改法：请求体在展开参数之后追加 `pageNum: gridOptions.pagerConfig.currentPage`、`pageSize: gridOptions.pagerConfig.pageSize`。
- 其它列表核对：带 `pageNum: gridOptions.pagerConfig.currentPage` 的 vxe 列表 19 个（加账户管理共 20），页码之后都没有再展开参数；通知公告把分页器同步进 queryParams；产品流程编排、部门、认证管理、资产管理、银行政策快照（全量拉取部分）为本地切页；第三方日志、日志清理、菜单 / 角色列字段、任务工作台、消息、在线用户、额度账本企业视图用 el-pagination 绑定 page 并在 current-change 重拉或本地切片。未发现第二处同类问题。

## 2. 角色列表越界标记（原未开发）

- 契约（dev Swagger 系统管理组，只读核对）：角色列表行字段 `unreadNoticeCount`（未读提醒数量）；`GET /system/role/notice/list` 只声明 `roleId`；`POST /system/role/notice/read` 体 `{ roleId, noticeIds: int64[] }`。
- 列表：新增列「越界标记」（field `unreadNoticeCount`）：>0 显示红色「N 条未读」可点，否则「—」；操作栏新增「查看越界」（权限借 `system:role:query`，菜单数据里没有专门权限字符，待后端确认）。列显隐仍受动态列字段配置控制（strict：后台列配置里没有 unreadNoticeCount 就不显示该列）。
- 弹窗 `RoleNoticeDialog.vue`：打开即 `notice/list?roleId&pageNum&pageSize`（分页参数 Swagger 未声明，后端不分页时本地切页）；列：系统、菜单、变更来源（0 用户组调整 / 1 系统调整）、阅读状态、提醒时间、阅读时间、备注。加载成功后把当前列表里 `readStatus !== '1'` 的 id 调 `notice/read`；成功则关闭弹窗时刷新角色列表的未读数，失败只提示不影响查看。弹窗内阅读状态保持打开时的样子（看得出哪些是这次新出现的）。
- 新增 `tests/list-paging-role-notice.test.mjs`。

## 验证

无 node：测试、构建、浏览器均未运行；新断言用 Python 对源码核对，模板配平、diff --check、信息隔离自查通过；未联调 notice 接口（id 按 JSON 原值回传，与全项目一致未做大整数处理）。

## 3. 账户管理列表去掉部门树、所属部门取 deptName（2026-11-12 ssh test/b0e9531，cherry-pick 到 dev/8973d51）

- 用户：列表页去掉左边的部门树，只保留列表；所属部门取行字段 `deptName`（如「产品部」）。
- 改法：删左侧 `container-left`（部门搜索 + el-tree）与 getDeptTree / filterNode / handleNodeClick / deptTreeSelect 导入及两栏样式，查询区与列表直接放在页面下（同其它列表页）；部门列 field 由 `dept.deptName` 改为 `deptName`、标题「所属部门」，单元格显示 `row.deptName`。按部门筛选（原点树带 deptId）随树一起去掉。
- 测试：list-paging-role-notice 补一条（无树、列取 deptName）。无 node 未运行；断言用 Python 核对，模板配平、diff --check 通过。
