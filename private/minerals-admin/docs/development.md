# 开发与验证指南

> 最后核对：2026-07-30。

## 1. 环境要求

- Node.js 18+
- npm 9+
- Windows PowerShell、Linux shell 或远程 SSH 环境均可
- 开发端口默认为 80，可能需要管理员权限或释放端口

首次进入某台机器：

```bash
git status
npm install
codegraph sync
npm run type-check
```

不要复制另一台电脑的 `node_modules/`、`dist/` 或 `.codegraph/`。

## 2. 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | development 模式启动 |
| `npm run test` | test 模式启动，不是自动化测试 |
| `npm run dev:test` | 同 `npm run test` |
| `npm run prod` | production 模式本地启动 |
| `npm run dev:prod` | 同 `npm run prod` |
| `npm run type-check` | Vue/TypeScript 类型检查 |
| `npm run build` | 默认生产构建 |
| `npm run build:fast` | fast 模式构建，关闭压缩 |
| `npm run download:tiles:*` | 下载不同缩放级别的地图瓦片 |
| `npm run strip-comments:*` | 注释清理脚本及 dry-run/check |

`npm run test` 名称容易误导：当前它只启动 Vite test 模式，仓库没有测试运行器和自动化测试文件。

`build`、`build:fast` 与 `type-check` 将 V8 老生代堆上限设为 3072 MB。当前项目的 `vue-tsc` 会超过 Node.js 默认约 2 GiB 的堆上限，因此类型检查也需要显式设置。2026-08-25 在 Node.js 20 下对当前 5331 个模块的完整生产构建采样，峰值 RSS 约 2.96 GiB；这只是降低构建峰值，不能替代 CI 容器的资源声明。Jenkins/Kubernetes 的 Node 构建容器仍应至少申请 4 GiB 内存，并为 V8 堆外内存预留余量。

## 3. 环境模式

### 当前文件

| 文件 | APP_ENV | BASE_API | 压缩 |
| --- | --- | --- | --- |
| `.env.development` | development | 空 | 未设置 |
| `.env.staging` | staging | `/stage-api` | gzip |
| `.env.production` | production | `/prod-api` | gzip |
| `.env.fast` | production | `/prod-api` | none |

### 代理目标

`vite.config.ts` 根据 Vite mode 选择：

- development -> `https://dev-m.zhengkuangsc.com`
- test -> `https://test-m.zhengkuangsc.com`
- production -> `https://m.zkshuke.com`
- 其他 -> development 目标

代理只匹配：

```text
^/.*-service
```

### 已知模式不一致

测试联调脚本使用 `--mode test`，但仓库没有 `.env.test`；已有 `.env.staging` 不会被 test 模式自动加载。这意味着：

- 代理目标仍会因为 `mode === 'test'` 指向测试网关。
- `VITE_APP_TITLE`、`VITE_APP_ENV`、`VITE_APP_BASE_API` 不会从 `.env.staging` 自动加载。

调整前先确认部署和联调期望，不要只改一处脚本。

## 4. 新增业务接口

1. 在 `src/api/<domain>/` 找到最接近的接口文件。
2. 使用统一 `request` 实例。
3. 明确请求类型和响应类型。
4. 确认服务前缀能被开发代理匹配。
5. 确认参数位置：
   - GET 查询：`params`
   - POST/PUT JSON：`data`
   - 下载：`download`
   - 上传：`upload`
6. 只有登录、公开接口等才设置 `isToken: false`。
7. 只有确实允许快速重复提交时才设置 `repeatSubmit: false`。

示意：

```ts
export function listExample(params: PageQuery) {
  return request<PageResult<ExampleItem>>({
    url: '/example-service/example/list',
    method: 'get',
    params
  })
}
```

调用方拿到的是后端响应体：

```ts
const res = await listExample(query)
tableData.value = res.rows
total.value = Number(res.total)
```

## 5. 新增菜单页面

### 推荐结构

```text
src/views/<domain>/<feature>/
  index.vue
  add.vue
  edit.vue
  detail.vue
  template/handleDetail.vue
  components/
```

简单页面不必机械创建全部文件。

### 动态菜单注意事项

多数业务页面不是在 `router/index.ts` 手工注册，而由后端菜单下发：

- 后端 `component` 路径必须与 `src/views` 对应。
- 页面必须能被 `import.meta.glob('./../../views/**/*.vue')` 找到。
- 路由 name 应唯一并保持稳定。
- 使用 TagsView 缓存的页面要配置合适的 `<script setup name="...">`。
- 详情/编辑页要设置正确的 `activeMenu`。
- 按钮权限使用后端权限字符串与 `v-hasPermi` 对齐。

只有登录、错误页、公共隐藏页或明确需要前端权限声明的页面才进入静态/本地动态路由。

## 6. 表单页约定

常见包装：

```vue
<handle-detail :page-type="1" />
```

- 1 新增
- 2 编辑
- 3 详情

维护 `handleDetail.vue` 时：

- 将 pageType 分支集中并使用具名计算值，避免散落魔法数字。
- 详情页不得触发可写操作或 AI 覆盖。
- 编辑页加载完成后再处理依赖字典/选项的字段回显。
- 保存前确认金额、重量、时间和附件结构符合后端格式。
- TagsView keep-alive 下同时考虑 mounted、activated、deactivated。
- 离开页面时清理全局 AI handler、定时器和事件监听。

## 7. 组件和状态选择

优先级：

1. 页面内局部状态。
2. 同一功能目录内 composable/子组件。
3. `src/components/` 的跨业务组件。
4. Pinia 跨页面状态。
5. `src/main.ts` 全局能力。

不要把一次性页面状态放进全局 Store。进入 Store 后必须定义退出登录、切换身份、关闭 TagsView 时的清理策略。

## 8. 样式与资源

- 全局样式入口：`src/assets/styles/index.scss`。
- Element Plus 覆盖：`src/assets/styles/element-ui.scss`。
- 侧栏样式：`src/assets/styles/sidebar.scss`。
- 主题变量：`src/assets/styles/variables.module.scss`。
- SVG 资源：`src/assets/icons/svg/`，由 Vite SVG 插件注册。
- 页面专属图片放在对应语义目录下，避免继续堆到无分类根目录。

公共样式类被大量历史页面使用。修改 `.app-container`、列表按钮、搜索区域、表格或弹窗基础样式前必须查询影响范围。

## 9. TypeScript 现状

项目处于渐进迁移阶段：

- `strict: false`
- `noImplicitAny: false`
- `allowJs: true`
- 全局存在 `AnyObject`
- API 类型已具备基础 `ApiResult`、`PageResult`、`PageQuery`

新增代码应比旧代码更精确，但不要在普通需求中顺带严格化整个文件。优先给以下边界加类型：

- API 请求和响应。
- 组件 props/emits。
- Store state/action。
- 表单核心模型。
- 路由 meta 和跨模块 payload。

## 10. 验证矩阵

| 改动 | 最低验证 |
| --- | --- |
| 单一页面展示 | `npm run type-check` + 浏览器进入页面 |
| 表单/接口 | 类型检查 + 新增/编辑/详情场景 + 错误提示 |
| 公共组件 | 类型检查 + CodeGraph 调用方抽样 |
| Store | 类型检查 + 初始化/刷新/清理场景 |
| 路由/权限 | 类型检查 + 构建 + 刷新深链接 + 无权限 |
| 请求/Token | 类型检查 + 构建 + 登录/401/上传下载 |
| Vite/依赖/环境 | 类型检查 + `npm run build` |
| 文档 | 链接、事实、忽略状态 |

当前没有自动化测试，人工验证结果应在任务交付中明确写出，不要只说“已测试”。

## 11. 提交身份

本仓库的提交作者名用 `dh`，配置在**仓库级**（`.git/config`），不动全局配置——同一台机器上的花盆、相册等仓库仍用各自的全局身份。

```bash
git -C <正矿仓库> config --local user.name dh
git -C <正矿仓库> var GIT_AUTHOR_IDENT   # 核对
```

`.git/config` 不随 Git 同步，**每台机器各配一次**。2026-09-09 已在 ssh 开发机配好；work / home 未确认。邮箱沿用全局值，本次没有改。

此前从本机推上去的提交（`08dfce1`、`6b7d0ae`、`ad31f92`、`a909a1a` 以及 2026-09-01 那批）作者仍是 `pg-dh`：`feature-v1.8.3` 是与团队共用的分支，改写这些提交要重写历史并强推，未做。

## 12. 跨机器协作

开始：

```bash
git status --short
git pull
codegraph sync
npm install
```

是否需要 `npm install` 应由 `package.json`、锁文件和本机依赖状态决定。不要假设另一台机器已安装相同依赖。

结束：

- 检查 Git diff。
- 确认团队仓库没有提交私人文档、CodeGraph 或挂载链接；同步维护后的真实资料应按用户授权提交到私人 Hub。
- 记录实际执行的验证命令。
- 如果修改了环境要求、路由/请求约定或业务域，在本机更新对应文档。
