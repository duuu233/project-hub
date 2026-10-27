# 菜单管理列字段设置入口

2026-10-27 ssh 起的当前口径：菜单管理列表行的“列字段设置”按钮，只给**页面菜单（C）且菜单名称包含“列表”**的行显示；目录（M）、按钮（F/B）以及名称不含“列表”的页面菜单都不显示。覆盖 2026-10-16“所有 C 页面统一显示、不依赖 isList”的口径。

- 判断函数 `showColumnSettings`（`apps/qianrong/src/views/system/menu/components/column-model.js`）：`menuType === 'C'` 且 `menuName` 含“列表”；按名称文字判断，不看“是否列表”isList 字段。
- 只收窄入口显示；按钮权限 `system:menu:edit` / `system:menu:detail`、跳转 `/system/menu/column-settings?menuId=` 与独立页七个接口均不变。独立页对直接访问仍只校验 C 类型，未加名称校验。
- 角色配置权限页的“列字段配置”是另一处组件，不受影响。
- 测试：`apps/qianrong/tests/menu-column-entry.test.mjs`（判断规则与模板绑定）。本机无 Node，未运行测试与构建，未浏览器验证。
