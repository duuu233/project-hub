# 部门、用户、角色的所属企业（按账户类型）

2026-10-29 ssh dev/4df38d0。

## 后端口径（用户转述）

- 部门、用户、角色都必须有所属企业；非平台账户取默认登录的企业，可以不选。
- 角色必须选用户组。
- `GET /system/role/optionselect`、`GET /system/user/` 新增可选 `orgId` 筛选。
- 平台 = 平台管理员 00、平台用户 01；非平台 = 企业管理员 02、企业用户 03。按**当前登录账户**的 userType 判断（`userStore.userType`），不是表单里「账户类型」的值。

Swagger（dev，本轮只读拉取）：`SysDept`、`SysUser`、`SysRole` 都有 `orgId`；`/system/dept/list`、`/system/user/deptTree` 已有 `orgId` 查询参数；`/system/role/optionselect` 与 `/system/user/` 的 `orgId` 当时 Swagger 尚未体现，按用户说明对接。

## 前端改法

- `utils/userProfile.js` 新增 `isPlatformUserType`（00/01 为 true，其余含空值为 false）。
- 当前登录企业：`utils/auth.js` 新增 sessionStorage `qianrong-login-org-id`（与 `qianrong-user-type` 同样的存法）；user store 加 `loginOrgId`。来源顺序：默认授权 `defaultAuthorize` 的 `context.orgId` → 切换身份 `changeLogin` 的 payload `orgId` → 都没有时 getInfo 的 `user.orgId` 兜底。登录、退出时清空。
- 共用 `views/organization/org-options.js`：`loadOrgOptions(selected)` 同角色表单口径（`/system/org/list` 全量、主键 id → orgId、已选不在列表补查详情、选项值与表单同类型）。角色表单原有的 `loadEnterprises` 未改。
- **部门**：平台账户显示必填「所属企业」；上级部门改为 `listDept({ orgId })` 按企业取，未选企业只有「无（一级部门）」，换企业时上级不在新企业里就重置为一级；列表「新增下级」进来时按上级部门详情的 orgId 预填企业。编辑时原有企业锁定。非平台不显示、仍 `listDept()`，payload 不带 orgId（编辑沿用详情里的）。`department-model` 原本已透传 orgId、并校验上级同企业，未改。
- **用户**：平台账户显示必填「所属企业」；归属部门 `deptTree?orgId`、角色/岗位 `GET /system/user/?orgId` 按企业取，未选企业时为空；换企业清掉不在新企业里的部门、角色、岗位。编辑时原有企业锁定，选项按详情 orgId 取。非平台不显示，新增仍 `GET /system/user/`、编辑仍用详情返回的 roles/posts。
- **角色**：平台账户不变（企业、用户组都必选）。非平台隐藏所属企业，新增（或旧角色没记企业）时 `form.orgId` = 登录企业，用来调 `getUserGroupsListByOrgId`；用户组仍必选；取不到登录企业时页面报「未取到当前登录企业，无法加载用户组，请重新登录后再试」。不调企业列表，详情头不显示所属企业；草稿恢复跳过企业选项校验。payload 仍带 orgId（等于登录企业）。
- `role/optionselect?orgId` 本轮没用上（用户表单的角色选项走 `GET /system/user/?orgId`），未加 API 包装。

## 待确认 / 未验证

- getInfo 是否返回 `user.orgId`、是否等于当前身份企业：只作兜底，未核实。sessionStorage 按标签页，新开标签页只能靠 getInfo 兜底。
- `GET /system/user/?orgId` 返回的 roles/posts 是否按企业过滤、`/system/user/deptTree?orgId` 是否生效，待联调。
- 本机无 node，未构建、未跑测试（新增 `isPlatformUserType` 用例在 tests/user-profile.test.mjs）、未浏览器、未联调。

## 2026-10-29 ssh dev：企业 id=0 视为有效（用户明确）

- 背景：后端初始化的企业 id=0，原先所属企业相关判断沿用 `validId`（0 = 没有），id=0 的企业在角色 / 部门 / 用户的「所属企业」下拉里被过滤掉，登录企业为 0 时也存不进 sessionStorage。下拉本身从未按 `esignAuthStatus` 过滤（`/system/org/list` 也没有该入参）。
- 改动：`role-model.js` 新增 `validOrgId`（0 有效，只排除空值 / 非整数 / 丢精度），所有企业主键判断改用它：`org-options.js`（部门、用户共用下拉与补查已选）、角色表单（下拉、补查、用户组按企业加载、非平台取登录企业、编辑时锁定所属企业——原 `!!originalOrgId` 对 0 不成立）、`rolePayload` 校验、角色列表 / 权限页企业名兜底、部门表单（上级部门树、锁定、提示）、用户表单（锁定、部门 / 角色 / 岗位按企业加载）；`utils/auth.js` 登录企业读写正则放行 0；准入页 `EnterpriseSections.vue` 已选企业回显与 `handleDetail.vue` 补查企业附件改为判空而非真值判断。
- 不变：部门上级 0（一级部门）、角色、用户组、系统、菜单等其它主键仍用 `validId`，0 表示「没有」。
- 测试：`tests/role-contract.test.mjs` 加 `validOrgId` 用例与 orgId=0 可保存。无 Node，未运行、未构建 / 浏览器 / 联调。

## 2026-10-29 ssh dev/9613bb3：账户类型平台大于企业 + 账户表单合并冲突修复

- 打包失败根因：同事合并提交 ea81b0f（test 分支 fc0cd17 合 dev d2a01cf）在 `user/template/handleDetail.vue` 有两处冲突，解冲突时把「用户密码」`el-form-item` 截断未闭合，丢了账户类型 / 用户性别 / 状态 / 岗位四个字段，角色 / 头像 / 地区重复了一份（模板 el-col 14 开 13 闭）。Vue 模板编译会因缺结束标签报错，`vite build` 失败。用户贴出的 `DEP0169 url.parse()` 只是 Node 运行时的弃用警告，不会让构建失败；项目源码里没有调用 `url.parse`（全仓 grep 只有 `node:url` 的 `fileURLToPath`），来自依赖，本机无 node_modules 未定位到具体包。想去掉可在流水线设 `NODE_OPTIONS=--disable-warning=DEP0169`（Node ≥ 21.3），未改构建脚本。
- 修复：按 merge-base 3e150bd 用 `git merge-file --ours` 重算三方合并（冲突取 test 侧，即同事的格式化版本），再把 d2a01cf 的 `validId→validOrgId` 三处补回；脚本部分与 ea81b0f 完全一致，只差模板。该合并其余 10 个文件逐个重算，与 ea81b0f 一致，无问题。本次拉下来的其它 .vue 粗查标签配平，差异均为 prettier 的 `</el-button\n>` 写法，不是错误。
- 账户类型：`utils/userProfile.js` 新增 `assignableUserTypes(loginUserType)`，平台账户（00/01）四种都能选，非平台（02/03）及未知类型只能选 02 企业管理员 / 03 企业用户。账户表单 `userTypeOptions` 改为 computed，编辑的账号已是平台类型而登录的是企业账户时，把该项追加为置灰选项只回显；详情头改用 `userTypeLabel`。企业管理员与企业用户之间未做高低限制（用户只提了平台大于企业）。
- 测试：`tests/user-profile.test.mjs` 加 `assignableUserTypes` 用例，以及账户表单各字段只出现一次、主要标签配平的源码断言（用 Python 按同样规则对修复后的文件核过：配平；对 ea81b0f：el-col / el-form-item 各少一个闭合）。无 node，测试未运行、未构建 / 浏览器 / 联调。

## 2026-10-30 ssh dev：部门编辑「上级部门」有值仍提示「上级只能选择一级部门」

- 原因：`dept/template/handleDetail.vue` 的 `load()` 先把详情写进 `form`（含 parentId），再去请求部门树。el-select 监听 modelValue 变化即按 `change` 触发表单项校验，这时 `tree` 还是空的，`checkDepartmentParent` 在 map 里找不到上级，返回「上级只能选择一级部门」；树加载完不会再校验，提示一直挂着。页面被缓存时，换一条记录进入也会残留上一次的提示。
- 改动：`fetchTree(orgId)` 改为传参；`load()` 先在局部 `next` 里拼好表单（详情、「新增下级」带入的企业与上级），树和企业选项返回后与 `form` 同一刻赋值，再 `nextTick` 后 `clearValidate()`。校验规则本身（只能挂一级部门、不能自身、含下级不能移、同企业等）不变。
- 另一种可能未改：上级下拉列的是 `tree.roots`（在当前列表里找不到父级的部门），校验要求上级的 parentId 为 0。若某企业的顶层部门 parentId 不是 0（例如挂在列表外的部门下），会出现下拉能选、校验不过；需要时再按真实数据确认。
- 测试：`tests/menu-add-dept-parent.test.mjs` 源码断言（树就绪前不写 form、同刻赋值、clearValidate）。无 Node，未运行、未构建 / 浏览器 / 联调。

## 2026-10-30 ssh dev/e8bea29：角色表单用户组 id=0 视为有效（用户明确）

- 现象：角色新增「用户组」下拉没有「平台运营组」（YHZ01，后端初始化数据，id="0"，status 0）。
- 原因：`loadGroups` 用 `validId` 过滤下拉选项，validId 把 0 当「没有」；同样的判断还在编辑回显补选项、按用户组取菜单树（`menuTreeList`）和权限区提示文案三处，选了 0 也会被当成未选、菜单树为空。
- 改动：`role-model.js` 新增 `validGroupId`（同 validOrgId，0 有效），角色表单上述四处改用它；validOrgId 注释同步，「用户组 0 = 没有」的旧说法删除。角色、部门上级等其余主键仍用 validId。
- 核对：企业用户表单的 userGroupIds 走 `normalizeGroupId`，本就放行 0；用户组模块按 query.id 判断，"0" 为真值，不受影响。
- 测试：`tests/role-contract.test.mjs` 加 validGroupId 用例与源码断言（Python 核过正则匹配）。无 Node，未运行、未构建 / 浏览器 / 联调；id=0 的用户组能否作为角色归属保存以后端为准。
