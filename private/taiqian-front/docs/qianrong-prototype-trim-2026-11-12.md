# qianrong 账户 / 企业表单按原型收字段，账户与角色列表去掉分配类功能（2026-11-12）

> ssh test/7d409c2（用户明确在 test 分支），同日合并到 dev（1bb7c16，`merge --no-ff test`，无冲突；同时带入 test 上 7f55b3b、244f3bc、9bfa240、174b694 四个提交）。
> 依据：产品 V0.9 高保真原型 S06 用户账号管理、S04 企业用户。

## 1. 账户管理列表去掉分配角色

- `user/index.vue`：删「分配角色」按钮、`handleAuthRole`、`handleCommand`；连带删掉不可达的旧编辑弹窗（`handleAdd` / `handleUpdate` 早已 `return` 走独立页，弹窗里还有角色多选）及其 form / rules / submitForm / 岗位、角色、地区选项。导入弹窗未动（无入口，与本次无关）。
- 删 `user/authRole.vue`、路由 `/organization/user-auth/role/:userId`、API `getAuthRole` / `updateAuthRole`（仅该页使用）。

## 2. 账号新增 / 编辑 / 详情（S06）

| 原型字段 | 表单 | 说明 |
|---|---|---|
| 所属企业（仅平台侧） | orgId | 原样；编辑已有企业时锁定 |
| 账号类型 | userType | 标签「账户类型」→「账号类型」；编辑时改了类型，提交前二次确认（BR-26） |
| 账户编号 | userId 只读 | 原「账号信息」区块并入基本信息 |
| 用户名 | userName | 必填，≤20，仅中文 / 字母 / 数字 / 下划线（去掉原 2~20 长度下限） |
| 手机号 | phonenumber | 必填 + 格式 |
| 角色 | roleIds | 选填，仍多选（原型 N─1，后端字段是数组，未改单选） |
| 部门 | deptId | 选填，可清空 |
| 邮箱 | email | — |
| 头像 | avatar | jpg/png ≤2MB；**编辑页不显示**（原型编辑页无头像），详情显示 |
| 备注 | remark | ≤200 字 |

- 去掉：用户昵称、用户密码、用户性别、状态、岗位、地区。编辑时这些字段按 `getUser` 原值带回（不再拆 / 拼 areaIds、areaNames），不会被清空；不发 password。
- 新建：`password = encode(手机号后 6 位)`（BR-07/08 初始密码，表单不再手输），`status='0'`（创建即启用），`nickName = userName`（顶栏显示用），`postIds=[]`。
- 覆盖了 [qianrong-user-password-base64.md](qianrong-user-password-base64.md)（10-28 加的密码输入 / 回填明文）；`decodePassword` 已删，重置密码仍走列表「重置密码」。
- 详情头卡标签同步：账户编号 / 用户名 / 账号类型 / 所属企业 / 部门 / 状态 / 创建时间（去掉用户昵称）。

## 3. 企业用户（S04）

- 基础信息：用户组、企业名称全称、企业类型（原「企业用户类型」，仍为 `org_type` 单选；原型是四类多选，需后端字段支持，未改）、统一社会信用代码（编辑页只读）、企业所在地区、详细地址。去掉**银行类型**（提交一律不带 bankType，同原隐藏时口径）。
- 工商信息：登记状态、成立日期、注册资本（万元）、实际控制人（原「实控人姓名」）、经营范围（≤500 字计数）。
- 法人信息（新区块）：法人代表（原「法人姓名」）、证件类型、法人证件号。
- 去掉：企业简称、法人联系电话、币种编码 / 名称、实控人联系电话、实控人身份证号（含 10-29 加的 18 位校验）。编辑时按详情原值带回（contractFields 未删）。
- 企业附件（原「企业证照」）：营业执照、法人证件照正面 / 反面（原「法人身份证」），区块移到银行信息之前，与原型顺序一致。上传规则未改（原型写仅 PDF ≤10MB，现为 jpg/png/pdf ≤5MB）。
- 银行信息：「银行账号」→「银行账户」，未加原型的 8~30 位校验。
- 列表：列标题企业类型 / 统一社会信用代码 / 状态，搜索「企业编码」→「企业编号」；列由后台列字段配置决定，「所属用户组」列（10-28 用户要求恢复，原型无）保留未删。

## 4. 角色管理列表

- 删「列字段配置」「数据权限」「分配用户」三个按钮及 openColumns / openScope；操作列宽 560 → 340。
- 删 `role/authUser.vue`、`role/selectUser.vue`、路由 `/organization/role-auth/user/:roleId`、API allocatedUserList / unallocatedUserList / authUserCancel / authUserCancelAll / authUserSelectAll；删列表专用的 `RoleDataScopeDialog.vue`。
- 保留：`RoleColumnDialog`（角色编辑 / 详情页仍在用）、配置权限页的行级（RoleDataScopePanel）与列级面板。

## 测试

user-profile（表单 10 个标签各一次、去掉的 6 个不出现、初始密码）、list-button-perms（角色三按钮与 role-auth 路由去掉、账户列表无分配角色、分配用户页已删）、role-permission-workspace（数据权限共用判据只留行级面板）按有意改动改写并注明。

## 验证

- 无 node：测试、构建、浏览器均未运行；改写后的断言、模板标签配平用 Python 对源码核对通过，diff --check、信息隔离自查通过。
- dev 既有问题（非本次引入）：c0beb06 新增的认证管理、资产管理静态列表让 `policy-columns.test.mjs` 的「标准列表 23 个且都 whenListColumnsReady」在 dev 上不成立（27 个文件，两页未接动态列），test 分支不受影响。
