# 打包优化实施记录：阶段 2 / 3 / 4

> 配套文档：[build-optimization.md](./build-optimization.md)
>
> 本次实施对应该文档第 6 节的**阶段 2（WangEditor 异步加载）**、**阶段 3（整理通用 vendor 分包）**、**阶段 4（ECharts 按需导入）**。
> 阶段 1（压缩大媒体资源）、阶段 5（全局 AI 对话异步化）、阶段 6（Element Plus 按需化）本次**未实施**。

## 1. 实施环境

| 项目 | 记录 |
| --- | --- |
| 日期 | 2026-08-25 |
| 分支 | `feature-v1.8.2-fix` |
| 基线提交 | `456b973` |
| Node.js / npm | v24.16.0 / 11.13.0 |
| 构建命令 | `npm run build`（`NODE_OPTIONS=--max-old-space-size=3072`） |
| 依赖安装 | 仓库不提交 lockfile，本次为 `npm install` 全新解析（898 个包） |

> 注意：由于没有 lockfile，本记录中的绝对体积只在同一次依赖解析下可比。后续复测请重新跑一遍基线，不要直接和本表数字对比。

## 2. 总体结果

| 指标 | 基线 | 阶段 2 | 阶段 3 | 阶段 3b | 阶段 4（最终） | 相对基线 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Vite 转换模块数 | 4686 | 4686 | 4686 | 4686 | 4683 | −3 |
| 构建耗时（vite 自报） | 2m30s | 2m27s | 2m24s | 2m25s | 2m26s | 基本持平 |
| 构建峰值 RSS | 3068 MiB | 3096 MiB | 3099 MiB | 3114 MiB | 3038 MiB | 噪声范围内 |
| `dist` 原始部署文件 | 29.44 MiB | 29.42 MiB | 29.35 MiB | 29.36 MiB | **28.87 MiB** | −0.57 MiB |
| `.gz` 预压缩副本 | 2.13 MiB | 2.13 MiB | 2.12 MiB | 2.12 MiB | **1.96 MiB** | −0.17 MiB |
| `dist` 磁盘总量 | 31.57 MiB | 31.55 MiB | 31.46 MiB | 31.48 MiB | **30.83 MiB** | −0.74 MiB |
| JavaScript 原始体积 | 7.49 MiB | 7.48 MiB | 7.40 MiB | 7.42 MiB | **6.93 MiB** | −0.56 MiB |
| **首屏 raw（index.html 直接加载）** | 3.65 MiB | 2.86 MiB | 2.21 MiB | 2.21 MiB | **2.21 MiB** | **−1.44 MiB（−39%）** |
| **首屏 gzip（预压缩副本）** | 1.10 MiB | 0.83 MiB | 0.65 MiB | 0.65 MiB | **0.65 MiB** | **−0.45 MiB（−41%）** |
| `Circular chunk` 告警 | 2 条 | 2 条 | 2 条 | **0 条** | **0 条** | 已消除 |

**关键结论**

- 首屏加载体积是本次最大收益：raw 降 39%、gzip 降 41%。
- 部署产物总体积只降了 0.74 MiB。文档的判断成立——`dist` 体积的大头（GIF 8.29 MiB + WebM 6.85 MiB + PNG 5.54 MiB ≈ 20.7 MiB）属于阶段 1，本次没有动。
- **构建峰值内存基本没变（3068 → 3038 MiB，属噪声）。这三个阶段都不是 Jenkins Evicted 的修复手段**，文档第 4 节的结论仍然有效：CI 侧必须单独配置 `nodejs` 容器的 memory request/limit。

## 3. 阶段 2：WangEditor 异步加载

### 改动

`src/main.ts`：

```diff
-import { createApp } from 'vue'
+import { createApp, defineAsyncComponent } from 'vue'
...
-import Editor from '@/components/Editor/index.vue'
...
+const Editor = defineAsyncComponent(() => import('@/components/Editor/index.vue'))
+
 const app = createApp(App)
```

`app.component('Editor', Editor)` 保持不变，`src/components/Editor/index.vue` 未改动，四个业务页面的 `<editor v-model=... :min-height=... :readOnly=...>` 调用方式全部不变。

> 事前已确认：全仓库没有任何页面对 `<editor>` 使用模板 `ref` 或访问组件实例方法，只用 `v-model` + props，因此异步化不会破坏调用契约。

### 效果

| 指标 | 基线 | 阶段 2 |
| --- | ---: | ---: |
| 首屏 raw | 3.65 MiB | 2.86 MiB |
| 首屏 gzip | 1.10 MiB | 0.83 MiB |
| `vendor-editor.js` 是否 preload | 是（789.84 KiB） | **否** |
| `vendor-editor.css` 是否 preload | 是（14.46 KiB） | **否** |

与文档预估（raw 约 −0.77 MiB / gzip 约 −0.27 MiB）一致。`vendor-editor` chunk 仍然存在，只被使用富文本的页面 chunk 静态引用，所以 `dist` 总量几乎不变。

## 4. 阶段 3：整理通用 vendor 分包

### 改动

`vite.config.ts` 的 `manualChunks` 新增 5 组页面级依赖：

```ts
if (/node_modules[\\/](vue3-lottie|lottie-web)[\\/]/.test(id)) return 'vendor-lottie'
if (/node_modules[\\/](@vue-flow|@dagrejs)[\\/]/.test(id)) return 'vendor-flow'
if (/node_modules[\\/]qrcode[\\/]/.test(id)) return 'vendor-qrcode'
if (/node_modules[\\/]vue-cropper[\\/]/.test(id)) return 'vendor-cropper'
if (/node_modules[\\/]sortablejs[\\/]/.test(id)) return 'vendor-sortable'
```

用完整路径段匹配而不是 `id.includes()`，避免误伤 `jsqr`、`@types/qrcode` 这类名字相近的包。

### 效果

通用 `vendor` chunk：**908.63 KiB → 240.82 KiB（−667.8 KiB）**。

新增的 5 个 chunk 全部只被对应业务页面静态引用（已从构建产物逐个核对）：

| 新 chunk | 体积 | 被哪些页面 chunk 静态引用 |
| --- | ---: | --- |
| `vendor-lottie` | 306.94 KiB | `404` |
| `vendor-flow` | 191.83 KiB | 提单轨迹 / 船舶轨迹的 `index`、`TrackNode`、`SpecialNode` |
| `vendor-sortable` | 36.18 KiB | 进口订单 `handleDetail`、代理订单 `handleDetail`、系统菜单 `index` |
| `vendor-cropper` | 29.74 KiB | `userAvatar` |
| `vendor-qrcode` | 22.44 KiB | 场地列表 `index`、场地 `handleDetail` |

`index.html` 最终 preload 清单只剩 9 个文件：

```
/assets/index-*.js          444.62 KiB
/assets/index-*.css          53.84 KiB
/assets/vendor-*.js         240.82 KiB
/assets/vendor-*.css          1.07 KiB
/assets/vendor-cjs-*.js       0.23 KiB
/assets/vendor-element-*.js 948.58 KiB
/assets/vendor-element-*.css 352.63 KiB
/assets/vendor-utils-*.js   125.48 KiB
/assets/vendor-vue-*.js      95.21 KiB
```

### 未采纳：`marked` 单独成块

文档把 `marked`（AI 对话 Markdown 渲染）列为阶段 3 的候选拆分组，**本次没有拆**。原因是实测调用链：

```
src/router/index.ts（静态 import Layout）
  -> src/layout/index.vue:21  静态 import GlobalAiChat
  -> src/components/GlobalAiChat/index.vue:19  静态 import AiChatDialog
  -> src/components/AiChatDialog/index.vue:258  import { marked } from 'marked'
```

`marked` 处在入口的**静态**依赖图里。把它单独拆成 chunk 并不能让它退出 preload，只会多一个首屏请求，与文档「不设置过多细碎 chunk」的要求冲突。正确的处理方式是文档的**阶段 5（全局 AI 对话异步化）**——等 `AiChatDialog` 改成异步组件后，`marked` 自然会跟着离开首屏，届时再决定是否单独成块。

### 阶段 3b：消除 Circular chunk 告警

基线一直有两条告警：

```
Circular chunk: vendor-element -> vendor-utils -> vendor-element
Circular chunk: vendor-element -> vendor -> vendor-element
```

定位结果：循环的两端并不是业务代码，而是 Rollup 的 CommonJS 互操作辅助模块（`commonjsGlobal` 和 `getDefaultExportFromCjs`）。它们是虚拟模块，默认会被并入第一个用到它的 chunk（这里是 `vendor-element`），于是 `vendor-utils`（dayjs）和 `vendor`（js-cookie、nprogress 等 CJS 包）又要反过来从 `vendor-element` 引入它们。

处理方式（`vite.config.ts`，放在 `node_modules` 判断之前）：

```ts
if (id.includes('commonjsHelpers')) return 'vendor-cjs'
```

结果：生成一个 **0.23 KiB、不 import 任何东西的叶子 chunk**，两条告警全部消失，首屏体积不变。

## 5. 阶段 4：ECharts 按需导入

### 改动

四个文件全部把 `import * as echarts from 'echarts'` 换成 `echarts/core` + 显式注册。**所有 `echarts.init()`、`echarts.graphic.LinearGradient`、option 配置、生命周期代码一行未动**，只改了 import 和新增一行 `echarts.use([...])`。

| 文件 | 注册内容 | 依据 |
| --- | --- | --- |
| `src/views/system/currency/template/historyRateDialog.vue` | `LineChart` + Grid/Legend/Tooltip + `CanvasRenderer` | 单条折线、legend、`trigger: 'item'` tooltip |
| `src/views/information/market-data/index.vue` | `LineChart` + Grid/Legend/Tooltip + `CanvasRenderer` | 多系列折线、`trigger: 'axis'` tooltip、`legendToggleSelect` |
| `src/views/information/customs-data/index.vue` | `PieChart, LineChart, BarChart` + Grid/Legend/Tooltip + `CanvasRenderer` | 占比环形图 + 均价折线图 + 贸易量柱状图（含堆叠、渐变色） |
| `src/views/workbench/components/WorkbenchArrivalChart.vue` | `BarChart, LineChart` + Grid/Legend/Tooltip + `CanvasRenderer` | 双轴柱线组合、渐变柱条、自定义 tooltip |

已复核的注册完整性：

- 四个文件实际用到的 series type 只有 `bar` / `line` / `pie`，全部已注册。
- 没有用到 `dataZoom`、`toolbox`、`visualMap`、`markLine`、`markPoint`、`title`、`dataset`、`geo`、`radar`、`polar`。
- 工作台图表 tooltip 里的 `axisPointer` 由 `TooltipComponent` 自带（`echarts/lib/component/tooltip/install.js` 内部 `use(installAxisPointer)`）。
- 海关数据的 `legend.type: 'scroll'` 由 `LegendComponent` 自带（内部同时安装 plain 与 scroll）。
- `echarts.use()` 是幂等的（内部按引用去重），放在 `<script setup>` 里每次实例化重复调用不会产生副作用。

### 效果

| 指标 | 阶段 3b | 阶段 4 |
| --- | ---: | ---: |
| `vendor-echarts.js` | 1003.45 KiB | **504.38 KiB（−49.7%）** |
| JS 原始总量 | 7.42 MiB | 6.93 MiB |
| `dist` 原始 | 29.36 MiB | 28.87 MiB |

`vendor-echarts` 本来就不在首屏 preload 里，所以首屏数字不变；收益体现在总产物体积和四个图表页面的首次进入。

**转换模块数只从 4686 降到 4683**，因为 `echarts/charts`、`echarts/components` 是 barrel 文件，Rollup 仍要解析全部导出再做 tree-shaking——因此这一项**同样不能降低构建内存**，只能减小产物。

## 6. 验证情况

### 已完成（自动化）

| 项目 | 结果 |
| --- | --- |
| `npm run type-check`（基线） | 6 个既有错误 |
| `npm run type-check`（阶段 4 后） | **同样 6 个既有错误，无新增** |
| `npm run build` | 5 次全部成功（基线 / 阶段2 / 阶段3 / 阶段3b / 阶段4） |
| `npm run strip-comments:check` | 通过（`src/` 下未引入任何注释，符合项目约定） |
| `index.html` preload 清单核对 | 已逐项核对，见第 4 节 |
| 拆分 chunk 归属核对 | 已逐个核对被哪些页面 chunk 引用，见第 4 节 |
| Circular chunk 告警 | 已消除，`vendor-cjs` 确认为无 import 的叶子 chunk |

既有的 6 个类型错误（与本次改动无关，属于原有问题）：

```
src/api/workbench/dashboard.ts(2,15)                                  TS2724 shipDynamicsWarning
src/views/deomestic-purchasing/components/DomesticOrderList.vue(173)  TS2339 domesticPurchaseNo
src/views/domestic-sales/composables/useDomesticSaleGoods.ts(19,9)    TS2322 number -> string
src/views/information/market-data/components/import-data-dialog.vue(557) TS2339 marketType
src/views/order/agency-order/components/overViewDrawer.vue(185,306)   TS2339 index ×2
```

### 待人工验证（必须在浏览器里逐项确认）

> 构建成功只证明产物可生成，不代表业务行为正确。以下为文档第 6/7 节要求的最小回归范围。

**阶段 2 — 富文本编辑器（4 个区域）**

- [ ] 商品详情/编辑富文本 `site-goods/goods-list/template/handleDetail.vue`
- [ ] 资讯详情/编辑富文本 `information/information-list/template/handleDetail.vue`
- [ ] 系统通知富文本 `system/notice/index.vue`
- [ ] 帮助中心（**同页两个 `<editor>` 实例**）`system/help-me/template/handleDetail.vue`

每个区域检查：首次进入不长时间空白；初始 HTML 回显正确；`readOnly`（详情页 `pageType === 3`）确实只读；输入、粘贴、图片上传、视频插入、保存内容一致；关闭页面 / TagsView 切换 / 再次进入无旧实例残留。

**阶段 3 — 被拆依赖对应页面**

- [ ] 404 页面（lottie 动画正常播放）
- [ ] 场地列表 + 场地详情（二维码生成）
- [ ] 用户头像裁剪
- [ ] 系统菜单拖拽排序
- [ ] 进口订单、代理订单详情内的拖拽排序
- [ ] 提单轨迹、船舶轨迹两类流程图（含刷新深链接直接进入）

**阶段 4 — 四处图表全部状态**

- [ ] 汇率历史弹窗：打开弹窗渲染、切换币种、切换近7/14/30天、无数据分支、关闭后重开
- [ ] 市场行情：首次渲染、切换 tab、自定义 legend 点击（`legendToggleSelect`）、tooltip 内容、窗口 resize
- [ ] 海关数据：环形图 + 折线图 + 柱状图三张、堆叠柱与单柱（渐变色）两种模式、tooltip、legend scroll、窗口 resize
- [ ] 工作台到港图表：双轴渲染、渐变柱条、自定义 tooltip（含明细卡片）、容器 resize（ResizeObserver）、组件卸载后再挂载
- [ ] 以上四处都要验证 TagsView 缓存切换后没有重复实例或空白画布

## 7. 回滚点

三个阶段互相独立，可以单独回滚：

| 阶段 | 回滚方式 |
| --- | --- |
| 阶段 2 | `src/main.ts` 恢复 `import Editor from '@/components/Editor/index.vue'`，删掉 `defineAsyncComponent` |
| 阶段 3 | `vite.config.ts` 删掉 5 条 `vendor-lottie/flow/qrcode/cropper/sortable` 规则 |
| 阶段 3b | `vite.config.ts` 删掉 `commonjsHelpers` 那一行（会恢复 2 条 Circular chunk 告警） |
| 阶段 4 | 四个文件各自恢复 `import * as echarts from 'echarts'`，删掉 `echarts.use([...])` 与三行子路径 import |

回滚条件按文档第 7 节：编辑器内容丢失或长时间空白 → 回滚阶段 2；运行时加载失败、新循环依赖或请求数明显恶化 → 回滚阶段 3；任一图表缺失、交互或 resize 异常 → 回滚阶段 4 对应文件。

## 8. 本次改动的文件清单

```
src/main.ts                                              阶段 2
vite.config.ts                                           阶段 3 + 3b
src/views/system/currency/template/historyRateDialog.vue 阶段 4
src/views/information/market-data/index.vue              阶段 4
src/views/information/customs-data/index.vue             阶段 4
src/views/workbench/components/WorkbenchArrivalChart.vue 阶段 4
```

以上 6 个文件之外没有任何改动，也没有做全仓库格式化或顺带修复无关告警。

## 9. 后续待办

1. **阶段 1（优先级最高）**：压缩 `ai-icon03.gif`（8.14 MiB）、`gif-ai.webm`（6.85 MiB）、`login-background.png`（4.34 MiB）。这三个文件仍占 `dist` 原始体积的约 66%，是部署产物的真正大头。
2. **CI 内存配置（与前端优化并行）**：给 Jenkins `nodejs` 构建容器声明 memory request（建议 ≥ 4 GiB）。本次三个阶段实测对峰值内存无影响，Evicted 问题不会因此消失。
3. **阶段 5**：全局 AI 对话异步化，顺带解决 `marked` 的首屏问题（见第 4 节）。
4. **阶段 6**：Element Plus 与图标按需化。目前 `vendor-element.js`（948.58 KiB）+ `vendor-element.css`（352.63 KiB）已经是首屏 preload 里最大的两块，占首屏 raw 的约 59%。风险高，需按文档要求先做全局用法统计再动手。
5. 文档第 8 节列出的其余问题（Sass 除法弃用警告、`return` 后不可达代码、`currencyName` 常量被 `v-model` 赋值）**仍未处理**，应单独提交，不要混进打包优化。
