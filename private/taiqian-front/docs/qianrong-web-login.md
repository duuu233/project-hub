# qianrong Web 登录与身份授权

> 状态：Active；2026-10-20 work 核验。
> 依据：产品提供的《登录管理.md》与同日开发环境 Swagger。本文替代旧企业类型、登录前企业/角色选择及首页项目权限缓存的 Web 口径；不改 qianlian 或后端保留的 SSO/H5 接口。
> 本轮按用户要求仅本地交付，不 push；真实账号及各类管理员/用户数据范围尚待联调。

接口来源：[开发环境 Swagger JSON](https://dev-qianrong.ftechain.com/api-qianrong/v2/api-docs)。编号以登录管理摘要1–5为准，实际请求以paths内URL为准。

## 五个接口与调用时序

| 编号 | 接口 | 客户端处理 |
| --- | --- | --- |
| 1 | GET `/api-qianrong/loginSystemList` | 匿名查询启用系统，读 `data` 数组，使用 SysSystem.id/systemName/systemLogo；显示可选系统，也允许不指定系统 |
| 2 | POST `/api-qianrong/defaultLogin` | 匿名，只传 username/password；username 去首尾空格，password 按原 Web 规则对 `username_原密码` Base64 编码，不裁剪密码、不发送 orgId/roleId/loginType |
| 3 | POST `/api-qianrong/defaultAuthorize` | 携带第2步Token，只传可选 systemId；未选择时 body 为 `{}`。读取 `data.contextSelected/context`，不从前端判断账户是否管理员，不传企业、部门或管理员标记 |
| 4 | GET `/api-qianrong/loginIdentityTree` | 携带当前Token，按需获取同账号身份树；不改变会话。用于默认授权无身份、默认授权失败后的人工选择及顶部切换 |
| 5 | POST `/api-qianrong/changeLogin` | 携带当前Token，提交身份树所选完整身份；成功从 `data` 取新Token，再重建资料、权限和路由 |

默认登录为1→2→3→getInfo→getRouters。第3步更新原Token，不替换Token；第3步明确无身份时保留已认证Token并进入 `/identity`，不调用业务菜单或资料接口。第4/5步不是每次默认登录都必须执行。

第2和第5接口只认带泛型R的 `data` 字符串，不再兼容顶层token。getInfo/getRouters沿用原格式，资料读顶层user/roles/permissions，菜单读data。请求前缀、Authorization注入及统一code处理沿用现有request；两个匿名接口显式关闭Token。认证POST关闭公共重复提交缓存，页面分别做在途按钮保护，不把编码密码存入sessionObj。

## 组件和状态职责

- `views/login.vue`：通用登录入口和标题，不再按domainType/loginType切换旧模板。
- `components/Login/GeneralLogin.vue`：保留原品牌图与色彩，展示系统名称/Logo、账号和密码；表单交互交给useWebLogin。
- `useWebLogin.js`：系统查询/失败重试、默认认证授权、加载与错误、成功后导航；密码仅在表单内存，已认证转人工选择时清空。
- `IdentityPicker.vue`：两处共用的身份树、搜索、刷新、节点选择、管理员提示、空态和错误；对外接收busy/submitError并发出confirm(node)。唯一键使用后端key，不以可能重复的业务id为节点键。
- `IdentitySwitcher.vue`：顶部切换弹窗的提交和新身份全页重载；`views/identity.vue`：待授权/无菜单选择页和退出入口。
- `identity-model.js`：ID归一、泛型Token读取、系统/身份树校验、同层级身份参数、站内登录回跳及首个可访问菜单。
- user Store：认证、默认授权、身份轮换、真实getInfo和会话清理；权限Store只转换后端菜单并返回动态路由，由守卫统一登记/撤销。

## 身份选择规则

系统、企业及部门节点仅作结构/展示，不可确认。角色节点必须得到同一分支orgId/systemId/userGroupId/roleId；用户组仅在adminLoginAllowed严格为true时可直接确认，提交不含roleId。页面明确提示“无角色登录就是管理员登录”；不会根据userId=1、角色列表为空或来源账户类型推断管理员，也不会在角色校验失败后重试成无角色登录。

deptId可选，本轮不提供任意部门选择，不提交部门字段，由后端自动选择目标账户的有效所属部门。不能把树中企业旁的部门展示节点当成用户组/角色或凭它授权。

节点层级继承仅补齐当前分支上下文，发现父子显式ID矛盾、重复key或非法结构即报错，不拼接其它分支；不同类型/分支的业务ID重复不影响选择。0是有效ID；不接受已失真的非安全数字；int64字符串保精度，超安全范围使用字符串序列化。后者仍需真实服务绑定验收，不声称隔离测试证明后端已接受超大ID。

## 待授权、刷新与权限清理

- 认证成功即清除旧用户资料/权限，把待授权UI状态写入sessionStorage的qianrong-authorization-pending，仅保存布尔状态，不另存Token或密码。这只是刷新时保留选择页的展示标记，不新增服务端来源标记、会话版本或权限判断。后端仍独立检查Token、身份及接口权限。
- 默认授权失败、contextSelected=false或结果格式错误时保留认证状态，可通过身份树继续。未授权Token不得因为已存在Cookie而进入旧菜单；刷新或直达业务地址仍回到身份页。
- 登录态加载以infoLoaded标记资料是否读过，不以roles.length作哨兵；无角色管理员不伪造ROLE_DEFAULT。每次会话启动getInfo从后端取，不用本地旧资料缓存恢复权限；空角色及空权限必须替换旧数组，不残留上次身份。
- changeLogin失败保留原Token、资料和权限；成功先校验新Token并清资料缓存，然后整页进入根路径，重新getInfo/getRouters；不继承旧菜单、标签页或KeepAlive视图，不强行跳回新身份无权访问的旧业务地址。
- 同一SPA退出/重新登录也会按Token变化撤销之前登记的业务与隐藏动态路由、重置菜单和标签；空菜单落到身份页，不在根路径无限重定向。
- getInfo响应到达时核对当前Token，认证/切换也做本地在途请求失效检查，退出后不接纳迟到请求。此为内存异步取消保护，不向接口增加会话版本参数。
- 退出服务失败仍清本地凭据与状态并回登录；不宣称网络失败时服务端Token已撤销。旧Cookie键和SSO解析、外部系统切换、嵌入模式保持原入口，未真实验收外部SSO。

## 移除与保留边界

移除qianrong的TypeLogin旧模板、旧登录前企业/角色辅助包装及调用、域名推导loginType的启动写入、ProjectSelect及setCache/getDataSelectList包装。源码中不再使用loginType/loginOrgList/loginRoleList/setCache。没有读取或清除旧首页数据权限缓存；旧localStorage历史项不批量清理。

保留注册/验证码、登出、资料、菜单接口，认证工具原Cookie键、SSO工具/外部系统下拉以及嵌入模式；不修改qianlian、共享包、业务菜单配置、角色权限配置或后端数据范围实现。00/01/02/03及selectedRole的数据范围都由后端执行，不在前端模拟。

## 本地验收

在apps/qianrong启动现有开发命令，先读系统列表，选择系统或自动选择，使用真实账号测试默认登录。无默认身份时选择角色或明确允许管理员登录的组；登录后从顶部“切换身份”测试成功轮换及失败不变更。覆盖刷新、退出后换用户、不同系统下同企业/同ID节点、角色拒绝、部门展示、空身份/空菜单、认证/默认授权失败及接口过期。

本轮隔离验证为59项模型/API/Store检查和15项真实Vue Router/Pinia/Element Plus浏览器场景，生产构建通过，详情见[实施记录](history/2026-10-20-work-web-login-refactor.md)。测试身份、Token和接口数据全为合成值，无真实登录/授权/切换或业务写入，不能据此认定真实管理员权限及数据范围已验收。工具链和依赖不升级。
