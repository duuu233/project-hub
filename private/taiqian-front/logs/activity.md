# 泰乾超级实施记录

当次改动、来源、验证与边界按日期追加，具体口径以 docs 中当前文档为准。

## 2026-10-12 home｜qianrong 全局列表与详情设计规范

- **交付**：master / 7d3dd63，作者 dh，提交后再次 pull 同名分支成功并已 push；53 文件仅在 qianrong，原根 pnpm-lock.yaml 保留、不提交、SHA256 未变。正矿 feature-v1.8.5 / f152a424 只作参照，工作区干净。
- **范围**：读取正矿 DESIGN_SPEC 与 dh 变更，集中令牌和详情皮肤；34 表单接入顶部标签/容器栅格，7 个负责模块查看头卡/返回，用户组角色左右系统菜单卡与选择草稿，个人资料查看编辑取消、密码清空、头像入口及日志 JSON。公开 UI_DESIGN_SPEC 与接入例子直接放 qianrong。
- **验证**：构建 5.20 秒、44 Vue 编译、268 原业务函数比较、32 脚本一致通过；23 场景 + 容器降格 + 16 页回归 + 公开 demo 八种尺寸/交互通过，diff/信息隔离通过，CodeGraph 最新。全程无 POST 或真实业务请求，未真实保存/权限刷新/图片上传联调，原工具告警和隔离控制台消息如实记录。
- **边界**：菜单权限迁移等待后端，登录鉴权沿用，接口日志暂无独立页面/接口。详细对照 docs/qianrong-design-standard.md，验收 docs/history/2026-10-12-qianrong-design-standard.md；未部署。

## 2026-10-11 home｜qianrong 负责模块与特殊列表

- **交付**：master / 97f1e31，作者 dh，提交后再次 pull 同名分支成功并已推送。根 pnpm-lock.yaml 保留、未提交，SHA256 未变；正矿仅参照 feature-v1.8.5 / f152a42，工作区干净。
- **范围**：负责的 13 个模块 PRD 阅读结论与当前实际口径已记录。现有模块补标题/右侧新增入口，菜单、日志及授权 Element 列表补轻量视觉外壳；部门启用 vxe 树、六个旧编辑表单和分配角色补固定底栏、个人中心补卡片布局。保留原生表格、权限与业务处理，公开示例说明同步更新。
- **验证**：最终构建 4.41 秒，25 个 Vue 文件编译、150 个原业务函数及 83 组按钮绑定比较通过；16 个隔离页面/组件和原 demo 回归、八种尺寸、diff 与信息隔离检查通过，CodeGraph 最新。全程无 POST 或真实业务请求，未真实账号/后端联调、未部署；现有构建及资料 radio 弃用告警如实保留。
- **暂缓**：菜单权限仍留用户组，等待后端后再迁移系统管理；登录鉴权沿用原方案。接口日志暂无独立页面和接口，未虚构接入。当前结论见 docs/qianrong-owned-modules.md；详细记录见 docs/history/2026-10-11-qianrong-owned-module-ui.md。

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
