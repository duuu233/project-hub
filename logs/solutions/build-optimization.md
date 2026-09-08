# 方案：大型前端 Vite 构建分包与基线监控

- **方案来源**：正矿项目 (minerals-admin)
- **适用场景**：大型 Vue3 / React 单页应用随功能增加，打包体积过大（如 chunk 超出 500KB）、构建耗时长、首屏加载慢。

---

## 核心解法

### 1. manualChunks 细粒度分包策略
在 ite.config.ts 中针对大型第三方依赖按功能域拆分：
- **vue-vendor**：ue, ue-router, pinia 基础框架核心
- **ui-vendor**：Element Plus / Ant Design 等组件库及其样式
- **chart-vendor**：ECharts / G2 等图表与可视化库
- **utils-vendor**：lodash-es, dayjs, axios 等通用工具库

### 2. 第三方 CDN 拆分
针对体积庞大且版本稳定的依赖（如全量 Icon 库、高德地图 SDK 等），采用 Vite 插件配置外部化（external），通过公共/私有 CDN 加载，大幅削减编译产物体积。

### 3. 构建基线与防退化监控
- 建立打包指标基线文档（记录每次重大重构后的 JS / CSS / Gzip 总体积与构建耗时）。
- 在持续迭代中比对构建产物，防止开发人员无意引入未按需引入的大型库导致体积膨胀。
