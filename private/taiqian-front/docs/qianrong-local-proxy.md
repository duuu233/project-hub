# qianrong 本地接口代理

- 当前开发目标：`http://192.168.1.114:8081/api-qianrong`；2026-10-20按用户要求切换到work局域网后端。
- 入口为 `apps/qianrong/vite.config.js` 的 `server.proxy['/api-qianrong']`。target包含 `/api-qianrong`，转发前移除请求中的一个同名前缀；例如 `/api-qianrong/system/page?status=0` 对应目标同一路径，查询保持不变且没有双前缀。
- 请求层 `baseURL` 和开发环境 `VITE_APP_BASE_API` 保持为空；接口、上传和资源组件原有的 `/api-qianrong` 请求由同一开发代理接收，不重复添加目标前缀。
- `changeOrigin: true`；当前目标是HTTP，未新增关闭HTTPS证书校验的配置。该配置只作用于应用开发服务；生产和 staging 构建的网关口径未改，qianlian 及共享包未改。
- 修改配置后，由开发者重启自己的正常开发服务；只在可信局域网联调，离开该网络后此IP可能不可达。旧demo命令已经由a61445b清理，不再作为联调入口。
- 团队使用说明见应用 README 的「本地接口代理」。实施验证记录见 [history/2026-10-11-qianrong-local-proxy.md](history/2026-10-11-qianrong-local-proxy.md)。

## 当前本地服务验证（2026-10-20）

使用真实vite.config.js启动隔离开发代理，GET `/api-qianrong/v2/api-docs`及匿名`/api-qianrong/loginSystemList`均返回HTTP 200，系统列表业务code=200且data为数组；确认只保留一个API前缀和完整查询参数。没有发送真实账号、密码或defaultLogin/defaultAuthorize/changeLogin请求。新认证响应及真实账号待验收边界见[本轮记录](history/2026-10-20-work-local-login-response.md)。


## 历史：新服务续接（2026-10-14）

前一天用户暂停的切换已在本轮恢复实施，同时修正systemList GET与8处直接导入导出地址。只读获取Swagger和本地捕获代理验证通过，未调用真实业务服务或宣称后端已接通；旧端点与权限DTO问题见 [接口对照](qianrong-api-alignment.md)，静态范围见 [模块说明](qianrong-static-modules.md)，本轮验收见 [历史](history/2026-10-14-qianrong-static-modules.md)。旧代理及暂停现场保留在各自历史文档。
