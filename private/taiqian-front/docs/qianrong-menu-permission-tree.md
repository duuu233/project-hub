# 三模块菜单权限表

当前口径：2026-10-22 home，用户截图及本轮明确要求优先于同日早先的纵向目录树方案。系统管理、用户组管理、角色管理共用“权限名称 / 操作权限”两列表格；授权范围仍按系统→用户组→角色收窄。

## 样式来源与更正

- 正矿只读参考分支为 feature-v1.8.5，本轮先显式同名 pull 至 f24127be。实际读取 src/views/system/role/template/components/PermissionTable.vue、RoleCheck.vue、permission-tree.ts，并核实用户组使用同一 PermissionTable。
- 用户截图对应独立角色/用户组页面的权限表。此前选用了 role/index.vue 旧弹窗中的 el-tree，虽在同一分支，组件选取错误；其纵向按钮树已被本轮替换，早先 history 保留作追溯，不再作为当前样式要求。
- qianrong 沿用 JavaScript；复用表格模板、目录展开、复选框及视觉结构，颜色使用本应用令牌；不移植正矿的接口、系统编号或授权语义。

## 当前实现

| 入口 | 职责 |
| --- | --- |
| src/components/MenuPermissionTree/index.vue | 共用权限表、工具栏、目录展开、搜索与仅看已选；保留组件路径兼容三处调用 |
| src/components/MenuPermissionTree/PermissionCheck.vue | 从原角色目录移出的现有复选框，支持半选与键盘；关联管理弹窗仍复用它 |
| src/components/MenuPermissionTree/tree-model.js | 原受控勾选与父子联动；增加按类型/角色isOp投影目录行、页面行及横向操作 |
| all-system/components/SystemMenuPermissions.vue | 系统和用户组的 menuIds/readonly 适配，显式承接表单 flex 容器宽度 |
| role/template/components/PermissionTable.vue | 原叶子 Set/toggle 适配；未修改角色持久化模型 |
| all-system/system-menu-model.js、user-group/template/group-menu-model.js | 标准化和系统范围裁剪时保留 menuType，避免无按钮页面误作操作权限 |

## 展示与交互

- 顶部为“展开全部 / 全选全不选 / 仅看已选”，右侧搜索权限名称。表头“权限名称 / 操作权限”；展开目录跨整行浅蓝背景，页面名称在左，按钮权限在右横向排列并按空间换行。去掉旧树的已选数量及用户组额外提示行。
- 点击目录行或箭头只展开/折叠；勾选不触发展开；目录可通过 Enter/Space 操作。手动折叠后“展开全部”同步；搜索暂时展开匹配祖先，清空后恢复折叠偏好。
- 勾选目录/页面选择可操作后代，按钮独立勾选并补齐树内祖先。父级半选/全选按可操作子项判断，修复停用未选按钮使父项永远半选、第二次点击不能取消的问题；不可操作的既有勾选继续保留。
- 搜索匹配目录展示分支，匹配按钮保留祖先与页面。“仅看已选”与搜索取交集，不显示只命中未选按钮的空目录行。筛选、展开、初始化都不改变提交数组；仅有父ID的旧数据不自动授予后代。
- 详情/在途状态禁改勾选，搜索、展开和仅看已选仍可用。各系统草稿、撤权确认、失败阻断、原始ID类型、大整数精度及树外ID保护保持原模型。
- 保留系统→组→角色的来源和保存 DTO，不扩权。菜单上级授权、角色归属、后端鉴权及登录菜单缓存刷新仍需服务端联调，见[继承说明](qianrong-group-menu-inheritance.md)。
- 桌面参照正矿的456px名称列、47px行和182px操作项；名称列按面板宽度收缩，窄面板缩小缩进/名称换行，保持两列表达和页面无横向溢出。公共令牌新增 qr-permission-line/text/group-bg。

## 实际验证

- 40项 Node 回归通过：原32项保留，新增8项类型投影、目录/按钮搜索、筛选交集、折叠不改授权、角色元数据、两段类型传递及停用反选行为。
- 27组真实 Vue/Element Plus 隔离浏览器检查通过，含三模块表头/目录背景/按钮横排、键盘/鼠标展开、勾选半选、停用保护、批量操作、系统草稿隔离、关联管理弹窗、原DTO保存一致与详情只读；三模块2542/1920/1280/768四尺寸及新增用户组共13张截图已检查。
- 无运行时异常或真实外部业务请求。隔离路由缺省/保存返回未注册提示与原 el-radio label 弃用提示保留。
- 最终 qianrong 生产构建3.69秒通过；保留原登录资源路径、SCSS :export 和大包提示。无独立lint/type-check脚本。
- 未真实登录、写入任何系统/组/角色授权或部署。实施和交付见[本轮记录](history/2026-10-22-home-permission-table-alignment.md)。
