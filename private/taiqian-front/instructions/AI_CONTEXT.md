# 泰乾超级当前背景

2026-10-20 work本地登录续接：用户最终要求先连接局域网后端并恢复登录，暂不新增角色规则；当前代理及新认证响应以docs/qianrong-local-proxy.md、docs/qianrong-web-login.md和同日本地响应history为准。登录仍1–3直达，4/5双入口保留，本轮继续不push，真实账号登录待用户联调。

2026-10-20 work新版Web登录最新口径：用户追加明确登录页只走1→2→3，成功直接进入系统，不保留独立身份过渡页；无默认身份/授权失败只在原登录页提示并允许重试第3步或更换账号，不调用4/5兜底。登录后顶部和个人中心均保留“切换系统”，共用4/5身份树及切换逻辑，新Token清资料并重载菜单。旧loginType/企业角色预查/项目权限缓存退出qianrong主流程，SSO与qianlian保留。当前契约见docs/qianrong-web-login.md及同日入口修正history；本轮用户明确不push，仅本地提交，初版测试不代替最新交互验收。

2026-10-19 work企业新增/编辑契约修复：从干净master/b3c1c73同名pull后，按用户明确授权将userGroupIds改为多选数组，兼容新旧回填，编辑未改组省略、清空阻断，保留零值/既有关联与大ID精度；补legalIdType。bankList未新增CRUD，未编辑省略保护后台账户。49项隔离、7项浏览器/双尺寸及构建通过，未真实写入/部署；master/4c5f6f2已提交、再次同名pull后push且干净，不延续旧轮不push限制。边界见docs/qianrong-enterprise-contract-audit.md及同日实施记录，不能继续采用10/15旧字段结论。

2026-10-16同轮样式续改已本地提交master/b3c1c73：列字段页复用公共搜索、页头新增、工具栏、行操作及分页，修正原窄屏搜索对齐规则；继续不push。当前维护和验证边界见docs/history/2026-10-16-work-menu-columns-style.md。

2026-10-16 work当前迭代：业务起点master/d37351c已同名pull；用户本轮明确不push。菜单C页面行统一有列字段设置入口（不依赖isList），跳转system/menu/column-settings独立页，复用七接口。用户授权的dev隐藏路由已创建并回读，真实列表/详情读取及15项隔离交互通过；真实字段写入未测试。当前约定见docs/history/2026-10-16-work-menu-columns.md与任务清单顶部；下方10/15本地状态是历史快照，不代表当前分支状态。

项目是泰乾德邦数字金融管理系统前端 Monorepo，名称「泰乾超级」。qianrong 子应用简称「泰乾超级-qianrong」，位于 apps/qianrong；qianlian 是独立应用。根目录管理 Git/workspace，packages 是共享包；qianrong需求优先在应用内完成。

当前采用 Vue 3.3.9、JavaScript、Element Plus、vxe-table/vxe-pc-ui。继续现有Composition API，不迁移全仓TypeScript。公共搜索 TableSearch，底栏 BottomFixedBtnsBox，列表用原生vxe-grid或ListTablePanel外壳；设计令牌在src/assets/styles/design-tokens.scss，列表与详情皮肤继续复用。

源码与根README、apps/qianrong/README.md是当前事实入口。a61445b删除了旧公开UI规范、demo:list/demo:modules及示例配置，不引用已删除命令或恢复同事清理内容。构建在apps/qianrong执行npm run build；当前没有独立lint/typecheck脚本。

2026-10-15 work本轮已本地提交master/4abbea9；用户特殊要求先不push，等待自测。角色S05新功能本轮排除，原角色表单/权限表/权限树草稿保留未提交。用户组使用的勾选/关联系统弹窗作必要页面支撑，不代表开发角色新需求。

本轮用户最终口径：原型与接口结合对照，字段/类型/可实现范围最终按当前Swagger，接口是实现上限。菜单列字段7接口已接；菜单及权限从用户组迁到系统管理，用户组仅关联系统。系统状态使用现有update DTO的status；部门按一级分页、最多两级。缺契约的高级能力先预留，不猜字段或端点。

上轮企业/角色预查Web流程已由2026-10-20新认证/身份授权替代；SSO和Cookie键保留，当前入口以上方Web登录契约为准。不在前端模拟失败锁定、后端数据范围或会话安全。验证使用合成响应，没有真实业务写入/授权/部署。接口日志正式服务未公开，不注册真实菜单。

当前任务、具体字段裁决与验收入口：
- docs/README.md：维护文档索引。
- docs/qianrong-v08-integration-tasks.md：本轮状态、当前待办及历史暂停基线。
- docs/qianrong-v08-contract-matrix.md：原型/Swagger差异和8个当前请求模型字段。
- docs/history/2026-10-15-work-qianrong-v08-local.md：本地交付、自测顺序及真实验证边界。
- docs/qianrong-owned-modules.md：职责与历史口径；最新迁移与范围以上述文档为准。

本轮构建和核心离线交互通过，未真实联调/上传/导出/登录或部署；1920设置未生效，没有记为通过。以后新迭代仍按规则先pull、默认提交并在push前同步；本轮不得自动push。
