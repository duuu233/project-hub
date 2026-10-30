# 菜单管理列字段设置入口

**2026-10-30 ssh dev 起的当前口径（覆盖下文 10-27 口径）**：只要菜单开启了「是否列表」（isList=1）就显示「列字段设置」，不看类型和名称。按钮类（F/B，页面下冗余的「XX列表」占位）点进去编辑的是**父级页面**的列字段，其余类型编辑自身（`columnTargetMenuId`）；独立页 `column-settings.vue` 不再只认 C。角色列级 `roleListMenuOptions` 用同一个 `columnTargetMenuId`，两边读写同一个 menuId。详见文末。

2026-10-27 ssh 起的当前口径：菜单管理列表行的“列字段设置”按钮，只给**页面菜单（C）且菜单名称包含“列表”**的行显示；目录（M）、按钮（F/B）以及名称不含“列表”的页面菜单都不显示。覆盖 2026-10-16“所有 C 页面统一显示、不依赖 isList”的口径。

- 判断函数 `showColumnSettings`（`apps/qianrong/src/views/system/menu/components/column-model.js`）：`menuType === 'C'` 且 `menuName` 含“列表”；按名称文字判断，不看“是否列表”isList 字段。
- 只收窄入口显示；按钮权限 `system:menu:edit` / `system:menu:detail`、跳转 `/system/menu/column-settings?menuId=` 与独立页七个接口均不变。独立页对直接访问仍只校验 C 类型，未加名称校验。
- 角色配置权限页的“列字段配置”是另一处组件，不受影响。
- 测试：`apps/qianrong/tests/menu-column-entry.test.mjs`（判断规则与模板绑定）。本机无 Node，未运行测试与构建，未浏览器验证。

## 2026-10-30 ssh dev：入口改按是否列表

- 现象（用户）：菜单管理「供应链金融运营 / 准入列表」下的「列表」没有列字段设置按钮。原因是旧规则 `showColumnSettings` = C 且名称含「列表」，该行是按钮类型；独立页也只认 C。
- 口径（用户）：开启了是否列表就显示。
- 改动：`config-audit/menu/components/column-model.js` 的 `showColumnSettings = isListMenu`，新增 `columnTargetMenuId`（按钮→parentId，其余→自身），删掉不再使用的 `isPageMenu`；`index.vue` 的 `openColumns` 跳到作用目标；`column-settings.vue` 去掉页面菜单校验，只核对菜单存在。`role-model.js` 的 `roleListMenuOptions` 改用 `columnTargetMenuId`（之前一律取父级，页面类列表现在作用在自身）。
- 影响：未开启是否列表的「XX列表」页面菜单不再显示入口；按钮占位与其父级页面若都开了是否列表，两行入口编辑同一份字段。已配在占位菜单编号上的历史字段（如有）不会再被读到。
- 测试：`tests/menu-column-entry.test.mjs` 重写（原文件仍引用已不存在的 `src/views/system/menu`，本身已失效），`tests/role-contract.test.mjs` 补页面类列表用例。无 Node，未运行、未构建 / 浏览器。
