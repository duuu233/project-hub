# qianrong 本地接口代理

- 当前开发目标：`https://dev-qianrong.ftechain.com/api-qianrong`；2026-10-14按用户恢复任务完成切换。
- 入口为 `apps/qianrong/vite.config.js` 的 `server.proxy['/api-qianrong']`。target包含 `/api-qianrong`，转发前移除请求中的一个同名前缀；例如 `/api-qianrong/system/page?status=0` 对应目标同一路径，查询保持不变且没有双前缀。
- 请求层 `baseURL` 和开发环境 `VITE_APP_BASE_API` 保持为空；接口、上传和资源组件原有的 `/api-qianrong` 请求由同一开发代理接收，不重复添加目标前缀。
- `changeOrigin: true`，未关闭 HTTPS 证书校验。该配置只作用于应用开发服务；生产和 staging 构建的网关口径未改，qianlian 及共享包未改。
- 修改配置后，由开发者重启自己的正常开发服务。独立 `npm run demo:modules` 使用无代理配置，业务路径与HTTP写入均被阻止，不作为业务联调入口。
- 团队使用说明见应用 README 的「本地接口代理」。实施验证记录见 [history/2026-10-11-qianrong-local-proxy.md](history/2026-10-11-qianrong-local-proxy.md)。


## 新服务续接（2026-10-14）

前一天用户暂停的切换已在本轮恢复实施，同时修正systemList GET与8处直接导入导出地址。只读获取Swagger和本地捕获代理验证通过，未调用真实业务服务或宣称后端已接通；旧端点与权限DTO问题见 [接口对照](qianrong-api-alignment.md)，静态范围见 [模块说明](qianrong-static-modules.md)，本轮验收见 [历史](history/2026-10-14-qianrong-static-modules.md)。旧代理及暂停现场保留在各自历史文档。
