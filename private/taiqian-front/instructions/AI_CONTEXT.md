# 泰乾超级当前背景

2026-10-16同轮样式续改已本地提交master/b3c1c73：列字段页复用公共搜索、页头新增、工具栏、行操作及分页，修正原窄屏搜索对齐规则；继续不push。当前维护和验证边界见docs/history/2026-10-16-work-menu-columns-style.md。

2026-10-16 work当前迭代：业务起点master/d37351c已同名pull；用户本轮明确不push。菜单C页面行统一有列字段设置入口（不依赖isList），跳转system/menu/column-settings独立页，复用七接口。用户授权的dev隐藏路由已创建并回读，真实列表/详情读取及15项隔离交互通过；真实字段写入未测试。当前约定见docs/history/2026-10-16-work-menu-columns.md与任务清单顶部；下方10/15本地状态是历史快照，不代表当前分支状态。

项目是泰乾德邦数字金融管理系统前端 Monorepo，名称「泰乾超级」。qianrong 子应用简称「泰乾超级-qianrong」，位于 apps/qianrong；qianlian 是独立应用。根目录管理 Git/workspace，packages 是共享包；qianrong需求优先在应用内完成。

当前采用 Vue 3.3.9、JavaScript、Element Plus、vxe-table/vxe-pc-ui。继续现有Composition API，不迁移全仓TypeScript。公共搜索 TableSearch，底栏 BottomFixedBtnsBox，列表用原生vxe-grid或ListTablePanel外壳；设计令牌在src/assets/styles/design-tokens.scss，列表与详情皮肤继续复用。

源码与根README、apps/qianrong/README.md是当前事实入口。a61445b删除了旧公开UI规范、demo:list/demo:modules及示例配置，不引用已删除命令或恢复同事清理内容。构建在apps/qianrong执行npm run build；当前没有独立lint/typecheck脚本。

2026-10-15 work本轮已本地提交master/4abbea9；用户特殊要求先不push，等待自测。角色S05新功能本轮排除，原角色表单/权限表/权限树草稿保留未提交。用户组使用的勾选/关联系统弹窗作必要页面支撑，不代表开发角色新需求。

本轮用户最终口径：原型与接口结合对照，字段/类型/可实现范围最终按当前Swagger，接口是实现上限。菜单列字段7接口已接；菜单及权限从用户组迁到系统管理，用户组仅关联系统。系统状态使用现有update DTO的status；部门按一级分页、最多两级。缺契约的高级能力先预留，不猜字段或端点。

登录与认证沿用现有企业/角色选择、SSO、Token及守卫；不在前端模拟失败锁定或会话安全。验证只用离线内存数据，没有真实业务写入/授权/部署。接口日志正式服务未公开，不注册真实菜单。

当前任务、具体字段裁决与验收入口：
- docs/README.md：维护文档索引。
- docs/qianrong-v08-integration-tasks.md：本轮状态、当前待办及历史暂停基线。
- docs/qianrong-v08-contract-matrix.md：原型/Swagger差异和8个当前请求模型字段。
- docs/history/2026-10-15-work-qianrong-v08-local.md：本地交付、自测顺序及真实验证边界。
- docs/qianrong-owned-modules.md：职责与历史口径；最新迁移与范围以上述文档为准。

本轮构建和核心离线交互通过，未真实联调/上传/导出/登录或部署；1920设置未生效，没有记为通过。以后新迭代仍按规则先pull、默认提交并在push前同步；本轮不得自动push。
