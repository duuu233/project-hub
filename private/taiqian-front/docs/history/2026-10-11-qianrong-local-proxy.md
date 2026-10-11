# 2026-10-11 home：qianrong 测试接口与本地代理配置

- 用户要求将 qianrong 请求切至 `https://test-deppon.ftechain.com/api-deppon`，随后明确只修改代码、不启动代理或开发服务。
- 开始 Hub main / daca991、业务 master / 7e1a00a；业务唯一未提交项是未跟踪的根 `pnpm-lock.yaml`。依规则先询问，用户确认保留且不纳入本次提交，再 pull 后修改。Hub 与业务显式 pull 当前同名分支均成功。
- 先同步 CodeGraph，再读取配置、请求层、接口和上传资源组件。实际接口普遍硬编码 `/api-qianrong`，请求层 baseURL 为空；原开发代理使用该前缀转发到旧内网主机，开发环境 BASE_API 为空。
- 最小修改为 qianrong Vite target 替换成完整测试地址，新增前缀 rewrite；不修改大量接口定义、不重复拼接 `/api-deppon`，查询参数保留。应用 README 补团队使用方法。qianlian、共享包和生产/staging 网关口径不变。
- 配置加载验证五组请求（登录、上传、导出及编码查询、根路径、仅查询）和前缀边界通过；确认 changeOrigin、开发 BASE_API 和 target，无重复前缀。未启动服务、未发送真实接口请求。
- qianrong 生产构建 4.33 秒成功；构建仍报告已有背景图、CSS :export、较大产物及插件耗时告警。diff 和信息隔离检查通过。CodeGraph 最新，741 文件 / 9,500 节点 / 22,259 边，其中新 YAML 来自保留的本机锁文件，不纳入本次提交。
- 本轮业务只提交 Vite 配置与应用 README，master / dbe5853 已推送；提交后再次 pull 同名 master 成功再 push。pnpm-lock.yaml 内容哈希在交付前后相同，保留且未提交。未真实账号联调、未启动代理、未部署。
