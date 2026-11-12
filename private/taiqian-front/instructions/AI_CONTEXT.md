# 泰乾超级当前背景

2026-11-12 ssh test/2987018、dev/af9f98f：操作日志「详细」改调详情接口 getOperlog（GET /monitor/logOper/{operId}），行数据只作占位，失败可重试。
2026-11-12 ssh test/4847276、dev/8268c1d：菜单列表在菜单名称后加「菜单类型」（M 目录 / C 菜单 / F、B 按钮）与「是否显示」（visible，字典 sys_show_hide）两列。
2026-11-12 ssh test/b0e9531、dev/8973d51：账户管理列表去掉左侧部门树（含按部门筛选），所属部门列取行字段 deptName。详见 docs/qianrong-user-paging-role-notice.md 第 3 节。
2026-11-12 ssh dev/95a30a5、test/cd2fec5（先按默认 dev，用户追问后 cherry-pick 到 test）：账户管理 getList 改带 pagerConfig 的 pageNum / pageSize（原只带写死 1 的 queryParams）；角色列表新增「越界标记」列（unreadNoticeCount，>0 可点）与操作栏「查看越界」（system:role:query），同开 RoleNoticeDialog：notice/list?roleId 加载成功后把未读 id 调 notice/read，关闭时刷新列表。详见 docs/qianrong-user-paging-role-notice.md。
2026-11-12 ssh test/7d409c2 → dev/1bb7c16（用户明确，test 改完合并 dev）：账户管理去掉分配角色（authRole 页、路由、API 删除）；账号表单按 S06 只留所属企业 / 账号类型 / 账户编号 / 用户名 / 手机号 / 角色 / 部门 / 邮箱 / 头像（编辑页不显示）/ 备注，新建初始密码 = 手机号后 6 位、nickName = userName，编辑类型改动二次确认（覆盖 10-28 密码输入口径）；企业表单按 S04 去银行类型、企业简称、币种、法人电话、实控人电话与身份证号，新增法人信息区块，信用代码编辑只读；角色列表去列字段配置 / 数据权限 / 分配用户（authUser、selectUser、RoleDataScopeDialog 删除，RoleColumnDialog 保留）。详见 docs/qianrong-prototype-trim-2026-11-12.md。
2026-11-11 ssh test/244f3bc（用户明确，在 test 分支）：产业配置融资H5 / PC登录配置全部非必填（页面类型仅查重，新加的全空 PC 块不提交）；右上角切换系统处显示当前系统（系统 + 角色两个标签，口径覆盖 2e66dd1）；合同模板详情用 components/DocxViewer 内嵌 docx（新依赖 docx-preview@0.3.7，需本地 yarn），新页面 /file-preview。详见 docs/qianrong-industry-optional-system-docx-preview.md。
2026-11-11 ssh test/7f55b3b（用户明确，在 test 分支）：字典数据页 /config-audit/dict-data/index/:dictId 为固定路由、按路由匹配不到列表菜单（2506 system:dict:query 作用在字典管理页），data.vue 直接指定 menuPerm；remark 未在列配置里会被 strict 隐藏。test 分支后端 test-qianrong（用户告知，vite resUrl 未改）。
2026-11-11 ssh dev/c0beb06（用户明确）：新增额度账本（supply-chain/credit-ledger）、认证管理（supply-chain/certification）、资产管理（digital-supervision/asset）三模块静态页面与静态数据，列表显式关 policyColumns/responseColumns，对接接口时恢复；dev 后端菜单 2507–2517 已建（新顶级目录数字监管），权限字符为前端拟定待后端定稿。origin 新建 test 分支 = 改动前 dev（ba4b6dc）。详见 docs/qianrong-new-modules-static.md。
2026-11-06 ssh dev/0b66c9a（用户明确）：动态列列表的列表接口也带 menuPerm（同 policyColumns）——listGrid resolveListMenuPerm 一次解析（页面指定优先，否则入口注入的 matchRouteMenuPerm 按路由匹配）、记在列表上，数据请求等解析完；getList 用 withMenuPerm(gridOptions, {...}) 包参数，导出不包。列表接口 Swagger 尚未声明，待联调。未运行测试/构建。
2026-11-05 ssh dev/8efe678（用户明确）：页面列 responseKey 写成多个字段 = 拼接列；其中任一字段配置可见就显示、只出一列（最靠前位置、沿用页面标题），函数 formatter 拿不到 HIDDEN 字段；全部隐藏 / 未配置不显示。目前只有准入列表地区列这样声明，其他拼接列需按页补声明。
2026-11-04 ssh dev/c8e5279（用户明确）：router.onError 遇动态导入失败自动刷新到目标页（10 秒一次，chunkReload.js）；listGrid 数据列 minWidth 下限 100~220（按表头字数）、操作列默认 fixed right。
2026-11-04 ssh dev/1fd9b8a（用户明确）：动态列配置里的 provinceCode / cityCode / areaCode 合成一列「地区」（名称「省-市-区」，有哪级显示哪级，取不到名称显示编码；页面已有地区列则沿用）。
2026-11-04 ssh dev/a1959a1（用户明确）：动态列默认按路由匹配列表菜单；一个路由多张表时页面在 withListGridStyle 里传 menuPerm 直接指定——准入列表按当前类型传 access:<类型>:list。开发环境控制台打印每次 policyColumns 的 menuPerm 与来源。
2026-11-04 ssh dev/b5fe1ce（用户明确）：401 页去掉「返回上一页」（守卫 replace 进 401，后退会回到被拦地址或离开系统），只留返回首页与切换系统。未运行测试。

2026-11-04 ssh dev/3662e27：右上角公告信息权限改为 system:notice:headertopright（不再借用 system:notice:list）。
2026-11-04 ssh dev/02e32d8：动态列口径改为看列表数据是否树形——账户管理（左侧部门树、普通列表）恢复 policyColumns / responseColumns，只有菜单、部门（treeConfig）关闭；系统管理启停改调 changeSystemStatus（/api-qianrong/system/changeStatus，POST {id,status}），编辑页仍 editSystem。
2026-11-04 ssh dev/4aa6f70：按第二版菜单数据——角色配置权限（及路由）system:role:configPerm，数据权限与配置权限页保存行级 system:role:permission，分配用户（路由、页内添加 / 取消授权）system:role:user；企业用户启停 system:org:status；币种修改 system:currency:edit。仍缺 system:dict:query、system:role:status。
2026-11-04 ssh dev/b498bf3：角色列表按钮按新菜单数据——详情、配置权限（及其路由）system:role:query，列字段配置与 RoleColumnWorkspace 编辑 system:roleColumn:edit，数据权限 / 分配用户 system:role:edit；dict:query、role:status 菜单仍无。未运行测试。

2026-11-03 ssh dev/e0f8b99：树形结构列表也不按接口返回字段隐藏列——responseColumns 默认 !treeConfig，账户管理显式 responseColumns: false。未运行测试。

2026-11-03 ssh dev/9361aa7：树形结构列表不走生效列字段配置——withListGridStyle 的 policyColumns 默认 !treeConfig（菜单、部门自动关），账户管理（左侧部门树）显式 policyColumns: false；三页直接加载数据、显示原有列。未运行测试。

2026-11-03 ssh dev/698140c：IdentitySwitcher 角色标签由 el-tag(200px 截断) 改为自定义标签，最宽 min(420px, 32vw)、名称省略、el-tooltip 显示完整身份。未运行测试/浏览器。

2026-11-03 ssh dev/9b7592a：401 页重写为「暂无访问权限」卡片（访问地址 query.from、当前身份、返回首页 / 上一页、切换系统），守卫跳 401 带 from。未运行测试/浏览器。

2026-11-03 ssh dev/3644e86：列表按钮权限字符按菜单 perms 修正（system:system:del、system:currency:save/remove、system:menu:query、菜单列字段设置仅 system:menu:detail、system:org:add / edit、system:role:detail、账号状态开关 system:user:status）；菜单缺 perms 的 user/dept 详情、groups 编辑、dict 详情、role 启停待后端。未运行测试。

2026-11-03 ssh dev/48b77ac：列表列配置与数据并行请求（whenListColumnsReady 内 Promise.all），走动态列的 gridOptions.loading 为访问器 = 页面 loading || 列配置加载中。未运行测试/浏览器。

2026-11-03 ssh dev/bfb7dda：AppMain 路由切换去掉 fade-transform out-in 过渡（消除切换留白），keep-alive 与路由名外壳不变。未运行测试/浏览器。

2026-11-03 ssh dev/866b4f5（测试阶段）：动态列 strict——setListColumnSource(..., { strict: true })，首屏只显示 type 列与操作列，数据列全按接口（对上的沿用页面渲染，无关列不留），无配置 / 失败只剩序号与操作；恢复兜底改 false。页面切换留白已分析未改：AppMain transition out-in 生效（正矿写法使过渡不触发），详见 docs/qianrong-list-style.md 末节。

2026-11-03 ssh dev/004d44f：菜单管理列表改为 vxe-grid 树形（扁平数据 treeConfig.transform、>60 行虚拟滚动、setAllTreeExpand 不重建、rowDragConfig.isPeerDrag 只同级拖拽，dragEndMethod 先 updateMenu 变了的序号成功才换位，menu-tree-model.js），不再用 el-table + Sortable；系统启用 / 停用开关权限改为 system:system:status。未运行测试/构建/浏览器。

2026-11-03 ssh dev/2f37850：系统管理列表状态列改为启用 / 停用开关（同账户管理账号状态：切换→二次确认→editSystem({ id, status })，取消或失败切回；无编辑权限显示标签）。未运行测试。

2026-11-03 ssh dev/e1d81b2：动态新增的纯文本列（policyCell）遇到 HTML 值显示成去标签、还原实体的文字（htmlToText），修通知公告「公告内容」露标签；不在单元格 v-html。未运行测试。

2026-11-03 ssh dev/e61d620：角色列字段弹框（RoleColumnWorkspace）不再导入 / 编辑 / 删除 / 查详情，策略与脱敏方式在列表里下拉直接改并保存（rowPolicyPayload，其余字段按行原值），保留一键设置策略；RoleColumnForm 与 getRoleColumn / deleteRoleColumn / importRoleColumns 已删。列表起止日期拆成开始、结束两列（融资方案、授信、银行政策快照），开始列不再拼结束日期。未运行测试/构建。

2026-11-03 ssh dev/6cbf64b（用户明确）：切换系统处角色标签改为 roleName 有值就显示（含登录不选角色时 defaultAuthorize context.roleName 的默认角色），不再要求 roleId。

2026-11-03 ssh dev/2e66dd1（用户明确）：切换系统处无角色保持原样只显示按钮，有角色才显示「角色：XX」，不显示系统名；无角色不查身份树补名。

2026-11-03 ssh dev/3b01b30：IdentitySwitcher 显示当前系统名与（有 roleId 时）角色标签；当前身份存 sessionStorage qianrong-login-identity（authorize / changeIdentity 写入、login / clearSession 清空，仅展示），缺名称时 fillIdentityNames 按 loginIdentityTree 补。未运行测试/构建。详见 docs/qianrong-web-login.md 末节。

2026-11-03 ssh dev/d5b543b（用户明确）：isList 菜单是占位，一律作用在上一级页面；menuPerm 取占位自身权限标识，为空才取上一级。

2026-11-03 ssh dev/25efecc：用户没看到 policyColumns 调用（匹配不到列表菜单时静默跳过）。列表菜单页面改为 F/B 及 Layout 占位向上找最近真实页面；menuPerm 自身为空用页面 perms；匹配加路径末段、路由标题；菜单列表失败不缓存；开发环境控制台 `[列表列字段]` 输出未调用原因与候选菜单。未运行测试/构建。

2026-11-03 ssh dev/5439e32：标准列表列字段动态——listMenu（会话缓存）过滤 isList → 按路由路径 / meta.view 匹配列表菜单 perms → policyColumns?menuPerm → mergePolicyColumns（接口定列、复用页面列渲染、HIDDEN 不显示、无配置保持原列）→ setListColumns，页面首次加载 whenListColumnsReady(gridOptions, getList)；未匹配路由而视图文件 / dynamicRoutes 存在时进 401；公告信息按 system:notice:list 显示。未运行测试/构建。详见 docs/qianrong-list-style.md 末两节。

2026-11-03 ssh dev/1b09a7c：标准列表（withListGridStyle）列设置走 vxe 原生——面板勾显隐、拖排序，表头整格拖拽（type 列 / 固定列除外）；页面传 id 时按 vxe customConfig.storage 存 localStorage（visible/sort/fixed/resizable，不存分页），存储 id `qr-list:<id>@<userId>`，用户编号由 main.js setListGridOwner 注入。24 页已配 id，新列表须配不重复 id。未运行测试/构建。详见 docs/qianrong-list-style.md 末节。

2026-10-30 ssh dev/8d1b2e5：角色 RoleColumnForm 字段名称改为可编辑（必填、≤30 字，roleColumnPayload 去空格校验），编码 / 类型仍只读；菜单 MenuColumnForm 字段名称本就可编辑。未运行测试/构建。

2026-10-30 ssh dev/308a36f：列表列按接口字段渲染——withListGridStyle 的 data 改为访问器，赋值时按行数据返回的 key 过滤 columns（utils/responseColumns.js；无行保持上次；type 列与操作列不参与；派生列 responseKey）。ListTablePanel 特殊列表与部门树（responseColumns: false）不接入。行数据须保持接口原样，派生展示放 formatter。未运行测试/构建。详见 docs/qianrong-list-style.md 末节。

2026-10-30 ssh dev/253d116：用户明确「列表占位传父级 menuId」是错的——菜单管理列字段设置传 row.menuId，角色列级 roleListMenuOptions 也用列表菜单自身（自身或父级已授权即可选，父级停用跳过）；删除 columnTargetMenuId。以下 413c0ff / b07b507 中「父级生效」的说法作废。未运行测试/构建。

2026-10-30 ssh dev/413c0ff：菜单管理「列字段设置」入口改为 isList=1 即显示（不看类型、名称），按钮类列表跳父级页面、其余跳自身（columnTargetMenuId），独立页不再只认 C；角色列级 roleListMenuOptions 同用 columnTargetMenuId。menu-column-entry 测试原路径已失效，已重写。未运行测试/构建。详见 docs/qianrong-menu-column-entry.md。

2026-10-30 ssh dev/b07b507：角色列级（及列字段配置弹窗）的列表下拉改用 roleListMenuOptions——是否列表=是的占位（多为「XX列表」按钮），父级或占位已授权即可选，选中后按父级页面加载与保存列配置。权限预览未改；菜单管理「列字段设置」入口（C 且名含「列表」）与新命名可能不符，待确认。未运行测试/构建。详见 docs/qianrong-role-permission-workspace.md 末节。

2026-10-30 ssh dev/09326e9：菜单表单「是否列表」不再按类型限制——去掉按钮禁用、切类型强制 0、回显/提交强制 0；列表页 isListMenu 不再排除按钮。onListChange（是→隐藏）与列字段设置入口不变。未运行测试/构建。详见 docs/qianrong-menu-route-lifecycle.md 末节。

2026-10-30 ssh dev/2bfdd71：配置权限页报 validId is not defined、角色列表删除/启停无效——d2a01cf 把 index.vue、permissions.vue 的 validId 导入换成 validOrgId 却仍在用 validId。用户明确角色 id=0 有效：新增 validRoleId（同 validOrgId），所有角色编号校验改用它；菜单/系统/部门/字段仍用 validId。测试加漏导入守卫。未运行测试/构建。详见 docs/qianrong-org-scope-forms.md 末节。

2026-10-30 ssh dev/e8bea29：角色新增「用户组」下拉滤掉了 id=0 的平台运营组——loadGroups 用 validId（0 = 没有）；新增 validGroupId（同 validOrgId，0 有效），下拉、编辑回显、menuTreeList 取树、权限区提示四处改用。未运行测试/构建。详见 docs/qianrong-org-scope-forms.md 末节。

2026-10-30 ssh dev/7a16416：菜单管理行内「新增」不再按类型隐藏，按钮（F/B）也能新增下级、作上级菜单；部门编辑「上级部门」有值仍报「上级只能选择一级部门」——load 先写 form 再取部门树，el-select 值变化时树为空即校验失败，改为树就绪后与 form 同刻赋值并 clearValidate。未运行测试/构建。详见 docs/qianrong-menu-route-lifecycle.md、docs/qianrong-org-scope-forms.md 末节。

2026-10-29 ssh dev/9613bb3：同事合并 ea81b0f 解坏账户表单模板（用户密码项未闭合、丢账户类型/性别/状态/岗位、角色等重复），导致打包失败，已按三方合并重算修复；DEP0169 url.parse 只是依赖触发的警告。账户类型平台大于企业：assignableUserTypes，企业账户只能选 02/03，编辑已是平台类型的账号置灰回显。未运行测试/构建。详见 docs/qianrong-org-scope-forms.md 末节。

2026-10-29 ssh dev/4df38d0：部门、用户、角色按当前登录账户类型处理所属企业——平台（00/01）必选企业，非平台（02/03）不显示、后端取登录企业；用户的部门/角色/岗位按企业取（deptTree、GET /system/user/ 带 orgId）；角色非平台按登录企业取用户组，用户组仍必选。store 新增 loginOrgId（授权/切换身份的 orgId，getInfo 兜底）。未构建/联调。详见 docs/qianrong-org-scope-forms.md。

2026-10-29 ssh dev/80cfcf6：企业用户新增/编辑「实控人身份证号」选填，填了须为 18 位身份证格式（地区码+出生日期+顺序码+数字或X，未算校验位），maxlength 18。未构建/联调。详见 docs/qianrong-enterprise-contract-audit.md 末节。

2026-10-29 ssh dev：账户管理列表加「用户类型」列，userType 按后端枚举 00 平台管理员 / 01 平台用户 / 02 企业管理员 / 03 企业用户映射，复用 utils/userProfile 的 userTypeLabel，不调字典。未构建。详见 docs/qianrong-four-fixes-2026-10-28.md 末节。

2026-10-29 ssh dev：配置权限页「数据权限·列级」输入框无限变宽——RoleColumnPanel 的 grid 没有列模板，表格 / 搜索栏按自身宽度调整的内容反过来撑宽列；改为 grid-template-columns:minmax(0,1fr)。公共组件未改（加 contain:inline-size 的建议见文档）。未构建/浏览器。详见 docs/qianrong-role-permission-workspace.md 末节。

2026-10-29 ssh dev：角色新增/编辑在所属企业后加必选「用户组」下拉，选项按企业调 getUserGroupsListByOrgId（先选企业才能选），保存走 userGroupId；权限菜单树改为 menuTreeList 传 userGroupsId=所选组 id，未选组为空树。dev Swagger 里 menuTreeList 尚无该参数，待联调。未构建。详见 docs/qianrong-group-menu-inheritance.md 末节。

2026-10-29 ssh dev：角色「管理关联系统」弹窗所有系统可选（不再按 menuTreeList/停用置灰），上级读不到的系统为空树，新关联时 menuIds 传 []。未构建/联调。详见 docs/qianrong-group-menu-inheritance.md 末节。

2026-10-29 ssh dev：角色新增/编辑不再阻断「上级用户组菜单暂不可读取」，menuTreeList 读不到的已关联系统保存时把原 menuIds 原样带回，不清空也不进撤权确认。未构建/联调。详见 docs/qianrong-group-menu-inheritance.md 末节。

2026-10-29 ssh dev：企业 id=0 是后端初始化的有效企业：所属企业相关判断改用 role-model 的 validOrgId（0 有效），角色 / 部门 / 用户下拉、锁定、按企业加载、rolePayload、登录企业 sessionStorage、准入页回显都放行 0；其它主键仍用 validId（0 = 没有）。所属企业下拉不按 esignAuthStatus 过滤。未运行测试 / 构建。详见 docs/qianrong-org-scope-forms.md 末节。

2026-10-29 ssh dev：用户组「关联系统与菜单授权不一致，已停止保存」改为放行：reconcileGrants 以 getSystemsByUserGroup 为准对齐，关联但无授权的系统置空需重新勾选，不在关联里的授权保存时丢弃，页顶 warning 列出系统。未运行测试/构建/联调。详见 docs/qianrong-group-menu-inheritance.md 末节。

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

2026-10-26 ssh角色配置权限页最新口径：行级=角色列表“数据权限”同一表单与dataScope接口（去掉本企业，列表弹窗同步），列级=“列字段配置”同一内容组件，预览=选中列表调本系统该列表接口并多传previewRoleId（当前角色），取字段最全3条；功能权限 2026-11-02 起接真实数据（按角色 userGroupId 取 menuTreeList 范围、roleSystems 回显、updateRole 保存，同编辑页）。三标签只认本页加载的角色编号。未构建/测试。详见docs/qianrong-role-permission-workspace.md。

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
