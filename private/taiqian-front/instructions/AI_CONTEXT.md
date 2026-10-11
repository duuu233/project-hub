# 泰乾超级当前背景

项目是泰乾德邦数字金融管理系统前端 Monorepo，用户名称为「泰乾超级」。qianrong 子应用简称「泰乾超级-qianrong」，目录为 apps/qianrong；qianlian 是另一独立应用。

根目录管理 Git 与 workspace；应用拥有各自入口、布局、路由和构建配置。packages 只接受向下依赖的共享代码，不能依赖应用。

qianrong 使用 Vue 3、Element Plus、vxe-table/vxe-pc-ui。公共搜索入口为 src/components/TableSearch；底部操作栏为 src/components/BottomFixedBtnsBox；各页面以 vxe-grid 的 gridOptions 配置提供列、工具栏和分页，保留该封装边界。

列表视觉集中在 qianrong 的 src/assets/styles/list-page.scss；配置辅助函数与原生实例测量指令在 src/utils/listGrid.js，行操作在 ListRowActions，工具栏标题在 ListToolbarTitle。继续使用原生 vxe-grid，不新增表格引擎包装。页面请求、参数、权限和回调由业务页面维护。

面向同事的公开示例和说明随 qianrong 提交：LIST_PAGE_DEMO.md、src/examples/ListPageDemo.vue；npm run demo:list 使用独立开发配置打开 /list-demo.html，不加载登录或业务接口，不进入正式构建入口。公开资料不得混入本地维护机制。

根 README 及 apps/qianrong/README.md、apps/qianlian/README.md 是团队维护入口。私人实施文档见 docs/README.md，技术和验收事实按当前源码更新。构建在 apps/qianrong 运行 npm run build，输出到根 dist/qianrong；没有单独的类型检查脚本。
