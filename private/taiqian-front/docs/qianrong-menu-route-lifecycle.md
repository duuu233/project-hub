# qianrong 菜单表单路由与请求生命周期（2026-10-26 推广到系统中心）

当前核验：2026-10-23 work，适用于菜单新增、编辑、详情共用的 `src/views/system/menu/template/handleDetail.vue`。

- 菜单表单只在自身路由路径且处于活动状态时加载，KeepAlive 停用期间不响应其它列表或其它实体的查询参数；不关闭全局页面缓存。
- 编辑、详情必须带单个正整数字符串 `query.id`；缺失、重复、非法编号在本页提示并禁止发起菜单列表/详情请求。大整数编号保持字符串，不做 Number 转换。
- 一次加载捕获本页 id、parentId 和 pageType。路径改变、缓存停用、卸载或编号改变时使旧加载失效；旧成功/失败响应不能回填表单或改变当前错误/就绪状态。请求已发送时不保证网络中止，现有请求拦截器的错误通知机制不变。
- 已成功加载且参数未变时，缓存返回保留草稿，不重复初始化；更换本页编号、失败后重新进入、未完成加载后返回或点击“重新加载”时正常重读。
- 新增只读取菜单目录与捕获的 parentId，不请求菜单详情。编辑/详情响应 menuId 必须与请求一致，否则阻断编辑。
- 离开页面后不再启动保存，旧保存完成不跳转其它页面，仍正确解除在途保存状态。新增/编辑的现有 DTO、确认和权限逻辑不变。

持久化回归：`node --test tests/menu-route-lifecycle.test.mjs`，执行真实 SFC setup、Vue Router 和 KeepAlive，以模拟 API 覆盖跨列表/跨实体、缓存、异常 ID、大 ID、竞态、旧响应、保存清理和新增父节点。完整回归为 `node --test tests/*.test.mjs`。

当次验证与边界见 [实施记录](history/2026-10-23-work-menu-route-lifecycle.md)。

## 2026-10-26 ssh：推广到系统中心全部页面

- 现象：点系统中心任意列表会调详情接口并报错。原因同 10-23：页面被 KeepAlive 缓存后，组件对全局路由 query / params 的 `watch(..., { immediate: true })` 仍生效，点其它列表即按别的页面参数（空编号或其它实体编号）重新加载。10-23 只修了菜单表单。
- 公共逻辑 `src/utils/ownRouteLoad.js` 的 `useOwnRouteLoad({ key, load, isReady })`：记创建时路由 path，仅当前路由仍是本页 path 且激活时加载；`key()` 与上次相同且 `isReady()` 时不重复加载；上次未成功时重新进入本页再读一次（视为再次触发）；停留在其它页面期间不重复请求、不重复报错。各页原有 load、编号校验和旧响应失效逻辑不变。
- 已接入：系统（all-system）、部门（dept）、企业用户（enterprise-users）、角色（role）、用户组（user-group）、用户（user）的新增 / 编辑 / 详情共用表单，菜单列字段设置（menu/column-settings，key=query.menuId），字典数据（dict/data，key=params.dictId，原 onMounted 首次加载并入），角色配置权限页（role/permissions，key=params.roleId，分配用户等其它带 roleId 的页面不再触发）。菜单表单保留 10-23 的专用实现。
- 回归：`node --test tests/own-route-load.test.mjs`（真实 Vue / Router / KeepAlive：点其它列表不加载、同编号返回不重载、换编号加载一次、失败仅再次进入时重试）。本机无 Node，未运行。

## 2026-10-30 ssh dev：菜单管理所有行都显示「新增」

- 需求：有些菜单没有新增按钮，不用限制，都放开。原先按钮类（F/B）行不显示「新增」，`handleAdd` 也直接返回，新增表单的上级菜单树会剔除按钮，选按钮作上级会被校验拦下。
- 改动：`config-audit/menu/index.vue` 行内「新增」去掉 `isButtonMenu` 条件，`handleAdd` 不再按类型返回；`template/handleDetail.vue` 的 `menuOptions` 只剔除自身及其下级，按钮也可作为上级，校验提示改为「不能选择自身或下级作为上级菜单」。权限标识 `system:menu:add` 不变；后端是否接受挂在按钮下的菜单未联调。
- 测试：`tests/menu-add-dept-parent.test.mjs` 源码断言。无 Node，未运行、未构建 / 浏览器。
