# qianrong 组织与权限空值显示「-」

> 2026-11-12 ssh；test/d1a49dc，cherry-pick 到 dev/d5960b3。依据：用户要求「组织与权限」下各页面数据为空时显示「-」占位。

## 范围

侧栏「组织与权限」下四个页面：企业用户、账户、部门、角色。每个页面都覆盖列表和详情。

## 口径

- 什么算空值：`null`、`undefined`、空串、纯空白、空数组。`0` 和 `false` 不算，照常显示。实现见 `src/utils/emptyCell.js` 里的 `EMPTY_CELL`、`isBlank`、`orEmpty` 和 `detailPlaceholder`。
- 列表：`withListGridStyle` 新增 `emptyCell` 选项，只有这四个列表传了 `EMPTY_CELL`。
  - 选项只作用于没有插槽的数据列：没有格式化器的显示 `cellValue`，有格式化器的取其结果，为空就显示「-」。
  - `setListColumns` 换上动态列（policyColumns，单元格用 `policyCell`）后同样生效。
  - 插槽列由各页模板自己补：
    - 账户：用户名称、昵称、类型、部门、手机号、创建时间。
    - 部门：负责人；状态为空时显示「-」，不渲染 dict-tag。
    - 角色：状态、创建时间、越界标记。
    - 企业用户：所属用户组、企业类型、状态（不是 0 / 1 时显示「-」）。
  - 原来的「—」「--」统一改为「-」。
- 详情（`pageType=3`，只读表单）：
  - 头卡 `DetailHeaderCard` 新增 `emptyText` 属性，默认仍是「--」，其它模块不受影响；这四个详情页传「-」。
  - 表单控件的 placeholder 用 `ph(text)`：详情页返回「-」，新增 / 编辑页仍是原来的输入提示。
  - 企业的工商 / 法人信息、附件、银行信息组件新增 `emptyText` 属性：附件为空时显示「-」，不传时仍是「暂无附件」。
  - `AreaCascader` 新增可选 `placeholder` 属性，企业详情传「-」。
  - 账户详情没有头像时显示「-」，不再是上传组件的「暂无上传」。
  - 企业编辑页「系统信息」里的「--」改为「-」。
- 角色：越界提醒弹窗的空值、配置权限页「权限预览」表格单元格（`previewCell`）都改为「-」。

## 未改

- 区块级空态保持原文案：角色详情「暂未关联系统」、表格整表无数据的「暂无数据」。
- 个人中心（`user/profile`）不在「组织与权限」菜单下，仍是「--」。
- `roleStatusLabel` 对未知值仍返回「未知状态（—）」。列表在状态为空时已经显示「-」。

## 验证

本机无 node，测试、构建和浏览器都没跑。新增 `tests/org-empty-cell.test.mjs`，`role-permission-workspace` 测试断言同步改为「-」；源码类断言已用 Python 核对，`git diff --check` 和信息隔离自查通过。
