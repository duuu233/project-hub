# 泰乾超级实施记录

## 2026-10-29 ssh｜账户管理列表用户类型列

dev 干净同名 pull 已最新。user/index.vue 加用户类型列（userTypeLabel 映射，映射不到显示原值），列显隐追加 key 7。无 node 未构建、未联调；信息隔离自查通过。

## 2026-10-29 ssh｜配置权限列级输入框无限变宽

dev 干净同名 pull 已最新。定位到 RoleColumnPanel 的 grid 没有列模板、grid 子项没有 min-width:0，el-table 与 TableSearch 按宽度调整的内容撑宽列；改为 minmax(0,1fr)。公共组件、全局样式未改，只给出建议。无 node / 浏览器，未构建、未复现；信息隔离自查通过。

## 2026-10-29 ssh｜角色新增/编辑用户组下拉

dev 干净同名 pull 由 2c9ea2e 快进至 0b12e0f（同事版本对比等 22 文件）。api 加 getUserGroupsListByOrgId；role handleDetail.vue 所属企业后加用户组下拉（必选、按企业加载、换企业清空），menuTreeList 改传 userGroupsId，换组重建菜单树并保留范围内勾选，草稿多记 userGroupId。无 node 未构建、未联调；信息隔离自查通过。

## 2026-10-28 ssh｜账户用户密码 Base64

dev 干净同名 pull 快进至 66f66ab（同事合并 12 文件）。user/template/handleDetail.vue 加用户密码输入框，password 提交 Base64、回填解码、编辑留空不传，详情 readonly 保留眼睛。dev/5ad9753 提交后再次同名 pull 并 push。无 node 未构建、未联调；信息隔离自查通过。

## 2026-10-28 ssh｜企业用户银行信息

dev 干净同名 pull 已最新；正矿 feature-v1.8.5 同名 pull 已最新（只读参考 system/enterprise-users 银行信息）。新增 EnterpriseBankList 组件并接入新增/编辑/详情，bankList 提交四字段。dev/56e5aa6 提交后再次同名 pull 并 push。bankCode 待接口补。无 node 未构建、未联调；信息隔离自查通过。

## 2026-10-28 ssh｜企业成立日期、注册资本、所属用户组列

dev 干净同名 pull 快进（同事 7 文件）。EnterpriseBusinessFields 成立日期禁选未来并加校验、注册资本 precision 2；列表加所属用户组列取 userGroupNames 用「、」拼接。dev/4de0886 提交后再次同名 pull 并 push。无 node 未构建、未联调；信息隔离自查通过。

## 2026-10-28 ssh｜企业银行类型、日志分页、角色所属企业、账户类型

dev 干净先同名 pull 已最新。四项：监管仓库去银行类型；操作/登录日志改 vxe-grid 补分页与样式；角色所属企业进页加载 /system/org/list 下拉（修主键 id 被按 orgId 滤掉）；账号加账户类型 userType。dev/787dbff 提交后再次同名 pull 并 push。无 node 未构建、未联调；信息隔离自查通过。详见 docs/qianrong-four-fixes-2026-10-28.md。

## 2026-10-28 ssh｜负责模块日期统一传时间戳

dev 干净先同名 pull 已最新。按 git 重命名追踪把 13 模块映射到 config-audit/、organization/ 新路径后逐个核对提交体：企业成立日期选择器改 value-format x 并回填/提交转时间戳；菜单、用户整份回传的 Time/Date 字段提交前转；操作/登录/接口日志查询 beginTime/endTime 转时间戳。新增 utils/timestamp.js。dev/ffeb87b 提交后再次同名 pull 并 push。无 node 未构建、未联调；信息隔离自查通过。详见 docs/qianrong-date-timestamp.md。

## 2026-10-28 ssh｜默认开发分支改为 dev

用户明确今后默认在 dev 开发。tq-plus 当前即 dev、工作区干净，显式 pull --ff-only origin dev 由 987df92 快进至 1b930cd，无本地改动。规则已写入 AGENTS.md 与 Hub 项目上下文。

## 2026-10-26 work｜角色配置权限四Tab静态版

master/8b163cd干净先同名pull，原型与300路径Swagger核对后，按用户追加“先做静态页面”和行级去掉规则状态表交付。新增四Tab演示工作区，五档范围、字段三态/批量/脱敏、权限与合成数据预览、撤销查询确认、未保存离开及关闭重置；保留真实编辑/数据权限/字段入口，不改API。55项回归、21.20秒构建、CUA隔离浏览器及1280/600/390宽度检查通过，演示请求记录为空，索引最新。无真实权限写入或部署。默认提交master，push前再次显式同名pull；详见docs/history/2026-10-26-work-role-permission-workspace.md。

## 2026-10-23 work｜菜单表单跨页面重复请求修复

业务master/8b163cd已再次显式同名pull后push origin，真实远端一致且工作区干净，索引最新。

master/d08dab3干净同名pull后修复菜单表单缓存监听：限定活动路由、校验ID、捕获参数及丢弃过期响应，保留成功草稿和失败重试，保护离开后的保存清理。新增10组行为测试，全量50项通过；真实组件隔离浏览器验证跨四页面请求数不变及重试/草稿/缺ID/新增，两尺寸截图检查通过，无运行时异常或外部业务请求；生产构建15.84秒通过，保留既有告警。未真实菜单写入或部署。按默认规则提交，再次同名pull后push；详见docs/history/2026-10-23-work-menu-route-lifecycle.md。

## 2026-10-22 home｜菜单权限表按截图更正

业务master/d08dab3已提交11文件，再次显式同名pull成功后push，远端一致且工作区干净；从9975d7f实施，正矿feature-v1.8.5/f24127be只读。系统、组、角色恢复“权限名称 / 操作权限”两列表格，修正旧弹窗组件选取；补类型传递、停用反选、筛选交集与表单宽度保护。40项回归、27组隔离浏览器/13张四尺寸截图和3.69秒生产构建通过，未真实授权写入或部署。已按默认规则交付，具体实施见docs/history/2026-10-22-home-permission-table-alignment.md。

## 2026-10-21 home｜角色列字段与三类日志

两仓干净当前同名分支先pull成功，业务master/122cae1起步。恢复角色基础/六个字段接口，三类日志接正式路径、动态留存与分类清理，修正真实scopeList key/value和配置msg月数适配。12项契约、15项角色/17项日志隔离场景、768/1280/1920及生产构建通过；索引已同步。用户授权后查重新增第三方日志菜单2465，动态路由回读通过；其余真实业务写入未执行。第三方服务del_flag缺失、空可选菜单树及待真实联调详见docs/qianrong-role-logs.md。本轮明确直接提交推送，不沿用旧不push例外；master/f21cff3已提交21文件，再次显式同名pull后push成功，临时令牌已删除。

## 2026-10-20 work｜本地后端与新认证响应（仅本地）

两仓干净先同名pull成功；按用户最终口径先连局域网后端并适配新data.token/userType，不实施新增角色必填。业务master/c3bba2d提交5文件、干净，保留原本地两提交，共领先远端三提交，不push。00默认授权可空系统/用户组，待授权刷新类型及会话清理覆盖，登录1–3直达和4/5双入口保持。76项隔离、17浏览器及5.90秒构建通过，真实Vite代理读取本地Swagger/匿名系统列表成功，索引与差异/隔离完成；无真实账号认证授权或部署，需重启本地服务由用户验收。当前契约与边界见docs/history/2026-10-20-work-local-login-response.md。

## 2026-10-20 work｜登录直达与双切换入口修正

用户追加明确登录只走1–3、不需要独立身份过渡页，4/5在个人中心切换系统，顶部入口也保留。两仓先同名pull保留原本地提交，业务master/16013c9本地提交7文件并干净；删除过渡页/路由，授权失败仅原登录页提示并支持第3步重试，顶部与个人中心共用切换弹窗。59项隔离、12项本轮浏览器、10.67秒生产构建、索引/差异/隔离通过，未真实授权或部署。当前口径与验收见docs/qianrong-web-login.md及入口修正history；本轮仍不push，初版历史保留但不再作为交互要求。

## 2026-10-20 work｜Web登录与身份授权重构

业务master/1de3f62已本地提交18文件，工作区干净，仅领先origin/master一提交，不push；最终构建4.59秒、59项/15场景复跑及CodeGraph sync/status与隔离检查通过。

两仓干净先同名pull，业务master/4439466；按用户提供文档与实时Swagger编号1–5实施认证/默认授权分离、共用身份树及顶部切换、待授权刷新和资料/权限/动态路由清理。旧loginType、企业角色预查、TypeLogin及ProjectSelect/setCache退出；仅qianrong，不改SSO或共享包/另一应用。59项隔离、15项真实浏览器场景及生产构建通过，未真实认证/授权/部署，当前契约与未验收边界见docs/qianrong-web-login.md及同日history。用户本轮明确不push，业务和维护资料仅本地提交，不沿用旧轮默认推送。

## 2026-10-19 work｜企业用户组新契约修复

交付master/4c5f6f2，提交后再次显式同名pull并push，真实远端一致且干净；维护记录同步main。

核对后用户明确直接改代码，两仓重新先pull；只改qianrong企业3文件，用户组多选数组、新旧回填、零值与大ID保护、编辑未改省略/清空阻断及证件类型，原银行/附件/地区/管理员等业务保持。49项隔离、7项真实浏览器场景、1280/1920及生产构建通过，已有索引同步；不真实写入或部署。按当前master提交并再次同名pull后push，维护记录同步main。详情见docs/history/2026-10-19-work-enterprise-group-contract.md；首次仅核对是下方历史，未改银行CRUD的边界保留。

## 2026-10-19 work｜企业新增/编辑契约核对

两仓干净先同名pull，业务master/b3c1c73无修改。只读获取最新Swagger，确认新增/编辑路径和POST一致，但共用模型已为userGroupIds数组，当前表单、回填、白名单及序列化仍发送sysOrgGroups旧对象，能够解释用户“至少选择一个用户组”反馈；不将0直接断言为无效组。另记录bankList/证件类型新契约，详情响应仍泛型、不猜包裹层。先CodeGraph两次未命中目标后定向核对，未发真实业务请求、未构建或修改业务源码；更新当前契约与核对文档，修复尚未实施。

## 2026-10-16 work｜列字段列表样式续改

业务master/b3c1c73本地提交三文件，开始前两仓同名pull成功，原正矿改动保留。列字段页搜索/页头新增/工具栏/列显隐/行操作/分页复用公共规范，并修正公共窄屏搜索选择器优先级。构建、2Vue编译、实际菜单列表对照及隔离交互通过；真实关键词筛选未过滤的现象单独记为待核查，未真实字段写入或桌面多尺寸验收。延续本轮不push；详情见docs/history/2026-10-16-work-menu-columns-style.md。

## 2026-10-16 work｜菜单列字段独立页与路由注册

- 两仓按当前同名分支同步，原正矿文档原样保留；本轮用户明确不push。
- C页面菜单行列字段设置入口，独立页及七接口共享工作区，菜单切换/权限/类型和旧请求隔离；不改角色、其他模块或后台isList。
- 用户授权后查重创建隐藏路由，真实菜单102列表/详情和刷新直达验证成功；未新增系统/角色授权，未真实增删改列字段。
- 生产构建、4Vue编译、7最新Swagger契约、15隔离交互、CodeGraph及差异检查通过；详细限制和自测步骤见docs/history/2026-10-16-work-menu-columns.md。仅本地交付，不push/部署。

当次改动、来源、验证与边界按日期追加，具体口径以 docs 中当前文档为准。

## 2026-10-15 work｜V0.8接口页面本地交付

- **本地提交**：master/4abbea9，31文件；用户明确先自测不push，本轮未执行推送。原角色表单/PermissionTable/permission-tree原字节保留未提交；关联系统弹窗及勾选组件作为用户组支撑纳入。
- **实现**：菜单列字段7接口、系统menuIds及状态、用户组仅关联系统；对齐部门/字典/企业/账号/日志的已声明字段和交互，原型超出契约能力预留，S05排除。
- **验证**：最终生产构建、27 Vue编译、7新API/核心模型契约、关键隔离交互通过；密码明文展示先复现后修复并复验。1280无横溢出；1920设置未生效未记通过。未真实业务联调/上传/导出/登录或部署。
- **记录**：docs/qianrong-v08-contract-matrix.md、docs/history/2026-10-15-work-qianrong-v08-local.md和最新任务清单。3个原XML保持未提交；没有创建自动任务。

## 2026-10-15 work｜新原型对接调查与用户暂停

- **状态**：用户明确“先暂停任务”，立即停止业务开发；保存docs/qianrong-v08-integration-tasks.md供显式恢复，未安排自动唤醒。
- **同步/保留**：统筹main/7686944已先pull；业务master从9473440快进到a61445b。按本轮授权保护并恢复6个角色/用户组文件及3个XML，原字节核对一致；恢复两处冲突仅涉及远端空行/注释，原实现保留，专用stash已移除。业务原改动暂不提交。
- **核查**：用户登录飞书后初核12个现行原型；旧S02等链接已有替代，旧S11日志链接删除，不能误改当前S11产业配置。最新Swagger从216/150更新为268路径/213定义，菜单列字段7接口和isList已公开；用户明确权限迁移至系统管理，替代旧暂缓口径。
- **后续**：截图标为完成的菜单/系统/用户组/部门/字典对接，其它指定模块先前端，缺契约先预留。清单记录逐模块差异、接口映射、实施顺序、验证及原有文件边界。
- **验证边界**：本轮没有业务源码变更、构建、完整交互验收、真实业务请求/写入或部署；不以旧37场景结果充当本轮验证。当前仅提交维护清单及暂停现场，3个原有XML不纳入提交。

## 2026-10-14 work｜qianrong 现有合并冲突解决

- **交付**：master/9473440 已完成现有 merge，随后显式 pull --ff-only origin master、push origin master 成功；工作区干净，与远端一致，未切分支或设 upstream。
- **范围**：本地 8767573 仅新增锁文件；远端含 dh 79878c2/3904c7a 及同事 kimi 6c9cf15。190 个 dh 负责模块/公共支撑文件逐一保留，同事其它 163 路径变化（含153删除）保留，不恢复其清理内容。
- **冲突**：实际 AA 未合并项只有 pnpm-lock.yaml；20包与23依赖边一致，选择 dh 已推送的9.0格式。最后合并树与远端原树一致，双方历史保留，未安装依赖或迁移workspace。
- **验证**：生产构建9.14秒、1280px下37页面场景、日志详情与脱敏通过；运行错误及真实请求为0。已有构建提示与radio弃用提示保留，CodeGraph614文件最新，diff/冲突标记/信息隔离通过；未真实登录/菜单或权限联调/业务写入/部署。
- **记录**：docs/history/2026-10-14-work-qianrong-merge.md 保存完整现场及脚本校验边界；其它接口契约待确认继续保留。

## 2026-10-14 home｜qianrong静态模块与新接口续接

- **交付**：master/3904c7a已提交，再次显式pull同名master成功并push，业务工作区干净；仅qianrong25文件。
- **范围**：按用户恢复任务补13模块独立静态入口，复用现有列表/表单/权限树，新增接口日志与静态登录，资料内存保存；完成新版服务代理、systemList方法及8处直接地址修正。
- **验证**：最终构建4.19秒，37浏览器场景、日志交互与响应脱敏、资料取消/保存/刷新、登录校验/会话隔离、9请求契约及本地代理、4Vue编译通过；diff/隔离与CodeGraph最新。原radio弃用和全场景一条对象提示保留，未真实业务请求、登录/写入/上传联调或部署。
- **需求边界**：飞书原型本轮要求登录，沿用前13PRD记录，未重读原型/L2全文；权限迁移、角色DTO、旧辅助端点和接口日志后端继续待确认。详见docs/qianrong-static-modules.md和docs/history/2026-10-14-qianrong-static-modules.md。

## 2026-10-13 home｜根开发工具锁文件同步

- **交付**：master / 79878c2 已提交；再次pull同名master并push成功，工作区干净。
- **范围与授权**：用户明确合并提交已有本地改动，纳入原根pnpm锁文件并说明用途；不恢复暂停的qianrong接口调查，不改业务实现。
- **验证**：原锁文件SHA256保持，diff/隔离及CodeGraph通过；未应用构建、真实接口或部署。详情见docs/history/2026-10-13-home-root-lockfile-sync.md。

## 2026-10-12 home｜qianrong 全局列表与详情设计规范

- **交付**：master / 7d3dd63，作者 dh，提交后再次 pull 同名分支成功并已 push；53 文件仅在 qianrong，原根 pnpm-lock.yaml 保留、不提交、SHA256 未变。正矿 feature-v1.8.5 / f152a424 只作参照，工作区干净。
- **范围**：读取正矿 DESIGN_SPEC 与 dh 变更，集中令牌和详情皮肤；34 表单接入顶部标签/容器栅格，7 个负责模块查看头卡/返回，用户组角色左右系统菜单卡与选择草稿，个人资料查看编辑取消、密码清空、头像入口及日志 JSON。公开 UI_DESIGN_SPEC 与接入例子直接放 qianrong。
- **验证**：构建 5.20 秒、44 Vue 编译、268 原业务函数比较、32 脚本一致通过；23 场景 + 容器降格 + 16 页回归 + 公开 demo 八种尺寸/交互通过，diff/信息隔离通过，CodeGraph 最新。全程无 POST 或真实业务请求，未真实保存/权限刷新/图片上传联调，原工具告警和隔离控制台消息如实记录。
- **边界**：菜单权限迁移等待后端，登录鉴权沿用，接口日志暂无独立页面/接口。详细对照 docs/qianrong-design-standard.md，验收 docs/history/2026-10-12-qianrong-design-standard.md；未部署。

## 2026-10-11 home｜qianrong 负责模块与特殊列表

- **交付**：master / 97f1e31，作者 dh，提交后再次 pull 同名分支成功并已推送。根 pnpm-lock.yaml 保留、未提交，SHA256 未变；正矿仅参照 feature-v1.8.5 / f152a42，工作区干净。
- **范围**：负责的 13 个模块 PRD 阅读结论与当前实际口径已记录。现有模块补标题/右侧新增入口，菜单、日志及授权 Element 列表补轻量视觉外壳；部门启用 vxe 树、六个旧编辑表单和分配角色补固定底栏、个人中心补卡片布局。保留原生表格、权限与业务处理，公开示例说明同步更新。
- **验证**：最终构建 4.41 秒，25 个 Vue 文件编译、150 个原业务函数及 83 组按钮绑定比较通过；16 个隔离页面/组件和原 demo 回归、八种尺寸、diff 与信息隔离检查通过，CodeGraph 最新。全程无 POST 或真实业务请求，未真实账号/后端联调、未部署；现有构建及资料 radio 弃用告警如实保留。
- **暂缓**：菜单权限仍留用户组，等待后端后再迁移系统管理；登录鉴权沿用原方案。接口日志暂无独立页面和接口，未虚构接入。当前结论见 docs/qianrong-owned-modules.md；详细记录见 docs/history/2026-10-11-qianrong-owned-module-ui.md。

## 2026-10-11 home｜qianrong 本地测试接口代理

- **交付**：master / dbe5853，作者 dh，提交后再次 pull 同名分支成功并已推送。用户确认保留根 pnpm-lock.yaml，未纳入提交且内容未改。
- **范围**：仅 qianrong Vite 代理 target 指向 https://test-deppon.ftechain.com/api-deppon，移除原 /api-qianrong 请求前缀，保留查询参数；应用 README 补使用说明。
- **验证**：配置加载、五组路径及前缀边界检查通过；生产构建 4.33 秒通过，diff 与信息隔离检查通过，CodeGraph 最新。遵循用户补充要求只修改代码，未启动服务/代理，未请求真实接口或部署。
- 当前配置见 docs/qianrong-local-proxy.md，完整记录见 docs/history/2026-10-11-qianrong-local-proxy.md。

## 2026-10-11 home｜qianrong 列表、搜索和固定底栏

- **交付**：master / 7e1a00a，作者 dh，已推送；用户开启 SSH 密钥写权限后，再次 pull 同名分支成功，再次 push 成功，工作区干净。
- **范围**：41 个 Vue 文件中 42 处 vxe-grid 统一卡片、标题、操作对齐与大屏样式，升级既有 TableSearch 和 BottomFixedBtnsBox；保留原生表格实例与事件，轻量提取配置、标题和行操作，不再套表格引擎。只修改 apps/qianrong。
- **公开示例**：LIST_PAGE_DEMO.md、src/examples/ListPageDemo.vue 及独立 demo:list 入口直接放在 qianrong，供同事运行和复用，不进入正式菜单；维护规则及实施分析保持独立。
- **验证**：最终生产构建 5.64 秒；原有脚本及 576 组业务绑定比较通过；八种桌面尺寸、搜索重置、零值标签、日期、权限、更多操作、删除确认、分页、侧栏、全屏、列设置和底栏验证通过；示例无运行错误、控制台告警或真实接口请求。真实页面使用隔离请求挂载验收，没有真实账号联调或部署。
- **索引**：CodeGraph 最新，740 文件 / 9,500 节点 / 22,259 边；差异及信息隔离检查通过。完整来源、取舍与验证边界见 docs/history/2026-10-11-qianrong-list-style.md。


## 2026-10-12 work｜公司私人关联恢复

沿用 home 的 taiqian-front 与私人文档，补 work 根目录映射；master 从 8d2a8f0 快进至 7d3dd63。五项私人链接建立、再次预检与忽略验证通过，本机索引初始化后最新（745 文件）。未改业务源码、未构建或联调；完整关联记录见 docs/history/2026-10-12-work-association.md。


## 2026-10-13 work｜qianrong 新接口对照暂停

- **状态**：用户要求暂停代码开发，仅记录上下文并提交。业务 master / 7d3dd63 已 pull 成功且没有源码改动；未切换代理、未新增业务提交。
- **已知**：确认 dh 负责的 13 模块；新 Swagger JSON 读取 200 / 216 路径；105 包装对照中 86 路径/方法匹配、1 方法不符、18 未列出。八处导入/导出地址和代理需调整，角色 DTO 与菜单权限迁移仍需契约核对，接口日志仍无独立接口。
- **边界**：只有文档下载与捕获 request/XHR 的隔离检查，未真实业务请求、构建或部署；CodeGraph 当前最新。锁文件仅按授权暂存恢复，Git 换行转换已还原原字节，SHA256 一致，文件仍未跟踪且不提交，本轮 stash 已移除。
- **续接**：docs/qianrong-api-alignment.md 及 history/2026-10-13-qianrong-api-audit-paused.md 保存完整现场；下次按实际环境先 pull、刷新契约后实施，不在暂停期间自动恢复。

## 2026-10-26 ssh｜SSH 服务器私人关联

用户称「超级泰乾-qianrong」，核实 `/home/cc/dh/tq-plus` 即 front 仓库（master / 9975d7f，pull 已最新，origin 为用户 GitHub 的 tq-plus），复用 taiqian-front 与本私人目录。本机无 node，按 setup-links 规则手动建立五项软链接与本地忽略，check-ignore 全部命中、业务工作区干净；无 codegraph，索引未建。未改业务源码、未构建。用户再次明确：本项目和正矿一样走私人配置，文档更新只写本目录，不在业务仓库生成。详见 docs/workspace-association.md。

## 2026-10-26 ssh｜远端口径更正

用户确认本项目远端一直是 GitHub 上的 tq-plus 仓库，之前记录的「企业 Codeup 仓库」是写错的；已从 Hub Context、ssh 说明、关联文档与历史记录中去掉。

## 2026-10-26 ssh｜企业用户移除超级管理员信息

- **范围**：qianrong 企业用户新增/编辑/详情共用的 handleDetail.vue 删除「超级管理员信息」分组与手机号过滤函数，详情副标题同步；提交白名单保留 orgAdminName/orgAdminPhone，编辑原值原样回传、不清空。只改 1 个文件，不动 qianlian 与共享包。
- **验证**：本机无 Node/pnpm、无 codegraph，未构建、未浏览器验证、未真实请求；仅 diff 自查与信息隔离检查。说明见 docs/qianrong-enterprise-contract-audit.md。

## 2026-10-26 ssh｜角色配置权限改独立页面并去掉静态标识

- **同步**：master 536f662 快进至 c96f263（用户新增 permissions.vue 占位页）。
- **范围**：permissions.vue 承接原弹窗内容，dynamicRoutes 登记 `/system/role-permission/index/:roleId`，列表按钮改为跳转，删除 RolePermissionsDialog；四个面板与预览去掉静态/演示/示例标识，样例企业名去「示例」；测试移除弹窗、新增独立页面与无标识断言；README 改为配置页说明并保留未对接接口说明。数据仍为前端模型，保存不落库。
- **验证**：无 Node/codegraph，未构建、未跑 node --test、未浏览器验证；Python 核对新增断言正则命中。详见 docs/qianrong-role-logs.md。

## 2026-10-26 ssh｜角色配置权限页 UI 调整

permissions.vue 改用 DetailHeaderCard 头卡 + 白底区块卡包住四个标签（详情皮肤同令牌），修复迁成页面后没有白底的问题；脚本与面板不变。未构建、未浏览器验证。详见 docs/qianrong-role-logs.md。

## 2026-10-26 ssh｜系统中心页面不再因点列表调详情接口

新增 useOwnRouteLoad，系统中心 9 个页面（系统 / 部门 / 企业用户 / 角色 / 用户组 / 用户表单、菜单列字段、字典数据、配置权限）改为只在本页激活时按本页参数加载；新增 tests/own-route-load.test.mjs。未运行测试、未构建、未浏览器验证。详见 docs/qianrong-menu-route-lifecycle.md。

## 2026-10-26 ssh｜角色配置权限页行级/列级/预览改接现有接口

- **同步**：master 61b359c 已最新；Hub main 快进至 309dd1f。提交 master/3063971，再次 pull 后已 push。
- **改动**：抽出 RoleDataScopeForm、RoleColumnConfig 供列表弹窗与配置页共用；行级去掉选择列表/五档预设并去掉本企业；列级复用列字段配置；预览新增 preview-sources.js（组件路径→列表接口）与 preview-model.js，调接口带 previewRoleId 取最全 3 条；三标签用本页记录的 roleId；演示模型只留功能权限；README 与测试改写。
- **验证**：无 Node，未跑测试/构建/浏览器；previewRoleId 后端是否生效未核实。详见 docs/qianrong-role-permission-workspace.md。


## 2026-10-27 ssh｜菜单管理列字段设置只给名称含“列表”的页面菜单

column-model.js 新增 showColumnSettings（C 类型且 menuName 含“列表”），菜单管理行按钮改用它；新增 tests/menu-column-entry.test.mjs。跳转、权限、独立页与接口不变。无 Node，未跑测试/构建/浏览器。详见 docs/qianrong-menu-column-entry.md。

## 2026-10-27 ssh｜企业用户管理列表去掉用户组列、类型改按 org_type 字典

enterprise-users/index.vue：删“所属用户组”列及其渲染函数；“企业用户类型”dict-tag 改用 org_type。表单、接口不变。无 Node，未构建/浏览器验证。详见 docs/qianrong-enterprise-contract-audit.md。

## 2026-10-27 ssh｜切 dev 分支；登录页背景铺满

- **分支**：远端只有 master；master 7ef890f 同名 pull 已最新，本地 `checkout -b dev`，`pull origin dev` 报远端无此分支；按用户确认从 master 新建并推送 origin/dev。
- **改动**：GeneralLogin.vue 背景改 import 图片 + 绝对定位 img（object-fit cover），外层 min-height max(720px,100vh)，卡片/页脚 z-index 1。根因是后一 style 块 height:auto 覆盖 100vh。
- **验证**：无 Node，未构建/浏览器。详见 docs/qianrong-web-login.md 末节。

## 2026-10-29 ssh｜用户组两处阻断放行

- **需求**：用户组新增/编辑页面不再被「用户组详情未返回菜单授权，已停止保存」和「系统授权菜单暂不可读取，已停止配置」卡住。
- **改动**：group-menu-model.js 中 groupGrants 缺字段时返回 null；systemPermissionScope 把读不到的编号拆成 hiddenIds，不再抛错。handleDetail.vue 在缺授权时跳过一致性核对、默认勾选并显示 warning；hiddenMenuIds 保存时原样追加，并且不进撤权确认。group-menu-contract.test.mjs 断言同步更新。
- **验证**：无 Node，测试与构建未运行，未浏览器/联调；git diff --check 通过。详见 docs/qianrong-group-menu-inheritance.md 末节。

## 2026-10-29 ssh｜角色新增/编辑放行上级用户组菜单不可读

- **需求**：角色新增/编辑的同类阻断也放行。
- **改动**：handleDetail.vue 提交时去掉 unavailable 系统阻断，这类系统原 menuIds 原样提交、不算撤权；提示文案改为原样保留。
- **验证**：无 Node，未构建/浏览器/联调；git diff --check 通过。

## 2026-10-29 ssh｜角色管理关联系统全部可选

- **改动**：role handleDetail.vue 系统选项 disabled 固定 false；menuTreeList 外和停用的系统都可勾，上级读不到的系统为空树。
- **验证**：无 Node，未构建/浏览器/联调；git diff --check 通过。待确认后端是否接受只关联系统、menuIds 为空。

## 2026-10-29 ssh｜企业用户实控人身份证号格式校验

- **需求**：新增/编辑企业用户的实控人身份证号校验 18 位身份证格式。
- **改动**：EnterpriseBusinessFields.vue 给 actualControllerIdNumber 加 blur 校验与 maxlength 18；字段仍选填，留空不校验；模板 rules 兼容 field.rules。
- **验证**：无 Node，未构建/浏览器/联调；正则 python 样例核对、git diff --check、信息隔离自查通过。详见 docs/qianrong-enterprise-contract-audit.md 末节。dev/80cfcf6 已推送。

## 2026-10-29 ssh｜部门、用户、角色所属企业按账户类型

- **需求**：后端口径——部门、用户、角色必须有所属企业，非平台账户取默认登录企业可不选；角色必须选用户组；role/optionselect、GET /system/user/ 新增可选 orgId。
- **改动**：isPlatformUserType；auth/store 新增 loginOrgId；共用 org-options.js；部门、用户表单平台账户加必填所属企业并按企业取上级部门/归属部门/角色/岗位；角色表单非平台隐藏企业、按登录企业取用户组。
- **验证**：无 Node，未构建/测试/浏览器/联调；git diff --check、信息隔离自查通过。dev/4df38d0 已推送。详见 docs/qianrong-org-scope-forms.md。
