# 前端打包优化分析与实施计划

> 状态：待逐项实施。本文只记录已经从源码、构建产物和 Jenkins 日志验证的事实，以及后续优化的安全边界。
>
> 最后核对：2026-08-25。当前本地分支 `feature-v1.8.2`，基线提交 `a5d18bd`；Jenkins 失败提交为 `1c1d4b6648d103ff1ab915416b0280ef7b325021`。下文涉及的大包入口和构建配置在这两个提交之间没有变化；`package.json` 仅将 Node 堆上限从 4096 MB 调整为 3072 MB。
>
> 本文件通过业务项目的 `docs/` 链接访问，真实内容由私人 Hub Git 同步；不提交团队仓库。切换维护环境后仍须按当前分支重新测量。

## 1. 文档目标

后续优化必须分别衡量以下三个目标，不能把它们混为一个指标：

1. **构建稳定性**：降低 Vite/Rollup 的峰值内存和构建耗时，避免 Jenkins Pod 被驱逐。
2. **部署产物体积**：减少 `dist/` 中原始文件和预压缩文件占用的存储、上传时间。
3. **页面加载体积**：减少 `index.html` 首次预加载资源，以及各业务路由首次进入时下载的资源。

静态图片和视频主要影响部署产物与网络流量；大量 JavaScript 模块、依赖图、分包和压缩主要影响构建内存。两者有关联，但不是同一个问题。

## 2. 当前构建基线

### 2.1 总体数据

| 指标 | 当前实测值 | 说明 |
| --- | ---: | --- |
| Vite 转换模块数 | 5331 | 包括业务模块和第三方依赖模块 |
| `dist` 原始部署文件 | 约 29.50 MiB | 不含 `.gz` 副本 |
| `.gz` 预压缩副本 | 约 2.16 MiB | 浏览器不会同时下载原文件与 `.gz` |
| `dist` 磁盘总量 | 约 31.65 MiB | 原始文件与 `.gz` 的合计 |
| `index.html` 直接加载资源 | 约 3.75 MiB | 压缩后的 JS/CSS 原始字节总量 |
| 首次加载 gzip 估算 | 约 1.14 MiB | 只有服务器正确命中预压缩文件时成立 |
| 本机构建峰值 RSS | 约 3 GiB | Node.js 20，完整生产构建量级 |
| Jenkins `nodejs` 容器内存 | 约 3.07 GiB | Pod 被驱逐前日志记录值 |

每完成一个优化阶段，都应在同一 Node 版本、同一分支和相同构建模式下重新记录这些指标。

### 2.2 产物类型分布

| 类型 | 原始产物体积 | 主要来源 |
| --- | ---: | --- |
| GIF | 约 8.29 MiB | AI 监控动画为主 |
| JavaScript | 约 7.55 MiB | Element Plus、ECharts、WangEditor、L7 和公共依赖 |
| WebM | 约 6.85 MiB | 进口管理概览 AI 动画 |
| PNG | 约 5.54 MiB | 登录背景和空状态图片为主 |
| CSS | 约 0.60 MiB | Element Plus、编辑器和业务样式 |
| JSON | 约 0.39 MiB | `public/data/world.json` |

## 3. 已确认的主要体积来源

### 3.1 三个大媒体文件

| 资源 | 体积 | 使用功能 | 引用位置 |
| --- | ---: | --- | --- |
| `src/assets/images/bill-of-lading/ai-icon03.gif` | 约 8.14 MiB | 提单 AI 监控雷达动画 | `src/views/bill-lading/bill-lading-list/components/AiMonitor/index.vue:79` |
| `src/assets/images/gif-ai.webm` | 约 6.85 MiB | 进口管理概览抽屉 AI 动画 | `src/views/import-manage/list/template/overViewDrawer.vue:28` |
| `src/assets/images/login-background.png` | 约 4.34 MiB | 登录、注册背景 | `src/views/login.vue:88`、`src/views/register.vue:203` |

三个文件合计约 19.32 MiB，占当前原始 `dist` 的约 65.5%。这是部署产物体积偏大的首要原因。

其他候选项：

- `src/assets/images/noData.png` 约 0.42 MiB，用于行情和海关数据空状态。
- `public/data/world.json` 约 0.39 MiB。静态搜索未发现引用，但 `public` 中的文件会被无条件复制；删除前必须通过浏览器 Network 和服务端路径确认没有运行时动态请求。

### 3.2 Element Plus 和全部图标进入首屏

入口：

- `src/main.ts:5` 同步导入完整 `element-plus`。
- `src/main.ts:71` 执行 `app.use(ElementPlus, ...)`。
- `src/components/SvgIcon/svgicon.ts:1` 使用 `import * as components from '@element-plus/icons-vue'`。
- `src/main.ts:65` 全局注册所有 Element Plus 图标。

当前影响：

- `vendor-element` 压缩前的最终 JS 约 0.92 MiB，并被首页预加载。
- Element Plus 约产生 886 个构建模块。
- 全图标模块的构建贡献约 236 KiB。
- `src/assets/icons/svg/` 另有约 221 个本地图标，通过 `virtual:svg-icons-register` 一次注册；生成模块压缩前约 207 KiB。

这是全项目公共能力，调用面很广。不得把 Element Plus 全量按需化作为第一批修改。

### 3.3 WangEditor 被全局同步加载

入口：

- `src/main.ts:31` 同步导入 `src/components/Editor/index.vue`。
- `src/main.ts:60` 全局注册 `<Editor>`。
- `src/components/Editor/index.vue:22` 同步加载 WangEditor 样式。
- `src/components/Editor/index.vue:24` 同步加载 `@wangeditor/editor-for-vue`。

当前影响：

- `vendor-editor` 最终 JS 约 0.77 MiB。
- 编辑器 CSS 约 14.5 KiB。
- 该资源被 `index.html` 预加载，即使当前页面不使用富文本编辑器。

已确认的业务使用范围：

- `src/views/site-goods/goods-list/template/handleDetail.vue`
- `src/views/information/information-list/template/handleDetail.vue`
- `src/views/system/notice/index.vue`
- `src/views/system/help-me/template/handleDetail.vue`，存在两个 `<Editor>` 实例

优先考虑保留全局 `<Editor>` 契约，只把组件注册改为 `defineAsyncComponent()`，避免一次性修改所有业务页面。

建议形态仅供实施时参考：

```ts
import { defineAsyncComponent } from 'vue'

const Editor = defineAsyncComponent(() => import('@/components/Editor/index.vue'))
app.component('Editor', Editor)
```

实施前要确认现有 Vue 版本支持当前写法；实施后必须验证编辑器内容回显、输入、禁用、销毁和重复进入页面。

### 3.4 通用 `vendor` 聚合了页面专用依赖

`vite.config.ts:56-64` 对部分依赖建立专用 chunk，最后对其余 `node_modules` 统一执行：

```ts
return 'vendor'
```

当前通用 `vendor` 最终 JS 约 1.01 MiB，并被 `index.html` 预加载。它混入了多个本应跟随业务页面加载的库：

| 依赖 | 实际功能 | 主要入口 |
| --- | --- | --- |
| `lottie-web` / `vue3-lottie` | 404 动画 | `src/views/error/404.vue` |
| `@vue-flow/core`、`@dagrejs/dagre` | 船舶轨迹、提单轨迹流程图 | 两个 `Track` / `ShipTrack` 目录 |
| `marked` | 全局 AI 对话 Markdown 渲染 | `src/components/AiChatDialog/index.vue` |
| `qrcode` | 场地二维码 | `src/views/site/list/` |
| `vue-cropper` | 用户头像裁剪 | `src/views/system/user/profile/userAvatar.vue` |
| `sortablejs` | 进口订单、代理订单、菜单拖拽 | 对应三个业务页面 |

构建日志中的以下警告与该手工分包存在直接关联：

```text
Circular chunk: vendor-element -> vendor -> vendor-element
```

临时构建验证表明，仅删除 `return 'vendor'` 并不能降低峰值内存，测量值反而从约 3176 MiB 变为约 3179 MiB，属于测量波动范围。因此：

- 不能把“删除 vendor 兜底”当作 Jenkins 内存修复。
- 后续调整的主要目标是减少首屏误加载和循环 chunk。
- 每次只拆一组依赖，并检查实际 HTML preload 和业务路由请求。

### 3.5 ECharts 全量导入

以下文件均使用 `import * as echarts from 'echarts'`：

- `src/views/workbench/components/WorkbenchArrivalChart.vue:3`
- `src/views/information/market-data/index.vue:97`
- `src/views/information/customs-data/index.vue:126`
- `src/views/system/currency/template/historyRateDialog.vue:68`

当前影响：

- `vendor-echarts` 最终 JS 约 0.98 MiB。
- ECharts 约 459 个模块，zrender 约 93 个模块。
- 该 chunk 不是基础入口的直接 preload，但工作台通常是登录后的首个业务页面。

后续可改为 `echarts/core`，逐文件注册实际使用的图表、组件和 renderer。不能一次替换四个页面后只做构建验证；必须逐个打开图表，验证数据更新、resize、销毁、渐变和 tooltip。

### 3.6 AntV L7、Vue Flow 和轨迹功能

主要入口：

- `src/views/workbench/vessel-tracking/composables/useShipMap.ts`
- `src/views/workbench/vessel-tracking/components/ShipTrack/`
- `src/views/bill-lading/bill-lading-list/components/Track/`

当前影响：

- `vendor-l7` 最终 JS 约 0.75 MiB。
- Vue Flow、Dagre、regl、HammerJS 等依赖还会进入其他公共 chunk。
- 路由本身是懒加载，因此 L7 主 chunk 不属于基础首屏；主要影响总 JS 体积、轨迹页面首次加载和构建模块图。

这部分业务视觉和交互复杂，优化优先级低于媒体压缩和编辑器异步加载。

### 3.7 全局 AI 对话同步挂载

调用链：

```text
src/layout/index.vue
  -> src/components/GlobalAiChat/index.vue
  -> src/components/AiChatDialog/index.vue
  -> marked、AI API、业务匹配与操作模块
```

相关入口：

- `src/layout/index.vue:21`
- `src/components/GlobalAiChat/index.vue:19`
- `src/components/AiChatDialog/index.vue:258`

当前 `<GlobalAiChat>` 跟随主 Layout 同步加载。后续可评估将对话框主体异步加载，并保持悬浮入口、全局 handler 和身份上下文行为不变。

### 3.8 动态菜单路由会参与全量构建

`src/store/modules/permission.ts:16` 使用：

```ts
const modules = import.meta.glob('./../../views/**/*.vue')
```

该机制保证后端菜单组件路径能够映射为 Vue 页面，并让浏览器按路由加载页面 chunk。但是 Vite 生产构建仍需要发现、解析和转换当前约 468 个 `.vue` 文件。

当前大模块数量包括：

- `lodash-es`：约 1280 个模块。
- Element Plus：约 886 个模块。
- ECharts + zrender：约 552 个模块。
- AntV L7 及相关包：数百个模块。

不得为了降低构建模块数而删除或缩小该 glob，也不得把后端动态菜单改成纯前端静态路由。

## 4. Jenkins 失败的直接原因

失败不是 Sass、esbuild 警告或业务代码编译错误，而是 Kubernetes 节点内存压力：

- `nodejs` 容器实际使用约 3,222,172 KiB，即约 3.07 GiB。
- `nodejs` 容器未声明 memory request，调度器看到的申请量为 0。
- Pod 被驱逐时节点可用内存只有约 707,304 KiB，即约 691 MiB。
- Pod 状态为 `Evicted`，容器退出码为 137。

`NODE_OPTIONS=--max-old-space-size=3072/4096` 只限制 V8 老生代堆，不会为 Pod 预留内存，也不包含全部堆外内存。

因此前端优化不能替代 CI 资源配置。Jenkins/Kubernetes 至少需要：

- 给 Node 构建容器声明合理的 memory request；当前维护基线建议至少申请 4 GiB。
- limit 需要为 V8 堆外内存和其他容器保留余量，具体值由集群容量决定。
- 调度到具备足够空闲内存的节点；资源不足时应 Pending，而不是运行到渲染 chunk 时被驱逐。

## 5. 安全优化原则

1. 每个阶段只处理一种体积来源，避免无法判断收益和回归来源。
2. 修改前记录构建基线；修改后同时比较模块数、原始产物、gzip、首屏 preload 和峰值内存。
3. 不改变后端动态菜单、权限、TagsView、请求拦截和身份上下文流程。
4. 优先保持现有组件标签、props、events 和 `v-model` 契约，只改变加载时机。
5. 不做全仓库格式化，不顺带处理无关警告。
6. 不因静态搜索“未引用”直接删除资源；动态菜单、字符串路径和运行时请求必须人工确认。
7. 业务行为正确优先于体积指标；出现功能差异立即回滚当前单项改动。

## 6. 分阶段实施计划

### 阶段 0：固化可重复基线

目标：确保每项优化可以量化和回退。

执行：

```bash
git status --short
codegraph sync
npm run type-check
npm run build:fast
npm run build
```

记录：

- Node.js、npm/yarn 版本和提交号。
- 构建模块数、耗时和峰值 RSS。
- 原始 `dist`、`.gz`、JS、CSS、图片和视频体积。
- `index.html` preload 的文件和大小。
- Jenkins Pod 的 request、limit、实际使用量和所在节点可用内存。

### 阶段 1：压缩大媒体资源

优先级：最高。业务逻辑风险：低。

顺序：

1. `ai-icon03.gif`
2. `gif-ai.webm`
3. `login-background.png`
4. `noData.png`
5. 审计 `public/data/world.json`

实施要求：

- 第一轮优先保持路径、尺寸比例和播放语义不变，只做无损或视觉可接受的重编码。
- GIF 改为 WebM/MP4 会涉及模板和浏览器兼容性，必须作为独立改动，不与普通压缩混在一起。
- PNG 改为 WebP/AVIF 时确认目标浏览器，并保留必要 fallback。
- 不提交临时原图、编码缓存或对比产物。

人工验证：

- 登录和注册背景在常见分辨率下无拉伸、闪烁和明显色带。
- 提单 AI 监控动画正常循环、透明背景正确。
- 进口管理概览视频自动播放、循环和静音行为不变。
- 行情、海关数据无数据状态正常。

成功标准：原始 `dist` 明显下降，业务 JS chunk 和交互行为不变。

### 阶段 2：WangEditor 异步加载

优先级：高。业务风险：低到中。

推荐先保持全局 `<Editor>` 注册方式，只将同步组件改为 `defineAsyncComponent()`。这样调用页面无须同时修改，blast radius 最小。

验证页面：

- 商品详情/编辑富文本。
- 资讯详情/编辑富文本。
- 系统通知富文本。
- 帮助中心两个编辑器实例。

验证内容：

- 首次进入编辑页面时组件正常加载，无长期空白。
- 初始 HTML、禁用状态和只读状态正确。
- 输入、粘贴、图片、上传和保存内容不变。
- 页面关闭、TagsView 切换和再次进入不残留旧实例。
- `vendor-editor` 不再出现在 `index.html` 的直接 preload 中，只在使用页面请求。

预期收益：基础首屏原始 JS 减少约 0.77 MiB，gzip 传输减少约 0.27 MiB；总产物体积变化不大，因为编辑器 chunk 仍然存在。

### 阶段 3：整理通用 vendor 分包

优先级：中。业务风险：中。

目标：避免页面专用依赖被公共入口提前加载，并消除可验证的循环 chunk；不把它作为降低构建内存的主要手段。

候选拆分组：

- 404：`vue3-lottie`、`lottie-web`。
- 轨迹流程：`@vue-flow/core`、`@dagrejs/dagre`。
- AI 对话：`marked`。
- 场地二维码：`qrcode`。
- 头像裁剪：`vue-cropper`。
- 拖拽排序：`sortablejs`。

实施要求：

- 一次只拆一组依赖并完整构建。
- 检查 `index.html`，确认业务专用 chunk 不再 preload。
- 检查 chunk 之间是否出现新的循环依赖。
- 不设置过多细碎 chunk，避免增加请求数量和缓存失效面。
- 需要比较“显式业务 chunk”与“让 Rollup 自动分包”两种方案，不能只凭文件数量判断。

人工验证至少覆盖：404、AI 对话、场地二维码、头像裁剪、菜单拖拽、订单拖拽和两类轨迹页面。

### 阶段 4：ECharts 按需导入

优先级：中。业务风险：中。

逐文件实施，不一次性改四个页面：

1. 汇率历史弹窗。
2. 市场行情。
3. 海关数据。
4. 工作台到港图表。

每个文件实施前先列出实际使用的图表、组件和 renderer，再从 `echarts/core` 注册。不要凭页面名称猜测图表类型。

人工验证：

- 首次渲染和接口数据更新。
- 折线、柱形、饼图等实际使用类型。
- tooltip、legend、渐变色、缩放和空数据。
- 容器 resize、窗口 resize、组件卸载和再次挂载。
- TagsView 缓存切换后没有重复实例或空白画布。

成功标准：`vendor-echarts` 和模块数可测量下降，四个页面视觉和交互无差异。

### 阶段 5：全局 AI 对话异步化

优先级：中。业务风险：中。

优先让悬浮入口保持轻量和同步，仅异步加载对话框主体。必须保留现有全局 handler、页面业务匹配、流式输出和身份上下文行为。

人工验证：

- Layout 首次进入时不加载完整对话框依赖。
- 第一次点击可接受地打开，无永久 loading。
- Markdown、流式消息、错误重试和关闭重开正常。
- 页面切换时业务上下文正确。
- 切换身份后旧 Token、旧会话和 handler 不残留。

### 阶段 6：Element Plus 和图标按需化评估

优先级：低。业务风险：高。

这是全项目级改造，只有前述阶段收益不足时才考虑。

开始前必须：

- 用 CodeGraph 和源码统计全局组件、动态组件、JSX/render 函数、消息/弹窗服务和图标使用方式。
- 核对当前自动导入插件是否覆盖 Element Plus 组件和样式。
- 特别检查通过字符串、后端菜单或动态配置引用的图标，它们可能无法通过静态搜索发现。
- 制定分模块迁移和回滚方案，不做全量一次性替换。

最低回归范围包括登录、Layout、菜单、表单、表格、分页、弹窗、上传、消息提示、日期选择器、树和所有权限按钮。

## 7. 验证矩阵

| 改动类型 | 必跑命令 | 必做人工验证 | 主要回滚条件 |
| --- | --- | --- | --- |
| 媒体压缩 | `npm run build` | 对应页面视觉、播放、兼容性 | 画质不可接受、无法播放、布局变化 |
| 异步 Editor | `npm run type-check`、`npm run build` | 四个业务区域的查看/编辑/保存 | 内容丢失、实例异常、长时间空白 |
| vendor 分包 | `npm run type-check`、`npm run build` | 所有被拆依赖对应页面、刷新深链接 | 运行时加载失败、新循环依赖、请求恶化 |
| ECharts 按需 | `npm run type-check`、`npm run build` | 四处图表的全部状态 | 图表缺失、交互/resize 异常 |
| AI 对话异步化 | `npm run type-check`、`npm run build` | 打开、流式输出、切页、身份切换 | handler 或会话状态错误 |
| Element Plus 按需 | 类型检查、完整构建 | 全局 UI 回归 | 任一公共组件、图标、样式缺失 |
| CI 内存配置 | Jenkins 完整流水线 | 构建、镜像、发布阶段 | 继续 Evicted/OOM、Pod 无法调度 |

构建成功只证明产物可生成，不代表业务行为正确。

## 8. 日志中其他问题的边界

以下问题不应混入打包优化提交：

- Sass `/` 除法弃用警告：未来兼容性问题，不是本次 Evicted 原因。
- 多处 `return` 后仍存在代码：不可达代码问题，不是包体积主因。
- `currencyName` 为常量却被 `v-model` 赋值：真实运行时风险，应单独修复并回归对应表单。
- `lottie-web` 使用 `eval`：安全和压缩警告；可以随 404 动画依赖优化单独评估。

`Circular chunk: vendor-element -> vendor -> vendor-element` 属于打包配置问题，可在 vendor 阶段处理。

## 9. 每次优化记录模板

复制以下表格追加到本文末尾，确保结果可追溯：

| 项目 | 记录 |
| --- | --- |
| 日期/提交 |  |
| 修改范围 |  |
| Node/npm 版本 |  |
| `npm run type-check` |  |
| `npm run build` |  |
| 转换模块数 |  |
| 构建耗时/峰值 RSS |  |
| 原始 `dist` / `.gz` |  |
| 首屏 raw / gzip |  |
| 相关 chunk 前后对比 |  |
| 人工验证场景 |  |
| 已知差异或回滚点 |  |

## 10. 推荐执行顺序

```text
固化基线
  -> 压缩大媒体资源
  -> WangEditor 异步加载
  -> 定向整理 vendor
  -> ECharts 按需导入
  -> 全局 AI 对话异步化
  -> 最后评估 Element Plus 全量按需化
```

CI 容器内存 request/limit 应与前端优化并行处理，不要等全部代码优化完成后再处理 Jenkins 调度问题。
