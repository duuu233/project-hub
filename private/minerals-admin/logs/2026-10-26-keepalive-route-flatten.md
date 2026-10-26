# 2026-10-26 ssh｜恢复路由拍平修复页面缓存

- 分支：feature-v1.8.5，起始 55ea33a（pull 已最新）。本机无 node / codegraph。
- 依据：同日排查（logs/2026-10-26-bill-affix-keepalive-analysis.md、docs/maintenance.md「页面缓存（KeepAlive）不生效」），用户确认按「恢复路由拍平」修复。

## 改动

`src/store/modules/permission.ts`：
- `generateRoutes` 的实际注册路由改为 `filterAsyncRouter(flattenRouteTree(cloneMenuRoute(routeTree)))`；侧栏 / 顶栏的 menuTree、`resRoutes` 原树不变。
- `flattenRouteTree` / `flattenPages`：每个模块根下的叶子页面（含 attachDetailRoutes 提上来的隐藏详情页）按深度优先顺序直接挂到模块下，path 用 buildRouteTree 算好的绝对 fullPath（外链保留原 path）；`Layout` / `ParentView` / 无组件的分组节点不再注册；带页面组件又有子级的节点保留自身页面（去掉 redirect），子级同样拍平。
- 不加分组跳转占位：`filterAsyncRouter` 会删掉无子级路由的 redirect，占位会变成既无组件也无 redirect 的非法路由；分组路径正常不可直达，模块根 redirect 仍到首个页面。

## 验证

无 node：未运行 `npm run type-check` / `npm run build`，未浏览器回归。回归要点见 docs/maintenance.md。

## 剩余

22 个无组件名页面、重复组件名 / 路由改名、后端 noCache 未处理，需后端实际路由名。

## 回滚

`rewriteRoutes` 改回 `filterAsyncRouter(cloneMenuRoute(routeTree))` 并删除两个函数。
