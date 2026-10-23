# 菜单表单跨页面重复请求修复

- 日期/环境：2026-10-23 work。用户先报告用户组列表请求 `/api-qianrong/system/menu/undefined`，随后确认任意列表切换均复现，并明确要求修复。
- 起点：两仓工作区干净，当前同名分支先 pull；业务 master/d08dab3，统筹 main/7d53f50。项目规则、上下文、菜单文档与索引已核对，不操作其它远端。
- 根因：菜单编辑/详情页被 KeepAlive 缓存后仍监听全局 currentRoute.query；旧 watch getter 每次返回新数组，路由切换使回调再次加载；load 未校验路由与 id，列表缺 id 就拼 undefined，其他实体带 id 也会误用。请求错误本身不会自动重试。
- 修改：只改共用菜单表单、添加生命周期行为回归和应用说明。记录所属路径、缓存活动状态与参数快照，校验 ID 和响应归属，停用/卸载时令旧请求失效，保留相同参数的成功草稿及失败重试；补齐离开后保存的跳转保护与忙碌状态清理。未改公共缓存、API 契约、授权模型、qianlian 或 packages。
- 回归：新增 10 组真实 Vue SFC setup + Router + KeepAlive 测试；旧代码先验证失败，包括跨列表 undefined、跨实体误用 ID、草稿重置等。最终全量 50 项通过。
- 浏览器：真实菜单 SFC、Element Plus、Vue Router/KeepAlive，以模拟 request 验证失败后切换用户组/角色/系统列表及另一实体编辑页不新增请求、返回重试、成功后保留草稿、编辑/详情隔离、缺 ID 阻断和新增父节点。1280/768 两尺寸截图已检查，无水平溢出；无页面运行时异常或外部业务请求。隔离示例缺全局图标注册及开发模式组件枚举/现有 radio 提示未计为生产故障。
- 构建：qianrong `npm run build` 通过，15.84 秒；保留已有登录图片路径、SCSS :export 和大包提示。无独立 lint/type-check。未真实登录或写菜单，未部署。
- 索引：代码完成后 CodeGraph sync/status；仅本机派生缓存，不提交。差异与业务信息隔离检查通过。
- 交付：按 master 提交，push 前再次显式同名 pull 后推送 origin；文档与实施日志在统筹 main 单独提交推送。回退按本轮业务提交 revert，不恢复缓存跨页读取行为。
- 最终业务提交：master/8b163cd，已再次同名 pull 后 push origin，真实远端 SHA 一致且工作区干净；CodeGraph sync/status 最新。
