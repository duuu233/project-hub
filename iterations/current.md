# 当前迭代

## 2026-09-09：正矿堆场提货「补充信息」批次号取值修复

- 环境：ssh；项目 minerals-admin（正矿），工作分支 `feature-v1.8.3`（无 upstream，用显式 `origin feature-v1.8.3` 同步与推送；改前 `08dfce1` → `1a516bd`）。
- 需求：堆场提货 —— 补充信息页，货物信息列表的批次号取 `goodsList` 数组里的 `stockBatchNo` 字段。
- 交付：**minerals-admin `6b7d0ae`（已推送，生产构建 1024MB 堆 / 2 线程 30.8s 通过）**
  - `src/views/sales-pickup/list/yard-replenish.vue` 两处：批次号列 `prop="batchNo"` → `prop="stockBatchNo"`；`objectSpanMethod` 的 `mergeCols` 里 `'batchNo'` → `'stockBatchNo'`，保住该列跨行合并。
  - 根因：`form.goodsList` 两个来源不同名——走库存接口 `stockInfoList`（「重新导入」及详情里有 `agentOrderNo` + `applyGoodsList` 时）会映射 `stockBatchNo: item.batchNo`；不走这条时直接用提货单详情返回的 `goodsList`，那批数据只有 `stockBatchNo`，原绑定下整列为空，合并列还因取到 `undefined` 把同一 `skuCode` 的行错误并成一行。详情页 `yard-detail.vue`、新增页 `yard-add.vue` 一直用 `stockBatchNo`，本次是补齐口径。
  - 未动：排序用的 `compareFields = ['batchNo', ...]` 作用于库存原始行；`pier-replenish.vue`（码头）没有批次号列。
- 文档：`private/minerals-admin/docs/domain-map.md` 补堆场三页批次号字段口径；私有流水 `logs/activity.md` 与详细记录 `logs/2026-09-09-堆场提货补充信息批次号.md`；Hub `logs/projects/activity.md` 追加看板行。
- 验证缺口：全量 `vue-tsc --noEmit` 在本机 1024MB 堆下 **OOM 未跑完**（按本机内存约定不上调堆，未改用其它机器），仅以生产构建通过为准；**未做浏览器实机验证**。
- 环境遗留：本机（ssh）正矿仓库里 `AGENTS.md`、`AI_CONTEXT.md`、`docs/`、`logs/`、`.codegraph/` 的 private_mounts 软链接**并不存在**（仓库里的 `docs/` 是本地未跟踪的 `build-opt` 目录，`.git/info/exclude` 也没有对应忽略行），本轮直接读写 Hub 的 `private/minerals-admin/` 原文件完成，没有动挂载和 CodeGraph；是否在本机补建链接待用户决定。

---

## 2026-09-09：花盆后台植物资料删除四条建议字段与养护建议

- 环境：ssh；工作分支 `main`（改前 `git pull --ff-only` = Already up to date）。
- 需求：植物资料新增 / 编辑 / 详情页面删除光照建议、需水建议、空气温度建议、湿度建议 4 个字段及相关代码。
- 交付：**flowerpot-admin `4b8bd13`（已推送，`vite build` 通过 43.60s）**
  - 三种模式共用 `ProductPlantFormDialog.vue`，一处删除三处生效：`defaultForm` 初始值、`rules` 四条长度校验、`buildPayload` 四个提交字段、模板四个 `el-col` 全部删除，`grep` 复查 `src/` 下字段名与中文标签均归零。
  - 「植物分类」`categoryType` 保留（下发设备 DP 161），原与四条建议并排 `span 6`，改为 `span 12` 与同区字段对齐。
- 关键发现：只读核对 Swagger，**整份契约里没有任何 `*Suggestion*` 字段** —— `ProductPlantAddApiIn`（新增/编辑）与 `ProductPlantDetailApiOut`（详情）都没有这四个。这四个输入框从 2026-09-08 `60eee3a` 加上起就是空转的，填了存不进、详情也回不来。因此直接删除，不像「所属产品」那样保留原样回传。
- 追加需求：「养护建议」也不需要。交付 **`6051546`（已推送，`vite build` 通过 43.84s）**——删表单项与 `requiredTextRule` 必填校验（此前不填无法保存，现在新增不再被卡）；但 `defaultForm` 与 `buildPayload` 两处保留 `careInstructions`：它是后端契约真实存在的字段（Add 入参收、Detail 出参返回）且可能有存量数据，编辑时原样回传不清空，新增时空值被 `cleanPayload` 过滤。与四条建议口径不同的原因就在这里。花盆 APP 已于 `2903cf7` 改用本地中英文案，不再读该字段。
- 未完成项：**未在浏览器实机验证**；若后端后续补上这些字段需按 `60eee3a` 与本轮历史文档恢复；养护建议存量数据此后只能在后端 / 数据库维护。

---

## 2026-09-09：花盆后台首页注册趋势改 ECharts 柱状图

- 环境：ssh；工作分支 `main`（改前 `git pull --ff-only` = Already up to date）。
- 需求：首页「用户注册增长趋势」改用柱状图，不要原来那种手写条形列表，必要时引入 ECharts。
- 交付：**flowerpot-admin `c140b26`（已推送，`vite build` 通过 44.13s）**
  - 新增 `echarts@^6.1.0`，按需引入 `core + BarChart + Grid/Tooltip/DataZoom + CanvasRenderer`；`vite.config.js` 的 `manualChunks` 单独拆出 `echarts` chunk（523.94 kB / gzip 178.09 kB），不并进 1.1MB 的 vendor。
  - 新增 `src/views/home/RegistrationTrendChart.vue`：只接 `list` prop，不自己发请求；品牌色竖向渐变柱、颜色从 CSS 变量读；`queryDate` 兼容 `YYYY-MM-DD` / `YYYY-MM` / 自定义周期串；Y 轴 `minInterval: 1`；>40 个数据点自动加 dataZoom；`setOption(option, true)` 整份替换，`ResizeObserver` 跟随容器，卸载 `dispose()`。
  - 首页删掉 `maxRegistrationCount`、`getBarWidth` 和六段旧进度条样式，空态仍走 `el-empty`，周期切换与 `v-loading` 不变。
  - 补 `docs/history/2026-09/2026-09-09-home-registration-bar-chart.md`，`AI_CONTEXT.md` 技术栈与依赖安装口径同步。
- 外部操作：只读拉取 `https://api.yikaltd.com/v2/api-docs` 核对 `getStatisticsUser` 契约（`queryDate` = 日期或周期，`userCount` = 注册数量）。
- 依赖安装口径：`npm install echarts --save --no-package-lock`，只改 `package.json`，`yarn.lock` / `pnpm-lock.yaml` 未动，也没新增 `package-lock.json`（主包管理器仍未确认）。**其他环境拉到 `c140b26` 后必须重新安装依赖**，否则构建找不到 echarts。
- 未完成项：图表**未在浏览器实机验证**；近一年的实际数据粒度没有实测样本，若后端返回「第 N 周」这类中文串，`formatAxisLabel` 需要按实际返回再调。

---

## 2026-09-09：花盆后台侧栏菜单修复，并把「完成后默认 pull + push」写进约定

- 环境：ssh；路径见 `environments/ssh/projects.local.yaml`。
- 需求：① 排查花盆后台取 `getLeftMenus?parentMenuId=2` 后报 `No match for {"name":"config"}`、左侧菜单整块不显示；② 前端先过滤掉后端返回的失效菜单；③ 把「每次完成任务，没有特殊要求就给对应项目和 Hub 先 pull 再 push」写进文档并执行。
- 定位结论：`690a70b` 下线「系统配置」时删了本地路由 `name: 'config'`，后端菜单表里 `appUrl=config` 那行还在（同步脚本只增不删，当时已记为待人工清理）。`Sidebar.vue` 把 `menuUrl` 直接交给 `RouterLink`，vue-router 解析不存在的命名路由在渲染期抛错，`v-for` 整体中断，所以整块菜单消失。
- 交付：
  - **flowerpot-admin**：`Sidebar.vue` 渲染前用 `router.hasRoute` 过滤失效菜单，屏蔽列表逻辑收进 `visibleMenus` computed，空分组不再留标题，dev 环境每个失效 `menuUrl` warn 一次；补 `docs/history/2026-09/2026-09-09-sidebar-route-filter.md`，同步 `AI_CONTEXT.md` 与 `docs/dynamic-menu-sync.md` 常见问题。提交 `61f8e76`，已推送，`vite build` 通过（35.36s）。
  - **Hub**：`AGENTS.md` 新增「任务完成后的默认动作：再 pull 一次，然后 push」，替换原「commit 和 push 均由用户决定」；`README.md`、6 份项目 Context 与 `context/_template.md` 同步新口径。
- 本轮流程自查：改 `Sidebar.vue` 前**漏了对 flowerpot-admin 执行 pull**，违反 `AGENTS.md` 最高优先级规则；发现后补做 stash → `git pull --ff-only`（Already up to date）→ pop，未造成分叉。两个仓库 push 前均再次 pull 确认为最新。
- 未完成项：后台「菜单列表」里已下线模块的菜单行（基础信息配置 / 用户产品图片 / 产品版本 / 用户产品列表）仍需人工清理或置 `isNav=0`；前端改动**未在浏览器实机验证**，等用户实测。

---

## 2026-09-08：家里环境接入与批量拉取

- 环境：home；各项目路径见 `environments/home/projects.local.yaml`。
- 需求：将本机工作目录中的项目接入 Hub，并拉取全部项目当前分支。
- 状态：5 个业务项目映射已建立；Hub 与 4 个业务仓库拉取成功，花盆后台等待用户处理本地修改。本轮不提交、不推送。
- 身份核实：项目文档与 Git 远端名称相符，复用既有 ID；所有目录均为 Git 根目录，当前分支均为 `main`，upstream 均为 `origin/main`。
- 正矿本机不存在，不添加映射、不执行拉取。Hub 自身作为管理入口同步，不新增业务项目注册项。

| 项目 | 拉取前 | 拉取后 | 结果 |
| --- | --- | --- | --- |
| Project Hub | `2d9633d` | `2d9633d` | 已是最新 |
| 花盆 APP | `9dfc52d` | `9dfc52d` | 已是最新 |
| 花盆后台 | `468d76f` | `468d76f` | `dist.zip` 有未提交修改，未执行 pull，保留现场待用户决定 |
| 相册 APP | `a89eb91` | `be2d80f` | 快进成功 |
| 相册后台 | `7fd5097` | `746407d` | 快进成功 |
| 相册小程序 | `8dab520` | `487869b` | 快进成功 |

验证与限制：成功拉取的 4 个业务项目均完成 `codegraph sync .`，最终工作区干净且分支仍为 `main`。5 条映射的 ID、Context、目录及 Git 根目录核对通过，Hub 的 `git diff --check` 通过，此前迭代原文完整保留校验通过。本轮没有业务代码编辑，不运行业务构建或测试。花盆后台的 `dist.zip` 修改原样保留，不自动 stash、还原或覆盖。此前迭代及其未完事项保留如下。

---

## 2026-09-08：ssh 开发机——花盆 APP 与花盆后台交付

状态：全部已提交并推送 —— 花盆APP `2903cf7`、花盆后台 `468d76f` + `7bb1f8b`、Hub 本次记录
日期：2026-09-08
环境：ssh（SSH 开发机，按 `environments/ssh/projects.local.yaml` 解析）

---

## 需求与分发

| 项目 | 需求 | 交付 |
| :--- | :--- | :--- |
| **flowerpot-app** | ① 排查「图片列表加载失败…（HTTP 404）」是哪个接口 → 定位到进图库前置的 userProduct 换 id 链路；② 图库只调 `getUserProductImgList`，其余接口删掉（设备档案由涂鸦提供） | 已提交推送 `2903cf7` |
| **flowerpot-admin** | 接口地址 IP 改域名，改完推远端 | 已提交推送 `468d76f` |
| **flowerpot-admin** | 删除遗留支付 / 上传服务配置（39.108.153.239），现在不需要 | 已提交推送 `7bb1f8b` |
| **flowerpot-app** | 首页-已绑定设备 7 项：顶栏改设备名、多语言框架（简中+英文，可扩到 18 种）、自动检测植物改独立页、其他设置去掉系统文件两项、纪念日日期校验、纪念日文本框样式、新增休眠模式（DP 151/152） | 已提交推送 `2903cf7` |
| **flowerpot-app** | 首页-已绑定植物：「今日养护」改成按四条状态读养护建议并 5 秒轮播、文案按给定 12 条、支持多语种 | 已提交推送 `2903cf7` |
| **flowerpot-app** | 配网/首页/动画页 7 项：配网系统弹框、选择设备页两条入口、首页空态文案、搜索页三段文案与手动选择、搜索时长 45 秒、首页四卡对齐、定制动画页三处文案与功能 | 6 项已实现，第 1 项无法在 App 侧实现（见下） |

同步：`git pull --ff-only`，project-hub main（`0b85d8e → 2d9633d`）、flowerpot main（`9dfc52d`，Already up to date）、flowerpot-web main（`60eee3a`，Already up to date）。工作分支均为各自当前分支，未切换。

---

## 交付明细（flowerpot-app / main）

- **图库接口收敛**：`getImages` / `uploadImage` 入参由 `userProductId` 改为涂鸦 `deviceId`，请求变成 `getUserProductImgList?...&deviceId=…` 与 `setUserProductUpload?deviceId=…`；`refreshAnimations` / `addAnimation` 不再走 `_ensureBackendDevice`（即不再调 `getUserProductList` / `getUserProductDetail` / `addUserProduct` / `Product/getProductList`）。纪念日链路仍用旧方式，本轮未动。
- **搜索设备页**：删掉「扫描到 N 个网络…」「手机当前连接…」「用下面的手动选择」和「从附近网络中手动选择设备」；新增 45 秒搜索窗口（间隔 2 秒重扫），窗口内一直显示搜索中，扫到热点立即进下一步。
- **选择设备页**：删掉「设备不在上面？显示附近全部网络」和两处「设备已在配网状态，继续」。
- **首页**：空态文案改「还没有连接智能设备…」；概览四张指标卡统一 `top:145` / `left|right:0`，空气温度与相对湿度不再错位。
- **定制动画页**：删掉「文件同步」按钮与实现（连带删掉已无调用方的 `FlowerpotState.syncAnimations`）、删掉「仅支持屏幕录制或本地文件。点击这里重新授权」提示条，上传说明改为「支持本地图片文件上传」。
- 项目内文档已按其规则更新：`docs/history/2026-09/2026-09-08-gallery-device-id-and-pairing-cleanup.md`、`docs/README.md`、`docs/history/README.md` 索引、`AI_CONTEXT.md` 两处过期事实。

### 今日养护轮播（本轮追加）

- 「今日养护」由一句自写总结改为读四条状态功能点（107 需水 / 108 光照 / 113 温度 / 115 湿度）当前取值对应的建议，顺序与上面四张卡片一致，`HomeCareBanner` 每 5 秒切一条（淡入淡出 + 上移 420ms）。
- 产品给的 12 条文案与项目里已有的 `TuyaStatusCopy` 中文表逐字一致，直接复用没有另写。
- 多语种：`TuyaStatusCopy` 补了四张英文表和按语言查表的方法，跟着设置页的语言开关（zh / en）走，非英文回落中文；首页四张卡片的标题与取值也一并跟随语言。
- 首页原来不判断温度冷热，本轮补上 113 判断，兜底阈值（18–28℃）上移到 `TuyaStatusCopy`，与温度状态页共用一份。

---

## 交付明细（flowerpot-admin / main，已推送）

- `.env` 的 `VITE_APP_API_ORIGIN`：`http://120.25.227.36:8601` → `https://api.yikaltd.com`；运行时只有这一个地址来源（`request.js`、`clientBasic.js` 都读它，开发代理没配 `VITE_APP_PROXY_TARGET` 时也回落到它）。
- `scripts/sync-admin-menu.mjs` 的 `DEFAULT_API_BASE` 同步改成域名。
- `AI_CONTEXT.md` 第 3 节、`docs/api-integration-progress.md`、`docs/dynamic-menu-sync.md`、`src/api/productPlant.js` 注释里的 Swagger 地址同步改域名，并保留「曾临时改用 IP」的来龙去脉；新增 `docs/history/2026-09/2026-09-08-api-origin-back-to-domain.md` 并补齐历史索引。
- 验证：SSH 开发机 `curl https://api.yikaltd.com/v2/api-docs` 返回 200（245411 字节），与 IP 返回同一份契约（仅 `host` 不同）；`npx vite build`（1024 MB 堆）通过，31.40s。
- **遗留支付/上传服务：确认不需要后整体删除（第二次改动，未提交）**——`.env.development` / `.env.production` 删掉 `VITE_APP_BASE_PAY` / `VITE_APP_BASE_UPLOAD` / `VITE_APP_BASE_BIGUPLOAD`（连同写在 URL 里的 sign 查询串），两个文件已无分环境覆盖项只留说明；删除 `src/utils/requestPay.js`（它的 baseURL 就是被删的变量，留着只会打到后台自身源站）；`src/api/log.js` 去掉该 import 与 `getPayQuery`/`getPayRefundQuery` 两个无人调用的封装（log.js 其余函数仍被日志页使用，文件保留）。`README.md`、`AI_CONTEXT.md`、`docs/next-session.md` 与历史记录同步更新，`npx vite build` 再次通过（29.55s）。

---

## 交付明细（flowerpot-app 第三批：首页与设置 7 项）

- **多语言**：新增 `lib/src/shared/l10n/`（`AppLanguage` 枚举 + `AppLocalizationsScope` + `AppL10n` 文案目录），做法对齐相册 APP，但文案用 `t({语言: 文案})` 的 Map 写法而不是位置参数——18 种语言下位置参数会失控；缺译文按回落链落到简中。设置页语言列表由枚举生成，加语种不用改页面。**只覆盖本轮涉及的页面，其余页面仍是硬编码中文**；`flutter_localizations` 未引入（本机跑不了 `pub get`，改 pubspec 会让别人构建直接失败），所以 Material 内建文案仍是英文，与改动前一致。
- **顶栏设备名**：`HomeHeader` 加 `title`，已绑定设备时正中显示设备名（长名省略号），未绑定仍是品牌标识。
- **自动检测植物**：改成与 LED 设置同款的独立页（`PlantDetectionSettingsPage`），设置页那一行只显示状态；行内开关的整套支持已删除。
- **其他设置**：删掉「系统文件更新」「修复系统文件」两行、中间的红色说明条和两个只弹「暂未开放」的处理函数。
- **编辑纪念日**：保存前校验日期（提示「请选择日期」）；文字输入框边距对齐上方输入框、输入区 92→104、字号 16→17，三个输入框圆角 16→12（设计稿上同形）。
- **休眠模式**：新增 `StandbySettingsPage`，开关 DP 151 即时下发、延迟时间 DP 152 由时/分滚轮 + 保存写入并钳到 1–180 分钟，入口在「行为」页。版式照 `docs/UI/v2/割草机/割草机-雨淋设置.png`。
- 项目内文档：新增第三份历史记录并更新两个索引与 `AI_CONTEXT.md`。

---

## 追加（同日）：连接 Wi-Fi 页输入框（已推送）

「Wi-Fi 名称 / 密码」两格原来把 `TextField` 压在 `SizedBox(height: 24)` 里配 `InputDecoration.collapsed`——15px 的字加光标本就接近 24，聚焦时光标上下顶格、点击热区也只有 24px，就是「上下太窄」的来源。现在两格抽成同一个 `_CredentialInput`：高度交给 `isDense` + 上下留白自己撑（约 30px，行高仍是 72，版式不动），聚焦时在值下面画一条品牌色细线、失焦透明。没有照登录页改成胶囊输入框——`docs/UI/连接Wi-Fi.png` 上这张卡就是「图标 + 标签 + 值 + 分隔线」的样子，换成登录页那种会偏离设计稿。补了聚焦态与高度的用例。

---

## 追加（同日）：后台三项 + APP 十项（已推送）

**flowerpot-admin**：① 下线用户设备（用户产品列表）、用户产品图片、产品版本、系统配置（基础配置→系统配置）四个模块，连同只服务于它们的接口封装与菜单同步脚本节点；产品列表按用户确认**保留**。② 植物管理去掉「所属产品」（表单 + 列表筛选 + 表格列）。③ 产品新增/编辑/详情去掉形状类型、屏幕方向、尺寸、广播ID、轮播间隔、横/竖向旋转度数，列表去掉形状与尺寸两列；编辑时这些值仍原样回传，不会清空后端已有数据。`npx vite build` 通过（31.92s）。提交 `690a70b`，已推送。

**flowerpot-app**：① 设置页分享入口用常量关掉；② 帮助中心从「我的」搬到设备设置页；③ 新增 OTA 进度弹层（进度条+百分比，升级中不可关）；④ 卡片标题去加粗，LED 不再与「显示」共用插画（LED / 自动检测植物暂用矢量图标占位，**等 UI 出正式素材**）；⑤ 意见反馈读后台平台邮箱、箭头改复制图标；⑥ 关于页去掉版本说明，补齐强制/提示升级链路（启动检测 + 红点 + 弹窗）并按 swagger 修正 `getLastVersion` 字段解析；⑦ 我的进页即刷新用户信息（昵称）、`AppAvatar` 图片加载失败退回占位图（左上角入口「消失」的根因）；⑧ 我的与设备设置列表行高抬高并补下划线；⑨ 四个状态详情页的养护建议改读 `TuyaStatusCopy.advice`（中英各 12 条，跟随界面语言）；⑩ 161 未下发的排查结论见下。提交 `992b8f8`，已推送。

---

## 验证摘要

- **SSH 开发机没有 Flutter / Dart SDK**（`~/sdk` 下只有 Go），`flutter analyze`、`flutter test` 一个都跑不了，本轮只做静态复核并同步修改了受影响的用例，不宣称通过。
- 同步改动的测试：仓库后端契约用例（新增按 `deviceId` 取图库的用例）、state 集成用例、搜索页/选择页/动画页/首页空态用例。
- 45 秒窗口的用例依赖假时钟推进，需在有 SDK 的机器上实跑确认没有遗留 Timer。

---

## 需要用户确认

1. **第 1 项做不了**：「要连接至设备吗？智能花盆将使用临时 WAN 网络连接至设备。」不是 App 的弹框，源码里没有这两句。它是 Android 10+ 对 `WifiNetworkSpecifier` + `requestNetwork` 的**系统授权框**（`MainActivity.joinDeviceHotspot`），必须由用户点同意，应用无法预先接受或跳过；绕开它只能回到「引导用户去系统设置连热点」的手动路径，步骤更多。
2. 图库按 `deviceId` 过滤依赖后端该接口支持这个参数，需后端确认；404 本身也要服务端确认是路由缺失还是临时地址部署问题。
3. 搜索页去掉手动选择后，热点名不在白名单且系统扫不出时，只剩「设备已在配网状态，继续」这条路。
4. **没有引入全局 i18n**：项目至今没有 `flutter_localizations`/arb，全部界面文案硬编码中文，只有设置页的语言开关是现成的。本轮只给这批状态文案做了中英双语表，切英文时也只有首页这块跟着变；全局多语种是一次独立迁移，要做请单独排期。英文文案是本轮撰写的（产品只给了中文），需要复核。
5. **休眠模式与多语言都没有真机 / SDK 验证**：DP 151/152 此前没有页面用过；滚轮钳位、语言切换整树重译都只做了静态复核。
6. 英文文案为本轮撰写，需产品或英文母语者复核；编辑纪念日「中间白色部分内容过小」按「输入区偏矮 + 字号比标题小」处理，如指别的看截图再调。
7. 三批改动合并为一次提交 `2903cf7` 推送到 main（本机无 SDK，analyze/test 仍未跑，上机请先跑测试）。
8. **161 未下发是数据问题**：swagger 里 `ClientProductPlantApiOut`（植物列表）有 `categoryType`（1 水培/2 适中/3 耐旱），APP 读的就是它，选植物页用的也是这个列表——所以只有后台该行没填分类才会走到「未下发 161」。提示已改成点名字段。另注意 `ClientProductPlantDetailApiOut` **没有** 这个字段。
9. **`_debugPlantIdentifier = '17'` 还写死着**：联调期把 DP 116 下发标识统一成冷水花的 17，后台补齐 `tuYaRemark` 后必须改回 null，否则选任何植物设备都当成冷水花。本轮未动，待产品确认。
10. **删掉系统配置页后**，平台邮箱只能在后端维护；APP 侧仍从 `getBasicData` 读，不受影响。广播ID 从产品表单去掉后，新增产品不再提交该字段，若后端必填会失败。
11. 后台已存在的菜单行（用户产品图片、产品版本、基础信息配置等）要人工在「菜单列表」里清理，同步脚本只创建不删除。

上一轮记录见 `iterations/archive/2026-09-08-私有目录symlink与统筹留痕.md`。

---

## 此前迭代原始记录（保留待推送事项）

状态：代码均已实现并验证完成，合并提交并推送
日期：2026-09-08
环境：work / ssh 多端协同

---

## 需求与分发

| 项目 | 需求与改动 | 环境 / 交付 |
| :--- | :--- | :--- |
| **project-hub** | **私有目录 Symlink 方案、统筹留痕体系与方案库建设**：落地 scripts/setup-links.mjs（迁移、解绑、批量挂载），建立 logs/hub/ 自身留痕、logs/projects/ 全局看板、logs/solutions/ 方案库，建立 private/ 私有大文件夹扩展规范。 | work / 本次提交 |
| **minerals-admin** | **私有目录安全迁移与物理隔离**：docs、.codegraph、logs、AGENTS 等迁移入 Hub，原业务目录实体彻底删除替换为软链接，业务仓库 git clean。 | work / 本次提交 |
| **minerals-admin** | **进口采购单新增/编辑校验规则修复**：修复定价依据组件脱离 el-form 上下文导致成分要求报必填的缺陷；修复合同金额回填后红字不消失；详情与 AI 回显补清空校验。 | ssh / 提交  8dfce1 |

---

## 验证摘要

1. **Project Hub**：
   - 单元测试：
ode --test scripts/setup-links.test.mjs 6 项自动化测试全部通过。
   - 静态检查：git diff --check 通过。
   - 软链接实测：正矿 5 项私有目录/文件挂载全部生效（docs、logs、.codegraph 为 Junction，AGENTS.md、AI_CONTEXT.md 为 SymbolicLink）。
2. **正矿业务仓库 (minerals-frontend)**：
   - 工作分支 eature-v1.8.3，git status 完全 clean。
   - 本地忽略：.git/info/exclude 正常生效，无团队 Git 污染。
   - 采购单修复：@vue/compiler-sfc 编译通过，
ode scripts/build.mjs --memory 1024 生产构建 32.2s 通过。

---

## 需要用户注意的事项

1. 正矿业务仓库的 eature-v1.8.3 无 upstream，其业务提交  8dfce1 待用户明确指令后再 push。
2. 上一轮记录见 iterations/archive/2026-09-08-套餐卡收窄与植物字段.md。
