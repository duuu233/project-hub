# 泰乾超级当前背景

项目是泰乾德邦数字金融管理系统前端 Monorepo，用户名称为「泰乾超级」。qianrong 子应用简称「泰乾超级-qianrong」，目录为 apps/qianrong；qianlian 是另一独立应用。

根目录管理 Git 与 workspace；应用拥有各自入口、布局、路由和构建配置。packages 只接受向下依赖的共享代码，不能依赖应用。

qianrong 使用 Vue 3、Element Plus、vxe-table/vxe-pc-ui。公共搜索入口为 src/components/TableSearch；底部操作栏为 src/components/BottomFixedBtnsBox；各页面以 vxe-grid 的 gridOptions 配置提供列、工具栏和分页，保留该封装边界。

列表与详情规范的团队入口是 apps/qianrong/UI_DESIGN_SPEC.md。颜色、字体、尺寸及 Element 变量集中在 src/assets/styles/design-tokens.scss；列表视觉在 list-page.scss，详情皮肤在 detail-page.scss。34 个现有页面表单接入 qr-detail-page 和顶部标签，7 个负责模块的查看页使用 DetailHeaderCard；用户组/角色关联系统使用弹窗草稿和左右卡片，保留原生权限树与 DTO。配置辅助函数与实例测量指令在 src/utils/listGrid.js，行操作在 ListRowActions，工具栏标题在 ListToolbarTitle。继续使用原生 vxe-grid，不新增表格引擎包装。页面请求、参数、权限和回调由业务页面维护。

系统模块用 ListPageHeader 提供标题和页面级操作；菜单、日志及授权页面的现有 Element 表格使用 ListTablePanel 视觉外壳，保留原生 ref/事件。部门列表是 vxe 树表，不分页；六个旧编辑表单与分配角色页共用已有固定底栏。TableSearch 的可选 reset 回调负责页面专用重置后的查询，日期字段可提供 defaultTime。

负责模块及 PRD 与现状的差异见 docs/qianrong-owned-modules.md。登录/认证沿用原方案。2026-10-15用户已确认菜单及权限从用户组迁移到系统管理，接口已支持，但实施已暂停、源码尚未迁移；旧“等待后端、暂不迁移”不再作为需求依据。接口日志后端仍未开始；验证使用隔离数据，不调用真实业务写入。

面向同事的公开规范和示例随 qianrong 提交：UI_DESIGN_SPEC.md（含详情接入代码）、LIST_PAGE_DEMO.md、src/examples/ListPageDemo.vue；npm run demo:list 使用独立开发配置打开 /list-demo.html，不加载登录或业务接口，不进入正式构建入口。个人中心资料默认查看、编辑可取消，密码取消清空；不改变既有认证校验。模块对照和移植边界见 docs/qianrong-design-standard.md。公开资料不得混入本地维护机制。

根 README 及 apps/qianrong/README.md、apps/qianlian/README.md 是团队维护入口。私人实施文档见 docs/README.md，技术和验收事实按当前源码更新。构建在 apps/qianrong 运行 npm run build，输出到根 dist/qianrong；没有单独的类型检查脚本。


2026-10-14 用户在 home 恢复前一天暂停任务。负责范围为 dh 的13模块，系统管理相关子模块、登录、权限与个人中心；新增独立 npm run demo:modules / modules-demo.html，可使用示例检查原业务列表、详情与权限表单，接口日志及静态登录也已补齐。开发代理已切换 dev-qianrong/api-qianrong，systemList GET与8处直接地址修正，当前口径见 docs/qianrong-static-modules.md；旧辅助端点和权限DTO疑点见 docs/qianrong-api-alignment.md。构建及37静态场景通过，但未真实登录或业务联调；飞书原型入口本轮要求登录，继续以先前PRD阅读记录为依据，未宣称重新读取原型全文。

2026-10-14 work 已解决公司现有合并，master/9473440 已推送且干净。按用户口径保留 dh 13模块及公共支撑，同事的其它模块整理保留；唯一 Git 未解决项为根锁文件两种格式。190文件内容核对、生产构建、37静态场景及日志详情/脱敏通过，未真实业务联调。当前职责与完整处理记录见 docs/qianrong-owned-modules.md 和 docs/history/2026-10-14-work-qianrong-merge.md。

2026-10-15 work 新一轮对接已由用户明确暂停。业务已pull到master/a61445b，原角色/用户组6文件原字节恢复，尚无本轮业务改动；新Swagger268路径/213定义，菜单列字段7接口及isList已公开。后端完成的菜单/系统/用户组/部门/字典可对接，其它指定模块先前端。当前12个现行原型、旧链接替代、完整任务清单及续接边界统一见 docs/qianrong-v08-integration-tasks.md；用户恢复前不继续开发或自动唤醒。a61445b已删除旧demo/公开规范，旧验收命令不能直接复用。
