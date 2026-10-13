# 泰乾超级当前背景

项目是泰乾德邦数字金融管理系统前端 Monorepo，用户名称为「泰乾超级」。qianrong 子应用简称「泰乾超级-qianrong」，目录为 apps/qianrong；qianlian 是另一独立应用。

根目录管理 Git 与 workspace；应用拥有各自入口、布局、路由和构建配置。packages 只接受向下依赖的共享代码，不能依赖应用。

qianrong 使用 Vue 3、Element Plus、vxe-table/vxe-pc-ui。公共搜索入口为 src/components/TableSearch；底部操作栏为 src/components/BottomFixedBtnsBox；各页面以 vxe-grid 的 gridOptions 配置提供列、工具栏和分页，保留该封装边界。

列表与详情规范的团队入口是 apps/qianrong/UI_DESIGN_SPEC.md。颜色、字体、尺寸及 Element 变量集中在 src/assets/styles/design-tokens.scss；列表视觉在 list-page.scss，详情皮肤在 detail-page.scss。34 个现有页面表单接入 qr-detail-page 和顶部标签，7 个负责模块的查看页使用 DetailHeaderCard；用户组/角色关联系统使用弹窗草稿和左右卡片，保留原生权限树与 DTO。配置辅助函数与实例测量指令在 src/utils/listGrid.js，行操作在 ListRowActions，工具栏标题在 ListToolbarTitle。继续使用原生 vxe-grid，不新增表格引擎包装。页面请求、参数、权限和回调由业务页面维护。

系统模块用 ListPageHeader 提供标题和页面级操作；菜单、日志及授权页面的现有 Element 表格使用 ListTablePanel 视觉外壳，保留原生 ref/事件。部门列表是 vxe 树表，不分页；六个旧编辑表单与分配角色页共用已有固定底栏。TableSearch 的可选 reset 回调负责页面专用重置后的查询，日期字段可提供 defaultTime。

负责模块及 PRD 与现状的差异见 docs/qianrong-owned-modules.md。登录/权限沿用原方案，菜单绑定暂留用户组，待后端接口完成后迁移系统管理；接口日志目前无独立页面与接口。验证期间禁止请求真实业务服务或发送 POST，使用隔离本地数据验收。

面向同事的公开规范和示例随 qianrong 提交：UI_DESIGN_SPEC.md（含详情接入代码）、LIST_PAGE_DEMO.md、src/examples/ListPageDemo.vue；npm run demo:list 使用独立开发配置打开 /list-demo.html，不加载登录或业务接口，不进入正式构建入口。个人中心资料默认查看、编辑可取消，密码取消清空；不改变既有认证校验。模块对照和移植边界见 docs/qianrong-design-standard.md。公开资料不得混入本地维护机制。

根 README 及 apps/qianrong/README.md、apps/qianlian/README.md 是团队维护入口。私人实施文档见 docs/README.md，技术和验收事实按当前源码更新。构建在 apps/qianrong 运行 npm run build，输出到根 dist/qianrong；没有单独的类型检查脚本。


2026-10-13 新接口文档已提供并完成初步只读对照：负责范围仍为 dh 的 13 模块，目标为 dev-qianrong 的 api-qianrong 服务。用户明确暂停，业务仍为 master/7d3dd63，现有代理地址未切换；模块路径、旧辅助请求与权限 DTO 待确认项和恢复步骤集中在 docs/qianrong-api-alignment.md。暂无构建、真实登录或接口联调结论，用户自行恢复前不继续开发。
