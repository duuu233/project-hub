# work本地后端及认证响应适配

## 范围与同步

2026-10-20，work。两仓工作区干净，先显式pull当前main/master成功；业务起点master/16013c9，保留之前两个未推送提交，不切分支。本轮继续此前用户“不push”要求，仅本地交付，不部署。

用户最初提出根据00/01/02/03调整角色规则；核对本地Swagger后发现defaultAuthorize DTO仅有systemId，缺少新角色选择契约，遂询问适用入口。用户最终明确：“先不管角色了，先连本地IP，然后可以正常登陆，不管角色”。因此本轮不增加02必填角色、不改身份树及roleId既有传递规则，不恢复登录身份过渡页。

## 实施

- 开发代理目标改为http://192.168.1.114:8081/api-qianrong，保留既有单前缀rewrite与query，应用README同步；生产构建网关、另一应用和共享包不变。
- 本地Swagger的第2步已从R<string>改为R<默认登录认证结果>，data含token及字符串userType。新增专用解析器，先校验两字段再安装会话，继续只向认证发送username及原规则编码password。第5步仍从data字符串读新Token，不混用。
- userType作为UI元数据保存于Store/sessionStorage，覆盖待授权刷新重试；退出/更换账号及成功身份切换清理，getInfo读取当前类型。它不参与服务端授权或菜单/接口权限授予，不新增管理员请求标识，不复制Token/密码到新存储。
- 本地defaultAuthorize明确00不要求系统/用户组；校验成功结果时保留orgId及已有ID校验，允许00的systemId/userGroupId为空，避免后端已授权而前端报非法ID。其它类型保留既有上下文校验；既有无角色defaultAuthorize结果仍可使用，本轮不新增角色必填拦截。
- 继续1→2→3成功直接进入系统，失败原页重试；顶部和个人中心切换入口及新Token重载权限行为不变。

## 验证

- 76项隔离模型/API/Store探针通过，涵盖四种userType、新旧Token结构分离、非法响应不安装会话、00空系统/用户组、其它类型上下文、角色规则不新增、待授权重试、元数据清理/存储不可用及原权限清理/迟到请求防护。
- 17项真实Vue/Pinia/Router/组件浏览器场景使用合成API响应通过；包含原12项登录直达/双切换入口及00空上下文刷新、四类型1–3直达。没有页面异常或外部请求；个人中心无关子组件使用隔离桩，顶部入口复用真实IdentitySwitcher但不宣称已验收完整Navbar。
- 使用真实vite.config.js启动隔离开发代理；真实本地Swagger GET与匿名loginSystemList GET均HTTP 200，后者业务code=200、data数组；断言目标、单API前缀和query保留。未向后端发送账号密码、真实认证/授权/身份切换或业务写入。
- npm run build通过（5.90秒）；既有背景资源、CSS :export、较大chunk警告保留，不借本轮修改。CodeGraph sync/status完成，679文件；git diff --check及变更范围检查通过。
- 没有真实账号凭据，不能宣称实际账号已登录、后端权限及业务数据范围已验证。用户需重启自己的开发服务，在可信局域网中使用真实账号联调；HTTP仅用于当前指定的本地后端。

## 交付

业务master/c3bba2d已本地提交5文件、工作区干净，连同此前两轮共领先origin/master三提交；维护记录同样仅本地提交，不push。本轮只改qianrong的代理、认证解析及相关UI元数据，不变更依赖或其它项目。新增角色规则待用户后续确认完整接口契约再实施。
