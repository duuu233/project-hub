# 泰乾超级实施记录

当次改动、来源、验证与边界按日期追加，具体口径以 docs 中当前文档为准。

## 2026-10-14 work｜qianrong 现有合并冲突解决

- **交付**：master/9473440 已完成现有 merge，随后显式 pull --ff-only origin master、push origin master 成功；工作区干净，与远端一致，未切分支或设 upstream。
- **范围**：本地 8767573 仅新增锁文件；远端含 dh 79878c2/3904c7a 及同事 kimi 6c9cf15。190 个 dh 负责模块/公共支撑文件逐一保留，同事其它 163 路径变化（含153删除）保留，不恢复其清理内容。
- **冲突**：实际 AA 未合并项只有 pnpm-lock.yaml；20包与23依赖边一致，选择 dh 已推送的9.0格式。最后合并树与远端原树一致，双方历史保留，未安装依赖或迁移workspace。
- **验证**：生产构建9.14秒、1280px下37页面场景、日志详情与脱敏通过；运行错误及真实请求为0。已有构建提示与radio弃用提示保留，CodeGraph614文件最新，diff/冲突标记/信息隔离通过；未真实登录/菜单或权限联调/业务写入/部署。
- **记录**：docs/history/2026-10-14-work-qianrong-merge.md 保存完整现场及脚本校验边界；其它接口契约待确认继续保留。

## 2026-10-14 home｜qianrong静态模块与新接口续接

- **交付**：master/3904c7a已提交，再次显式pull同名master成功并push，业务工作区干净；仅qianrong25文件。
- **范围**：按用户恢复任务补13模块独立静态入口，复用现有列表/表单/权限树，新增接口日志与静态登录，资料内存保存；完成新版服务代理、systemList方法及8处直接地址修正。
- **验证**：最终构建4.19秒，37浏览器场景、日志交互与响应脱敏、资料取消/保存/刷新、登录校验/会话隔离、9请求契约及本地代理、4Vue编译通过；diff/隔离与CodeGraph最新。原radio弃用和全场景一条对象提示保留，未真实业务请求、登录/写入/上传联调或部署。
- **需求边界**：飞书原型本轮要求登录，沿用前13PRD记录，未重读原型/L2全文；权限迁移、角色DTO、旧辅助端点和接口日志后端继续待确认。详见docs/qianrong-static-modules.md和docs/history/2026-10-14-qianrong-static-modules.md。

## 2026-10-13 home｜根开发工具锁文件同步

- **交付**：master / 79878c2 已提交；再次pull同名master并push成功，工作区干净。
- **范围与授权**：用户明确合并提交已有本地改动，纳入原根pnpm锁文件并说明用途；不恢复暂停的qianrong接口调查，不改业务实现。
- **验证**：原锁文件SHA256保持，diff/隔离及CodeGraph通过；未应用构建、真实接口或部署。详情见docs/history/2026-10-13-home-root-lockfile-sync.md。

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


## 2026-10-12 work｜公司私人关联恢复

沿用 home 的 taiqian-front 与私人文档，补 work 根目录映射；master 从 8d2a8f0 快进至 7d3dd63。五项私人链接建立、再次预检与忽略验证通过，本机索引初始化后最新（745 文件）。未改业务源码、未构建或联调；完整关联记录见 docs/history/2026-10-12-work-association.md。


## 2026-10-13 work｜qianrong 新接口对照暂停

- **状态**：用户要求暂停代码开发，仅记录上下文并提交。业务 master / 7d3dd63 已 pull 成功且没有源码改动；未切换代理、未新增业务提交。
- **已知**：确认 dh 负责的 13 模块；新 Swagger JSON 读取 200 / 216 路径；105 包装对照中 86 路径/方法匹配、1 方法不符、18 未列出。八处导入/导出地址和代理需调整，角色 DTO 与菜单权限迁移仍需契约核对，接口日志仍无独立接口。
- **边界**：只有文档下载与捕获 request/XHR 的隔离检查，未真实业务请求、构建或部署；CodeGraph 当前最新。锁文件仅按授权暂存恢复，Git 换行转换已还原原字节，SHA256 一致，文件仍未跟踪且不提交，本轮 stash 已移除。
- **续接**：docs/qianrong-api-alignment.md 及 history/2026-10-13-qianrong-api-audit-paused.md 保存完整现场；下次按实际环境先 pull、刷新契约后实施，不在暂停期间自动恢复。
