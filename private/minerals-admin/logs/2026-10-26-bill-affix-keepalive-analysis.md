# 2026-10-26 ssh｜提单固定 Tab 条遮挡页签 + 页面缓存失效排查

- 分支：feature-v1.8.5，起始 1c9e465（pull 已最新）。本机无 node / codegraph，按源码分析。

## 1. 提单新增 / 编辑 / 详情：滚动后页签条被遮挡（已改）

- 原因：`bill-lading-list/template/handleDetail.vue` 的 `el-affix :offset="84"`。顶栏 76 + 页签条 46（design-tokens `--zk-layout-navbar/--zk-layout-tags-view`，小屏 60+40），页签条占视口 76~122；本页滚动区 `.flex-main` 滚动后 Tab 条固定在 84，压住页签条。
- 改法：`.flex-main` 加 ref，offset 改为滚动区在视口中的顶边（挂载、keep-alive `activated`、窗口 resize 时重算，`useEventListener`）。固定后 Tab 条贴在滚动区顶部、页签条之下，保留工作区留白；原有 `.el-affix--fixed .tab-box` 半透明白 + 毛玻璃样式不变。页面过渡为水平位移，不影响测量。
- 验证：无 node，未跑 `npm run type-check` / 构建，未浏览器验证。
- 验收：新增 / 编辑 / 详情向下滚动，Tab 条停在页签条下方不遮挡；缩放到小屏断点同样；在其它页签切回提单后固定位置正确。

## 2. 页面缓存失效（只分析，未改）

结论写入 docs/maintenance.md「页面缓存（KeepAlive）不生效」：主因 baf8a3a（2026-09-18 菜单 2.0）去掉路由拍平，分组下页面经 `ParentView` 渲染，AppMain 的 keep-alive 只缓存 `ParentView` 而它不在 include 中；次因为 22 个无组件名页面、重复组件名 / 路由改名、后端 noCache。修复方向待用户决定。
