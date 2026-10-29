# 泰乾超级当前背景

2026-10-29 ssh dev：角色新增/编辑不再阻断「上级用户组菜单暂不可读取」，menuTreeList 读不到的已关联系统保存时把原 menuIds 原样带回，不清空也不进撤权确认。未构建/联调。详见 docs/qianrong-group-menu-inheritance.md 末节。

2026-10-29 ssh dev：用户组新增/编辑/详情放行两处阻断。详情缺 groupsSystemMenuDTOList 时 groupGrants 返回 null，跳过关联一致性核对，按系统授权默认勾选并在页顶提示；系统 menuIds 中菜单列表读不到的编号不再报错，不进树，原授权里的这类编号保存时原样带回。测试断言已改但未运行，也未构建/联调。详见 docs/qianrong-group-menu-inheritance.md 末节。

2026-10-28 ssh dev/5ad9753：账户新增/编辑/详情加用户密码 password（show-password 眼睛），提交 js-base64 encode，回填 isValid 后 decode 成明文，非 Base64 丢弃；编辑留空不传，新增必填 5–20 位。未构建/联调。详见 docs/qianrong-user-password-base64.md。

2026-10-28 ssh dev/56e5aa6：企业用户新增/编辑/详情加银行信息（仿正矿区块），银行取字典 sys_bank（bankName=标签、bankCode=值，bankCode 接口待补），开户行、账号手输；bankList 每行只传四字段 + 已有 id/orgId，编辑时详情回了才整份提交。未构建/联调。详见 docs/qianrong-enterprise-contract-audit.md 末节。

2026-10-28 ssh dev/4de0886：企业用户成立日期不晚于当天（禁选 + 校验）、注册资本两位小数；列表恢复所属用户组列，取 userGroupNames 数组用「、」拼接。未构建/联调。详见 docs/qianrong-enterprise-contract-audit.md 末节。

2026-10-28 ssh dev/787dbff 四项修正：企业用户类型为监管仓库时不显示/不提交银行类型（按 org_type 标签判断）；操作/登录日志由 el-table+ListTablePanel 改为与其它列表一致的 vxe-grid，分页常驻；角色所属企业进页调 /system/org/list 下拉（列表主键 id，原按 orgId 过滤导致选不了）；账号表单加账户类型 userType（00/01/02/03）。未构建/联调。详见 docs/qianrong-four-fixes-2026-10-28.md。

2026-10-28 ssh dev/ffeb87b：菜单结构调整后（system/monitor → config-audit/organization）核对 dh 负责模块，表单提交日期统一转毫秒时间戳：企业成立日期、菜单与用户整份回传的 Time/Date 字段、操作/登录/接口日志查询范围。新增 utils/timestamp.js，不动公共 addDateRange。未构建/联调。详见 docs/qianrong-date-timestamp.md。

2026-10-28 ssh 用户明确：默认都在 dev 上开发（各环境一致）。tq-plus 本就在 dev 且干净，同名 pull 由 987df92 快进到 1b930cd（含 master 合入 dev 的合并提交）。

2026-10-27 ssh 用户要求切到 dev：远端无 dev，从 master/7ef890f 本地新建，按用户确认推送新建 origin/dev。登录背景没铺满：第二个 style 块 min-height 720px + height auto 覆盖 100vh；改为仿正矿 img+object-fit cover、min-height max(720px,100vh)。未构建/浏览器。详见 docs/qianrong-web-login.md 末节。

2026-10-27 ssh企业用户管理列表：去掉“所属用户组”列；“企业用户类型”改按字典org_type映射（原org_user_type）。未构建/测试。详见docs/qianrong-enterprise-contract-audit.md末节。

2026-10-27 ssh菜单管理“列字段设置”入口收窄：只有C页面菜单且菜单名称含“列表”才显示（showColumnSettings），覆盖10-16全部C页面口径；跳转、权限与七接口不变。未构建/测试。详见docs/qianrong-menu-column-entry.md。

2026-10-26 ssh角色配置权限页最新口径：行级=角色列表“数据权限”同一表单与dataScope接口（去掉本企业，列表弹窗同步），列级=“列字段配置”同一内容组件，预览=选中列表调本系统该列表接口并多传previewRoleId（当前角色），取字段最全3条；功能权限仍为前端模型。三标签只认本页加载的角色编号。未构建/测试。详见docs/qianrong-role-permission-workspace.md。

2026-10-26 work角色工作区最新口径：用户要求先做静态页面，行级“已配置规则状态”整块不需要。角色列表新增配置权限入口，四Tab含功能、行级五档、列级三态/批量/脱敏、静态预览；演示模型仅弹窗内暂存，关闭重置、不调用业务接口、不表示真实角色权限。原有编辑、整体数据范围和列字段入口及API继续保留。55项回归、隔离浏览器与多尺寸、21.20秒构建通过；最新飞书原型本轮可完整读取。详见docs/qianrong-role-permission-workspace.md及本轮history，后续接口对接需另核对契约。

2026-10-23 work菜单表单生命周期：新增/编辑/详情仅在所属活动路由加载，非法/缺失ID不发详情请求，缓存停用和参数改变令旧响应失效；相同参数成功草稿保留，失败重入可重试。修复旧菜单页缓存监听在用户组等其它列表拼出system/menu/undefined及误用其它实体ID的问题。详见docs/qianrong-menu-route-lifecycle.md。

2026-10-22 home菜单权限最新口径：按用户截图，系统、用户组、角色三处使用正矿feature-v1.8.5独立页面的“权限名称 / 操作权限”两列表格；目录浅蓝整行展开、页面左侧、按钮右侧横排，工具栏展开全部/全选/仅看已选与搜索。早先选用旧角色弹窗el-tree的纵向展示已更正。沿用MenuPermissionTree路径和原授权模型；类型在标准化/用户组裁剪保留，停用反选和筛选交集已修复。详见docs/qianrong-menu-permission-tree.md及本轮history。

2026-10-22 work登录展示补充：直接默认显示首个具体可用系统，去掉“自动选择可用系统”，仍能切换；处理按钮统一“登录中”，不展示认证/授权阶段。接口1→2→3和登录后4/5入口保持原流程，空系统列表不虚构授权语义。按默认规则交付，详见docs/qianrong-web-login.md。

2026-10-22 work 当前口径：用户纠正10-15迁移理解，权限按系统→用户组→角色逐层收窄；用户组恢复菜单勾选，以所选系统详情的已授权菜单为上限，按groupsSystemMenuDTOList[{systemId,menuList}]保存。新关联默认继承，编辑保留勾选、撤权确认，失败/缺数据阻断。角色只使用登录用户用户组菜单树，不回退系统全量菜单，不补授树外父节点，旧越界授权确认后移除，空树不覆盖保存。详见docs/qianrong-group-menu-inheritance.md及同日history。本轮按默认规则提交推送，旧“用户组只关联系统/不push”不适用。

2026-10-21 home当前口径：角色基础及六个角色菜单列字段接口已纳入本轮；三个日志模块接正式路径、系统参数留存及分类清理记录。第三方菜单2465已按用户授权补齐并回读动态路由。用户明确改完直接推送当前master，不继承旧轮“排除角色/日志未开放/不push”例外；实现、契约、后端del_flag错误和空可选菜单树等边界见docs/qianrong-role-logs.md及同日history。12项契约、32项隔离浏览器场景、多尺寸与构建通过；未真实业务写入（新增菜单除外）或部署。

以下日期段落为历史快照，具体旧限制只适用于所述迭代。当前稳定事实仍以源码及上述最新维护入口为准。

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
