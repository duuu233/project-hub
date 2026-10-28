# qianrong 账户密码（Base64）

2026-10-28 ssh dev/5ad9753。页面 `/organization/user/add`、`/edit`、`/detail` 共用 `views/organization/user/template/handleDetail.vue`。

## 口径

- 新增/编辑表单在「用户名称」后加「用户密码」，字段 `password`，`type=password` + `show-password` 眼睛切换明文，maxlength 20。
- 提交：有值时 `encode`（js-base64，与重置密码、个人中心改密一致）后传 `password`；编辑留空表示不修改，不传该字段。
- 回填：编辑/详情取 `getUser` 返回的 `data.password`，`isValid` 通过才 `decode` 成明文放进输入框，眼睛切换看到的就是原密码；不是合法 Base64（例如后端返回 BCrypt 哈希含 `$`）则丢弃不回填，避免把哈希当新密码再提交。
- 详情：有回填值才显示该项，用 `readonly` 而非 `disabled`（el-input 禁用时不显示眼睛）。
- 校验：新增必填；填写时 5–20 位、不含 `< > " ' \ |`，与列表「重置密码」同口径。
- 覆盖了 v08 契约矩阵「创建不手输密码，编辑不发送 password」的旧口径。

## 待确认

- 详情接口是否真的返回 Base64 的 password；若返回明文且碰巧是合法 Base64 字符，会被误解码成乱码。
- 编辑带 password 时后端是否按改密处理。

## 验证

- 本机无 node / node_modules，未构建、未浏览器、未联调；`git diff --check`、信息隔离自查通过。
