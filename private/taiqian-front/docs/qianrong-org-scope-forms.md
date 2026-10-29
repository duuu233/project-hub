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
