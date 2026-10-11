# 2026-10-11：泰乾超级身份与私人挂载

- 环境 home；Hub main / 626a0a6、本轮涉及的 front master / 8d2a8f0 与正矿 feature-v1.8.5 / f152a42 均从干净工作区先 pull 同名分支成功。
- 用户指定 front 名称为泰乾超级，沿用 taiqian-front ID 和原 home 路径；子应用 apps/qianrong 简称泰乾超级-qianrong，复用根 Git/映射，不拆第二个仓库。
- 注册表增加五项 private_mounts，初始化 private/taiqian-front 的规则、背景、文档、日志与索引忽略文件；更新 README、Context 和配置口径。其他环境映射未改。
- 本机先 dry-run 核实无实体冲突，再建立五项 NTFS Junction/SymbolicLink；业务 .git/info/exclude 忽略所有挂载，复核均指向本项目私人目录。CodeGraph 按用户授权初始化并在改造后同步，本机数据库、日志、依赖与缓存不提交。
- 用户明确示例供同事阅读，因此可运行列表示例和 LIST_PAGE_DEMO.md 直接提交 qianrong；私人维护资料不混入业务公开文件。
- 具体界面、源码和验收维护在项目私人文档及公开使用说明；全局流水只登记范围、交付和验证概况，保留旧迭代。
- 验证：setup-links 复核五项 existing，注册表/Context/home 身份一致，ID/名称唯一，无新环境或新仓库映射，diff 和隔离检查通过。正矿业务保持干净。
- 业务交付：master / 7e1a00a 已推送；SSH 密钥写权限经用户开启后，再次 pull 同名分支成功再 push。Hub 配置和记录在 main 提交，提交后再次 pull 同名分支成功再 push；未创建 PR 或部署。
