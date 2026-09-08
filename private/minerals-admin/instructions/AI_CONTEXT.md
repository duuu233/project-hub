# Minerals Frontend AI Context

> 最后核对：2026-08-06  
> 作用：供 AI 和维护者快速进入项目。详细说明见 `docs/`。  
> 存储：本文件、AGENTS.md、docs/ 和 .codegraph/ 的真实内容由私人 Hub 的 private/minerals-admin/ 管理，团队项目通过链接访问；公司、家里和 SSH 各自映射，通过 Hub Git 同步。每次改动都核对并维护这份文档；若与代码冲突，以当前工作树和已同步的 CodeGraph 为准。

## 1. 项目概览

`minerals-frontend` 是花盆项目的企业级 Web 前端。业务覆盖贸易订单、进口采购、提单与物流、出入库、库存、结算开票、资产融资、质押、应收应付、基础资料、系统权限和工作台。

项目源于若依 Vue 前端体系，但已经扩展为：

- Vue 3 单页应用。
- 后端菜单驱动的动态路由和权限系统。
- 企业、用户组、系统、部门、角色组成的多身份上下文。
- 面向大宗商品/矿产贸易链路的大量表单和状态页面。
- 合同识别、商品匹配、业务回填等 AI 辅助能力。
- 船舶跟踪、地图、流程图和经营图表能力。

## 2. 技术栈

以 `package.json` 为准，当前关键版本：

- Vue `3.3.9`
- Vite `5.0.4`
- TypeScript `~5.3.3`
- Vue Router `4.2.5`
- Pinia `2.1.7`
- Element Plus `^2.13.1`
- Axios `0.27.2`
- ECharts `5.4.3`
- AntV L7 `^2.22.5`
- Vue Flow `^1.47.0`
- Dagre `^1.1.8`
- Sass、Less、WangEditor、Quill、SortableJS

TypeScript 当前是渐进式配置：`strict: false`、`allowJs: true`。不要假设整个仓库已经具备严格类型安全。

## 3. 代码规模快照

2026-07-30 本地统计：

- `src/` 下约 449 个 `.vue` 文件。
- 约 123 个 `.ts` 文件、1 个 `.js` 文件。
- `src/views/` 约 368 个 Vue 页面。
- `src/components/` 约 59 个 Vue 组件。
- `src/api/` 约 61 个文件。
- 未发现自动化测试文件或测试目录。

此统计只用于判断维护风险，不应作为固定约束。

## 4. 核心架构

### 启动

`src/main.ts` 创建 Vue 应用并注册：

- Pinia、Vue Router。
- Element Plus 中文语言包。
- 全局插件、权限指令、TagsView 插件、表头插件。
- SVG 图标。
- `DictTag`、`Pagination`、`TreeSelect`、上传/预览、`RightToolbar`、`Editor` 等全局组件。
- `useDict`、下载上传、时间/表单/树/字典工具等全局属性。
- `src/permission.ts` 中的路由守卫。

### 登录与路由

关键流程：

```text
登录页
  -> user Store.login()
  -> /auth-service/index/login
  -> Token 写入 Minerals-Token + unified_token Cookie
  -> 首次受保护导航
  -> user Store.getInfo()
  -> /system-service/user/getInfo
  -> permission Store.generateRoutes()
  -> /system-service/menu/getRouters
  -> 从 Minerals-User-Info 读取 user.userType
  -> userType !== '00' 时递归移除 menuId=2000 的用户组管理路由
  -> 后端组件路径映射为 views 下的 Vue 组件
  -> router.addRoute()
  -> 跳转首个可访问路由
```

静态路由定义在 `src/router/index.ts`；后端菜单路由生成在 `src/store/modules/permission.ts`；导航时机与无权限/404 处理在 `src/permission.ts`。

### 请求

所有业务 API 应走 `src/utils/request.ts` 的 Axios 实例：

- `baseURL` 为空，开发环境依赖 Vite 将 `^/.*-service` 代理到目标网关。
- 默认附带 Bearer Token。
- GET 参数统一序列化。
- POST/PUT 默认有 1 秒防重复提交。
- 普通成功响应返回后端响应体 `res.data`，不是完整 AxiosResponse。
- 401 触发重新登录流程；500、601 和其他非 200 业务码统一提示。
- Blob/ArrayBuffer 直接返回。

### 身份上下文

`AuthContextSwitcher.vue` 负责企业、用户组、系统、部门、角色选择。提交后调用 `/auth-service/index/changeLogin` 换取新 Token，将上下文写入 `Minerals-System-Context`，清除用户缓存并 `window.location.replace('/')`，让用户、菜单和路由完整重建。

不要只局部替换 Token 而保留旧权限路由或 TagsView。

### 页面组织

多数业务域采用：

```text
src/views/<domain>/<feature>/
  index.vue
  add.vue
  edit.vue
  detail.vue
  template/handleDetail.vue
  components/
```

`add/edit/detail` 常用同一个 `handleDetail.vue`，`pageType` 约定通常是：

- `1`：新增
- `2`：编辑
- `3`：详情

API 按领域放在 `src/api/`。运行时菜单名称、路由名称、页面组件 `name` 和 TagsView 缓存存在耦合。

当前新增了两个国内贸易业务模块：

- 国内采购：`src/views/deomestic-purchasing/`，运行时路由 `/deomestic-purchasing` 由后端菜单下发。
- 国内销售：`src/views/domestic-sales/`，运行时路由 `/domestic-sales` 由后端菜单下发。
- 两个模块严格独立，不存在第三个共享业务目录。

国内采购仍是以 `src/assets/181/` demo 为依据的静态原型。国内销售已对接 `/purchase-service/domesticSaleOrder` 的列表、商品列表、详情、新增、修改、确认/取消和删除接口；附件先走全局 `FileUpload` 上传，再以 `fileName/fileUrl` 提交到订单接口。列表、表单及商品子组件之间保留类型化边界。

## 5. 目录速览

| 路径 | 作用 |
| --- | --- |
| `src/api/` | 按领域封装后端接口 |
| `src/views/` | 页面与业务模块 |
| `src/components/` | 跨业务复用组件 |
| `src/common/` | 共享业务片段，当前以贷后流程为主 |
| `src/layout/` | 主框架、导航、TagsView、身份上下文 |
| `src/router/` | 静态路由与少量本地动态权限路由 |
| `src/store/modules/` | Pinia 状态 |
| `src/utils/` | 请求、认证、上下文、字典与通用工具 |
| `src/directive/` | 权限、节流、复制等指令 |
| `src/plugins/` | 全局插件 |
| `src/types/` | 全局、API、路由和自动导入声明 |
| `vite/` | 自动导入、SVG、压缩、K8s 文件复制等 Vite 插件 |
| `scripts/` | 迁移、审计、修复、瓦片下载等维护脚本 |

完整业务域说明见 `docs/domain-map.md`。

## 6. 环境与命令

- 推荐 Node.js 18+、npm 9+。
- `npm run dev`：development 模式，端口 80。
- `npm run test` / `npm run dev:test`：Vite `test` 模式。
- `npm run prod` / `npm run dev:prod`：production 模式本地联调。
- `npm run type-check`：`vue-tsc --noEmit`。
- `npm run build`：生产构建，最大堆 3072 MB；本机完整生产构建已验证，构建 Pod 仍应按至少 4 GiB 可用内存调度。
- `npm run build:fast`：fast 模式，不生成 gzip。

重要不一致：仓库有 `.env.staging`，但测试脚本使用 `--mode test`，当前没有 `.env.test`。Vite 代理目标由 `vite.config.ts` 的 mode 决定，详细见 `docs/development.md`。

## 7. 高风险区域

- 登录、Cookie Token、401 重登录。
- 后端菜单结构与动态路由组件路径。
- 首页首个可访问路由、无权限 404 分支。
- 身份上下文切换后的用户/菜单/TagsView 一致性。
- `src/utils/request.ts` 的响应解包和防重复提交约定。
- 大型 `template/handleDetail.vue` 中交织的表单、附件、字典和 AI 回填。
- 页面 `name`、路由 `name` 与 KeepAlive/TagsView 的一致性。
- 缺少自动化测试，且 TypeScript 非严格模式。
- 大量历史页面重复实现相似逻辑，公共修改的 blast radius 可能很大。
- 终端中文显示可能受编码环境影响；未确认前不要批量转码。

## 8. 文档地图

- `AGENTS.md`：AI 必须遵守的工作与验证规则。
- `docs/README.md`：文档入口与维护方式。
- `docs/architecture.md`：启动、鉴权、请求、路由、状态和构建架构。
- `docs/domain-map.md`：业务域、目录和主要依赖地图。
- `docs/development.md`：环境、命令、实现约定和验证方法。
- `docs/maintenance.md`：长期维护、风险变更和排障手册。

## 9. AI 开工检查

1. `git status --short`
2. 拉取/切换代码后运行 `codegraph sync`
3. 阅读本文件和相关 `docs/`
4. 用 CodeGraph 查询目标符号、调用链和影响范围
5. 只读取 CodeGraph 未覆盖的配置或具体文件
6. 最小修改并运行相应验证
7. 核对并更新 Hub 共享私人文档，分别检查业务仓库和 Hub 的 diff；按用户授权提交与同步
