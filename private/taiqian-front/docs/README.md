# 泰乾超级维护文档

- [history/2026-10-22-work-login-presentation.md](history/2026-10-22-work-login-presentation.md)：登录系统默认显示具体名称、处理按钮统一“登录中”，及本轮授权合并统筹记录。

- [qianrong-group-menu-inheritance.md](qianrong-group-menu-inheritance.md)：2026-10-22系统→用户组→角色菜单继承；恢复用户组menuList、逐系统交互、失败保护与角色上限校验，覆盖10-15“用户组仅关联系统”旧结论。
- [history/2026-10-22-work-group-menu-inheritance.md](history/2026-10-22-work-group-menu-inheritance.md)：本轮同步、20项契约/17组浏览器/构建验证及真实联调边界。

- [qianrong-role-logs.md](qianrong-role-logs.md)：2026-10-21角色基础/六个角色字段接口，三类日志、动态留存参数和分类清理记录；真实接口边界及已授权第三方菜单。
- [history/2026-10-21-home-role-logs.md](history/2026-10-21-home-role-logs.md)：本轮home同步、12项契约/32项浏览器验证、菜单注册与直接推送记录。

- [history/2026-10-20-work-local-login-response.md](history/2026-10-20-work-local-login-response.md)：开发代理切换work局域网后端，适配认证data.token/userType及00空系统/用户组结果；新增角色规则按用户要求暂停，76项隔离/17浏览器及真实匿名代理读取通过，仅本地不push。

- [history/2026-10-20-work-web-login-entry-correction.md](history/2026-10-20-work-web-login-entry-correction.md)：用户追加口径，登录1–3直达，无身份过渡页；4/5在登录后由顶部与个人中心双入口发起，本轮不push。

- [qianrong-web-login.md](qianrong-web-login.md)：2026-10-20新版Web认证/默认授权/身份树/切换五接口、角色与管理员边界、刷新及权限重载；本轮仅本地不push。
- [history/2026-10-20-work-web-login-refactor.md](history/2026-10-20-work-web-login-refactor.md)：新版登录实施、59项隔离/15浏览器场景、构建与真实联调待办。

- [history/2026-10-19-work-enterprise-group-contract.md](history/2026-10-19-work-enterprise-group-contract.md)：企业用户组多选契约、回填/编辑保护、证件类型及49项/7场景/构建验证。
- [qianrong-enterprise-contract-audit.md](qianrong-enterprise-contract-audit.md)：2026-10-19企业新增/编辑最新契约、已修复范围及未真实联调边界；银行未新增CRUD。

- [history/2026-10-16-work-menu-columns-style.md](history/2026-10-16-work-menu-columns-style.md)：列字段列表样式统一、公共窄屏搜索对齐修正及本地验证；本轮不push。

- [history/2026-10-16-work-menu-columns.md](history/2026-10-16-work-menu-columns.md)：列字段独立页、全部页面菜单入口、真实路由注册与本地验证；本轮不push。

- 根目录 AGENTS.md：执行规则与 Monorepo 边界。
- 根目录 AI_CONTEXT.md：项目身份、应用与维护入口。
- [qianrong-v08-contract-matrix.md](qianrong-v08-contract-matrix.md)：当前Swagger八个请求模型字段及原型差异裁决。
- [history/2026-10-15-work-qianrong-v08-local.md](history/2026-10-15-work-qianrong-v08-local.md)：本轮源码交付、实际验收、预留边界及本地自测顺序。
- [qianrong-v08-integration-tasks.md](qianrong-v08-integration-tasks.md)：2026-10-15本地交付/自测待办、角色排除、接口优先及本轮不push安排。
- [history/2026-10-14-work-qianrong-merge.md](history/2026-10-14-work-qianrong-merge.md)：公司现有合并、dh/同事模块保留、锁文件冲突与验收。
- [qianrong-static-modules.md](qianrong-static-modules.md)：2026-10-14 恢复开发、13 模块静态入口、新接口修正及原型访问边界。
- [history/2026-10-14-qianrong-static-modules.md](history/2026-10-14-qianrong-static-modules.md)：37 场景、登录/资料交互与隔离接口验证记录。
- [history/2026-10-13-home-root-lockfile-sync.md](history/2026-10-13-home-root-lockfile-sync.md)：home 根工具锁文件同步、提交与原输入保护记录。
- [workspace-association.md](workspace-association.md)：home/work 关联、五项私人挂载、本机索引和范围边界。
- [history/2026-10-12-work-association.md](history/2026-10-12-work-association.md)：公司环境恢复关联与同步验收记录。
- [qianrong-list-style.md](qianrong-list-style.md)：qianrong 列表、搜索与固定底栏约定。
- [qianrong-design-standard.md](qianrong-design-standard.md)：全局列表/详情规范、dh 改动来源及负责模块与正矿的逐项对照。
- [history/2026-10-12-qianrong-design-standard.md](history/2026-10-12-qianrong-design-standard.md)：统一规范、详情及相近模块交互的实施与验收记录。
- [qianrong-owned-modules.md](qianrong-owned-modules.md)：历史13模块职责；本轮菜单权限已迁移、角色排除，以最新任务清单为准。
- [history/2026-10-11-qianrong-owned-module-ui.md](history/2026-10-11-qianrong-owned-module-ui.md)：负责模块的特殊列表、树形展示和个人中心补齐记录。
- [qianrong-api-alignment.md](qianrong-api-alignment.md)：新服务接口对照、已实施修正及旧端点/权限 DTO 待确认项。
- [history/2026-10-13-qianrong-api-audit-paused.md](history/2026-10-13-qianrong-api-audit-paused.md)：用户暂停时的同步、锁文件恢复及核查边界。
- [qianrong-local-proxy.md](qianrong-local-proxy.md)：qianrong 本地测试接口与代理配置。
- [history/2026-10-11-qianrong-local-proxy.md](history/2026-10-11-qianrong-local-proxy.md)：本地代理配置、验证及交付记录。
- [history/2026-10-11-qianrong-list-style.md](history/2026-10-11-qianrong-list-style.md)：改造决策、验证和交付记录。
- 旧公开规范和示例已由a61445b清理；不再将其或旧demo命令作为当前维护入口。

文档与日志是私人资料，索引是本机派生物；团队源码、应用 README 与实际命令结果是事实来源。部署和真实业务写入需明确授权。
