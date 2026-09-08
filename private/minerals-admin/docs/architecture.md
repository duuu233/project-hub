# 技术架构

> 最后核对：2026-08-06。关键事实来自 CodeGraph、当前源码和项目配置。

## 1. 总体结构

项目是 Vue 3 SPA，前端不持有完整业务菜单配置。登录身份决定后端返回的菜单树，前端把菜单中的组件路径转换为实际 Vue 页面并动态注册。

```text
浏览器
  |
  v
Vue App (main.ts)
  +-- Router + 全局守卫
  +-- Pinia Stores
  +-- Element Plus / 全局组件 / 指令 / 插件
  |
  v
统一 Axios 请求层 (utils/request.ts)
  |
  +-- /auth-service/*
  +-- /system-service/*
  +-- /trade-service/* 等业务微服务路径
  |
  v
开发环境 Vite 代理 / 生产环境网关
```

## 2. 应用启动

入口为 `src/main.ts`：

1. 加载 Element Plus、中文语言包和全局样式。
2. 创建 Vue App。
3. 注入全局工具：字典、上传下载、日期、表单、树结构、TabsView 辅助等。
4. 注册常用全局组件。
5. 安装 Pinia、Router、项目插件、图标、TagsView、Element Plus、表头插件。
6. 注册自定义指令。
7. 导入 `src/permission.ts`，从而安装全局路由守卫。
8. 挂载到 `#app`。

### 全局能力的维护影响

修改 `src/main.ts` 中的全局属性或组件注册会影响大量没有显式 import 的历史页面。删除前必须用 CodeGraph 搜索实际使用方，并检查 `src/types/global.d.ts` 的类型扩展。

自动导入由 `vite/plugins/auto-import.ts` 提供，当前自动导入 Vue、Vue Router、Pinia API，并生成 `src/types/auto-imports.d.ts`。看到未显式导入的 `ref`、`computed`、`useRoute`、`defineStore` 等不是遗漏。

## 3. 登录、会话与用户状态

### 登录链路

```text
views/login.vue
  -> store/modules/user.ts: login()
  -> api/login.ts: login()
  -> POST /auth-service/index/login
  -> setToken(access_token)
  -> 写入 Cookies:
       Minerals-Token
       unified_token
```

用户 Store 登录成功时还会：

- 清空旧用户字段和本地用户信息。
- 重置权限路由状态。
- 清空 TagsView。

### 用户恢复

首次进入受保护路由时，`src/permission.ts` 检查：

```text
!userStore.id || !permissionStore.routeLoadCompleted
```

若需要初始化：

1. `userStore.getInfo()` 先尝试恢复 `Minerals-User-Info`，再请求 `/system-service/user/getInfo` 获取最新数据。
2. 用户信息写入 Pinia 和 localStorage。
3. `permissionStore.generateRoutes()` 获取并生成路由。

缓存只是首屏恢复辅助，接口返回仍是最终用户信息来源。

### Token 兼容

`src/utils/auth.ts` 同时维护：

- `Minerals-Token`
- `unified_token`

读取时如果只存在 `unified_token`，会回写 `Minerals-Token`。退出时同时删除两个 Cookie，并兼容清理 `.ftechain.com` 域的旧 Cookie。修改 Cookie 名称、path 或域策略会影响统一登录兼容，必须进行跨入口验证。

## 4. 统一请求层

入口为 `src/utils/request.ts`，Axios 版本为 0.27.2。

### 请求拦截

- 默认 `Content-Type: application/json;charset=utf-8`。
- 除 `headers.isToken === false` 外，自动添加 Bearer Token。
- GET `params` 使用 `tansParams` 序列化进 URL。
- POST/PUT 默认启用防重复提交：
  - 以 URL 和序列化后的 data 组成 key。
  - 保存到 session cache。
  - 1 秒内相同请求会被拒绝。
  - 大于约 5 MB 的请求跳过防重复校验。
- `headers.repeatSubmit === false` 表示跳过防重复提交。

注意两个请求头字段的语义都是“设置为 false 才关闭对应默认行为”，命名容易误读。

### 响应拦截

- Blob/ArrayBuffer 直接返回二进制数据。
- 业务码默认按 `res.data.code || 200` 判断。
- 200 返回 `res.data`，因此业务调用方接收的是后端响应体。
- 401 弹出重新登录确认，并在确认后退出、保留当前地址作为 redirect。
- 500、601 和其他非 200 业务码统一提示并 reject。
- 网络错误、超时和 HTTP 状态异常统一转换为用户消息。

### 上传下载

- `download()` 默认 POST，支持表单编码；显式 JSON Content-Type 时保留 JSON。
- `upload()` 构造 FormData，字段名固定为 `file`，额外参数逐项附加。

修改请求层后至少验证：

- 无 Token 请求。
- 普通 GET/POST。
- 防重复提交。
- 401。
- Blob 下载。
- multipart 上传。

## 5. 路由与权限

### 静态路由

`src/router/index.ts` 包含：

- redirect、login、register。
- 船舶跟踪、帮助中心。
- 401/404。
- 空 Layout 根节点。
- 用户个人中心。
- 少量需本地权限判断的隐藏动态路由，如角色授权、字典数据、任务日志、代码生成编辑。

路由使用 HTML5 history：`createWebHistory()`。生产服务器必须把未知前端路由回退到 `index.html`。

### 全局守卫

`src/permission.ts` 的主要规则：

- 白名单：`/login`、`/register`、`/vessel-tracking`。
- 无 Token 且非白名单：跳转登录并带 redirect。
- 已登录访问 `/login`：跳转根路径。
- 用户或路由未初始化：加载用户信息和权限路由。
- 根路径、空路径或 `/index`：跳转到首个可访问路由。
- 已完成菜单加载但无可访问路由：进入带 `scene=no-access` 的 404。
- 动态路由初始化后以 replace 方式重进当前地址，确保重新匹配。

### 后端菜单转路由

`src/store/modules/permission.ts`：

1. 请求 `/system-service/menu/getRouters`。
2. 从 `Minerals-User-Info` 读取 `user.userType`；只有 `userType === '00'` 的超级管理员保留 `menuId=2000` 的用户组管理路由，其他情况（含缓存缺失或无效）递归移除该节点及其子路由。
3. 排除名为 `Weapp` 的菜单节点。
4. 处理多层菜单，将后端结构标准化。
5. 复制为侧栏、实际路由和顶部菜单三套数据。
6. 将组件标识映射：
   - `Layout`
   - `ParentView`
   - `InnerLink`
   - 其他路径通过 `import.meta.glob('./../../views/**/*.vue')` 加载
7. 按权限过滤本地 `dynamicRoutes`。
8. 注册动态路由和最终 404 捕获路由。
9. 记录是否有可访问页面及首个可访问路由。

### 路由耦合点

- 后端 `component` 必须与 `src/views` 文件路径匹配。
- 路由 `name` 应保持唯一。
- 页面 `<script setup name>` 参与 KeepAlive/TagsView 行为。
- `meta.activeMenu` 控制侧栏高亮。
- `meta.noCache`、`affix`、`link`、`breadcrumb` 会被布局组件消费。
- 动态路由必须先注册，最终通配 404 才能注册，否则会过早吞掉后端路由。

## 6. 布局与导航状态

`src/layout/` 负责：

- `index.vue`：整体框架。
- `components/AppMain.vue`：当前路由内容和缓存。
- `Navbar.vue`：顶部导航与身份切换入口。
- `Sidebar/`：由 permission Store 的 `sidebarRouters` 渲染。
- `TopNav/`：顶部菜单与侧栏联动。
- `TagsView/`：访问页签、刷新、关闭、固定标签。
- `IframeToggle/` 与 `InnerLink/`：外链 iframe 页面。
- `AuthContextSwitcher.vue`：当前登录身份上下文。

主要 Store：

| Store | 职责 |
| --- | --- |
| `app` | 侧栏、设备、界面尺寸 |
| `settings` | 主题、标题、导航和 TagsView 设置 |
| `user` | Token、用户、角色、权限 |
| `permission` | 后端菜单、动态路由、首个可访问路由 |
| `tagsView` | visited/cached/iframe views |
| `dict` | 字典缓存 |
| `excludeRouters` | 页面缓存排除辅助 |
| `copy` | 业务复制状态 |
| `importList` | 进口业务共享状态 |
| `vesselTracking` | 船舶跟踪状态 |

## 7. 身份与系统上下文

`AuthContextSwitcher.vue` 同时处理企业、用户组、系统，以及部分情况下的部门、角色选择。

提交链路：

```text
选择上下文
  -> POST /auth-service/index/changeLogin
  -> 获得新的 access_token
  -> setToken()
  -> removeUserInfo()
  -> setCachedSystemContext()
  -> window.location.replace('/')
  -> 重新执行用户恢复 + 菜单加载 + 动态路由生成
```

缓存键：

- `Minerals-System-Context`
- 兼容旧键 `Minerals-Last-System`

缓存包含用户、企业、用户组、部门、角色、系统的 ID 和名称。缓存用户名与当前用户不匹配时，组件会丢弃旧上下文，防止跨账号复用。

## 8. 业务页面与 API

典型业务功能由列表页和详情表单组成：

```text
index.vue
  -> 搜索、分页、权限按钮、列表 API
  -> 跳转 add/edit/detail

add.vue / edit.vue / detail.vue
  -> template/handleDetail.vue
  -> pageType 1 / 2 / 3
  -> 多个领域 API、字典、上传、子弹窗组件
```

大型 `handleDetail.vue` 往往同时承担：

- 表单初始化和校验。
- 详情加载与格式转换。
- 新增/编辑提交。
- 附件上传。
- 字典和下拉选项。
- 子表格排序。
- AI 识别结果回填与差异确认。
- Activated/Deactivated 和 TagsView 生命周期。

这类文件修改时不要只看当前函数。应在 CodeGraph 中同时查询组件、API、AI 回调、路由包装页和公共子组件。

## 9. AI 辅助能力

关键模块：

- `components/GlobalAiChat/`
- `components/AiChatDialog/`
- `components/AiResultCompare/`
- `utils/aiChatState.ts`
- `utils/aiDocActions.ts`
- `utils/aiIngredientMatch.ts`
- `utils/aiGoodsSite.ts`
- `api/ai/chat.ts`

当前已确认的结构化文件类型包括代理单合同和进口采购合同。AI 响应可以根据文件类型导航到对应新增页，并通过全局状态注册页面处理器；编辑场景可能先比较差异再确认覆盖。

此链路与具体业务表单字段高度耦合。新增文件类型时应同时检查：

- 文件类型与目标路由映射。
- 路由页面是否已注册 AI handler。
- pending payload 的消费与清理。
- 新增、编辑、详情三种 pageType 行为。
- 字典值、站点和商品匹配失败的降级提示。

## 10. 构建结构

`vite.config.ts`：

- `@` 指向 `src`，`~` 指向仓库根。
- 开发服务端口 80、host=true、open=true。
- 代理匹配 `^/.*-service`。
- 构建目标 ES2020，CSS 目标 Chrome 80。
- 不生成 sourcemap。
- 第三方依赖按 Vue、Element Plus、ECharts、L7、编辑器、工具等拆分 chunk。

Vite 插件：

- Vue SFC。
- Vue/Router/Pinia 自动导入。
- `<script setup name>` 扩展。
- SVG 雪碧图。
- 构建时复制 K8s 文件。
- 按环境变量生成 gzip/brotli。

部署必须同时考虑：

- `/prod-api` 或 `/stage-api` 的网关转发。
- HTML5 history 回退。
- `.gz` / `.br` 的服务器响应配置。
- `k8s/` 文件复制是否仍符合部署平台要求。
