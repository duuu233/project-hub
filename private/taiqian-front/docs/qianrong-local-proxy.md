# qianrong 本地接口代理

- 当前开发目标：`https://test-deppon.ftechain.com/api-deppon`。
- 入口为 `apps/qianrong/vite.config.js` 的 `server.proxy['/api-qianrong']`。`target` 包含 `/api-deppon`，转发前移除 `/api-qianrong`；例如 `/api-qianrong/login` 转发成目标的 `/api-deppon/login`，查询参数不变。
- 请求层 `baseURL` 和开发环境 `VITE_APP_BASE_API` 保持为空；接口、上传和资源组件原有的 `/api-qianrong` 请求由同一开发代理接收，不重复添加目标前缀。
- `changeOrigin: true`，未关闭 HTTPS 证书校验。该配置只作用于应用开发服务；生产和 staging 构建的网关口径未改，qianlian 及共享包未改。
- 修改配置后，由开发者重启自己的开发服务。此次用户只要求配置代码，不启动服务或代理进程。
- 团队使用说明见应用 README 的「本地接口代理」。实施验证记录见 [history/2026-10-11-qianrong-local-proxy.md](history/2026-10-11-qianrong-local-proxy.md)。
