# qianrong Web 登录与身份授权

> 状态：Active；2026-10-20 work 核验。
> 依据：产品提供的《登录管理.md》与同日开发环境 Swagger。本文替代旧企业类型、登录前企业/角色选择及首页项目权限缓存的 Web 口径；不改 qianlian 或后端保留的 SSO/H5 接口。
> 本轮按用户要求仅本地交付，不 push；真实账号及各类管理员/用户数据范围尚待联调。

> 最新交互口径：用户追加明确登录页只使用1→2→3，成功后直接进入系统，不增加“选择登录身份”中间页。4/5用于登录后的系统/身份切换，个人中心与顶部两个入口都保留。

接口来源：[开发环境 Swagger JSON](https://dev-qianrong.ftechain.com/api-qianrong/v2/api-docs)。编号以登录管理摘要1–5为准，实际请求以paths内URL为准。

## 五个接口与调用时序

| 编号 | 接口 | 客户端处理 |
| --- | --- | --- |
| 1 | GET `/api-qianrong/loginSystemList` | 匿名查询启用系统，读 `data` 数组，使用 SysSystem.id/systemName/systemLogo；显示可选系统，也允许不指定系统 |
| 2 | POST `/api-qianrong/defaultLogin` | 匿名，只传 username/password；username 去首尾空格，password 按原 Web 规则对 `username_原密码` Base64 编码，不裁剪密码、不发送 orgId/roleId/loginType |
| 3 | POST `/api-qianrong/defaultAuthorize` | 携带第2步Token，只传可选 systemId；未选择时 body 为 `{}`。读取 `data.contextSelected/context`，不从前端判断账户是否管理员，不传企业、部门或管理员标记 |
| 4 | GET `/api-qianrong/loginIdentityTree` | 登录后打开顶部或个人中心“切换系统”弹窗时才查询；不改变会话，不作为登录页默认授权失败的兜底步骤 |
| 5 | POST `/api-qianrong/changeLogin` | 携带当前Token，提交身份树所选完整身份；成功从 `data` 取新Token，再重建资料、权限和路由 |

默认登录为1→2→3→getInfo→getRouters，成功即进入第一个可访问菜单。第3步更新原Token，不替换Token；第3步无身份或失败时只在登录页显示错误，保留认证状态供用户更换系统重试第3步，或点击“更换账号”清本地认证后重新走第2步；不查询身份树、不调用第5步，也不进入过渡页。

第2和第5接口只认带泛型R的 `data` 字符串，不再兼容顶层token。getInfo/getRouters沿用原格式，资料读顶层user/roles/permissions，菜单读data。请求前缀、Authorization注入及统一code处理沿用现有request；两个匿名接口显式关闭Token。认证POST关闭公共重复提交缓存，页面分别做在途按钮保护，不把编码密码存入sessionObj。

## 组件和状态职责

- `views/login.vue`：通用登录入口和标题，不再按domainType/loginType切换旧模板。
- `components/Login/GeneralLogin.vue`：保留原品牌图与色彩，展示系统名称/Logo、账号和密码；表单交互交给useWebLogin。
- `useWebLogin.js`：系统查询/失败重试、默认认证授权、加载与错误、成功后直接导航；密码仅在表单内存，账号认证成功后清空。尚待默认授权时，登录页允许只重试第3步或更换账号。
- `IdentityPicker.vue`：顶部及个人中心弹窗共用的身份树、搜索、刷新、节点选择、管理员提示、空态和错误；对外接收busy/submitError并发出confirm(node)。唯一键使用后端key，不以可能重复的业务id为节点键。
- `IdentitySwitcher.vue`：顶部与个人中心“切换系统”的共用弹窗与提交、成功后全页重载。原`views/identity.vue`及其路由已删除；个人中心在原资料/密码功能之外增加切换系统卡片。
- `identity-model.js`：ID归一、泛型Token读取、系统/身份树校验、同层级身份参数、站内登录回跳及首个可访问菜单。
- user Store：认证、默认授权、身份轮换、真实getInfo和会话清理；权限Store只转换后端菜单并返回动态路由，由守卫统一登记/撤销。

## 身份选择规则

系统、企业及部门节点仅作结构/展示，不可确认。角色节点必须得到同一分支orgId/systemId/userGroupId/roleId；用户组仅在adminLoginAllowed严格为true时可直接确认，提交不含roleId。页面明确提示“无角色登录就是管理员登录”；不会根据userId=1、角色列表为空或来源账户类型推断管理员，也不会在角色校验失败后重试成无角色登录。

deptId可选，本轮不提供任意部门选择，不提交部门字段，由后端自动选择目标账户的有效所属部门。不能把树中企业旁的部门展示节点当成用户组/角色或凭它授权。

节点层级继承仅补齐当前分支上下文，发现父子显式ID矛盾、重复key或非法结构即报错，不拼接其它分支；不同类型/分支的业务ID重复不影响选择。0是有效ID；不接受已失真的非安全数字；int64字符串保精度，超安全范围使用字符串序列化。后者仍需真实服务绑定验收，不声称隔离测试证明后端已接受超大ID。

## 待授权、刷新与权限清理

- 认证成功即清除旧用户资料/权限，把待授权UI状态写入sessionStorage的qianrong-authorization-pending，仅保存布尔状态，不另存Token或密码。这只用于刷新后留在登录页重试授权，不新增服务端来源标记、会话版本或权限判断。后端仍独立检查Token、身份及接口权限。
- 默认授权失败、contextSelected=false或结果格式错误时保留认证状态，在登录页内提示更换系统重试第3步。未授权Token不得因为已存在Cookie而进入旧菜单；刷新或直达业务地址仍回登录页。不用4/5绕开默认授权失败。
- 登录态加载以infoLoaded标记资料是否读过，不以roles.length作哨兵；无角色管理员不伪造ROLE_DEFAULT。每次会话启动getInfo从后端取，不用本地旧资料缓存恢复权限；空角色及空权限必须替换旧数组，不残留上次身份。
- changeLogin失败保留原Token、资料和权限；成功先校验新Token并清资料缓存，然后整页进入根路径，重新getInfo/getRouters；不继承旧菜单、标签页或KeepAlive视图，不强行跳回新身份无权访问的旧业务地址。
- 同一SPA退出/重新登录也会按Token变化撤销之前登记的业务与隐藏动态路由、重置菜单和标签；已授权但无可访问业务菜单时进入原个人中心，可在那里切换系统，不设置新的过渡页。资料/菜单加载失败会提示并清本地会话回登录，避免有Token时登录与根路径循环跳转。
- getInfo响应到达时核对当前Token，认证/切换也做本地在途请求失效检查，退出后不接纳迟到请求。此为内存异步取消保护，不向接口增加会话版本参数。
- 退出服务失败仍清本地凭据与状态并回登录；不宣称网络失败时服务端Token已撤销。旧Cookie键和SSO解析、外部系统切换、嵌入模式保持原入口，未真实验收外部SSO。

## 移除与保留边界

移除qianrong的TypeLogin旧模板、旧登录前企业/角色辅助包装及调用、域名推导loginType的启动写入、ProjectSelect及setCache/getDataSelectList包装。源码中不再使用loginType/loginOrgList/loginRoleList/setCache。没有读取或清除旧首页数据权限缓存；旧localStorage历史项不批量清理。

保留注册/验证码、登出、资料、菜单接口，认证工具原Cookie键、SSO工具/外部系统下拉以及嵌入模式；不修改qianlian、共享包、业务菜单配置、角色权限配置或后端数据范围实现。00/01/02/03及selectedRole的数据范围都由后端执行，不在前端模拟。

## 本地验收

在apps/qianrong启动现有开发命令，选择系统或自动选择，使用真实账号验证1→2→3后直接进入系统。默认授权失败时只在原登录页更换系统重试或更换账号；确认此过程不调用4/5。登录后分别从顶部及个人中心“切换系统”打开身份树，测试角色/管理员选择、成功轮换及失败保留原身份。覆盖刷新、退出后换用户、不同系统下同企业/同ID节点、角色拒绝、部门展示、空身份/空菜单及接口过期。

初版验证及交互变更原因见[首次实施记录](history/2026-10-20-work-web-login-refactor.md)；最新登录直达/双入口口径及本轮实际验证见[入口修正记录](history/2026-10-20-work-web-login-entry-correction.md)。测试身份、Token和接口数据全为合成值，无真实登录/授权/切换或业务写入，不能据此认定真实管理员权限及数据范围已验收。工具链和依赖不升级。
