# 泰乾超级实施记录

当次改动、来源、验证与边界按日期追加，具体口径以 docs 中当前文档为准。

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
