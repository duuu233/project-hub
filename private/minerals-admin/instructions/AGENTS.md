# Minerals Frontend AI 协作规则

本文件约束所有在本仓库中工作的 AI 助手。目标是让 AI 作为长期维护者工作：先理解、再修改；关注跨模块影响；用源码、CodeGraph 和本地文档共同维持可追溯的项目知识。

## 1. 项目与环境约束

- 项目会在办公室电脑、家用电脑和远程 SSH 服务器之间维护。
- 团队仓库维护业务代码；私人 Project Hub 仓库维护本项目的文档、AI 规则和 CodeGraph 快照。
- 不得假设另一台机器具有相同的未提交文件、依赖、环境变量、构建产物或 CodeGraph 索引。
- `AGENTS.md`、`AI_CONTEXT.md`、`docs/` 和 `.codegraph/` 在业务项目内仅为链接，真实文件位于 Hub 的 `private/minerals-admin/`；两个 Markdown 文件单独放在 `instructions/`。不要向团队仓库提交这些链接或私人内容；真实文件通过私人 Hub 提交并同步。
- 公司 work、家里 home、服务器 ssh 复用同一 project_id 与私人目录，各自读取 Hub 的 `environments/<env>/projects.local.yaml`。不要将当前机器绝对路径写入共享规则。
- 每轮需求先检查并 pull Hub 和团队仓库各自当前分支，再执行挂载检查和 CodeGraph sync；用户明确说明已手动 pull 时按本轮说明执行。已有未提交内容先保留，不自动 stash 或覆盖。
- 每次修改代码都必须核对并同步维护这份共享文档：更新受影响的业务规则、接口字段、验证方法和上下文；没有文档变化时在任务结果注明已核对。通过业务目录的链接编辑就是修改 Hub 的同一份资料，不另存副本。
- 同步 Hub 中的数据库前停止本项目 CodeGraph daemon，checkpoint 后再提交；切换机器/分支后以本机源码执行 sync，必要时重建既有索引。运行锁、PID、日志和 SQLite WAL/SHM 不跨机器提交，数据库二进制冲突不可文本合并。完整步骤见 Hub `docs/private-mounts.md`。
- 保留用户已有的未提交改动。开始工作先运行 `git status --short`，不要覆盖、回滚或格式化无关文件。

## 2. 事实来源优先级

发生冲突时按以下顺序判断：

1. 当前工作树中的源码、配置和实际命令结果。
2. 已同步的 CodeGraph 结构、调用链和影响分析。
3. `AI_CONTEXT.md` 与 `docs/` 中的维护说明。
4. 根目录 `README.md`、历史注释和个人记忆。

文档描述与代码不一致时，以代码为准，并在当前任务内更新本地文档。

## 3. CodeGraph 工作流

仓库根目录存在 `.codegraph/` 时，CodeGraph 是理解代码的第一入口。

### 必须优先使用 CodeGraph 的场景

- 了解项目或子系统架构。
- 查找函数、组件、Store、API 的调用方和依赖方。
- 分析登录、鉴权、动态路由、请求拦截、身份上下文等跨文件流程。
- 评估重构、公共组件修改、Store 修改和 API 签名修改的影响范围。
- 接触不熟悉的业务模块。

### 使用规则

- 拉取或切换到新代码后先运行：

  ```bash
  codegraph sync
  ```

- 优先使用 `codegraph_explore`，一次查询同时写出目标符号、流程端点和需要的影响分析。
- CodeGraph 已返回的源码不要再用文本搜索重复确认。
- 如果结果提示某些文件刚被编辑、索引待同步，只直接读取提示中的具体文件。
- 配置、环境文件、Markdown、静态资源和 CodeGraph 未覆盖的细节可以直接读取。
- 只有 CodeGraph 无法回答定位问题时，才使用 `rg`；不要用大范围 grep 手工重建调用链。
- 修改关键代码后，确认索引已刷新；必要时再次 `codegraph sync` 并检查受影响符号。

如果仓库没有 `.codegraph/`，不要自行初始化；改用源码分析，并提醒维护者可按需运行 `codegraph init`。

## 4. 每次任务的标准流程

1. 检查 `git status --short`，识别用户已有改动。
2. 阅读 `AI_CONTEXT.md`，再按任务进入 `docs/` 中对应主题。
3. 用 CodeGraph 查目标符号、调用链和 blast radius。
4. 读取必要的配置或 CodeGraph 未覆盖文件。
5. 以最小改动完成需求，保持现有架构和业务语义。
6. 按风险执行类型检查、构建或针对性人工验证。
7. 检查 `git diff`，确保没有混入无关改动。
8. 每次修改核对并同步维护 Hub 私人目录中的相关文档；分别检查团队仓库和 Hub 的 diff，按用户授权分别提交/push，不漏掉私人文档。

仅回答、解释或诊断时，不得擅自修改代码。

## 5. 当前架构不变量

修改以下区域前必须阅读 `docs/architecture.md` 和 `docs/maintenance.md`：

- 应用入口：`src/main.ts`
- 路由定义：`src/router/index.ts`
- 全局路由守卫：`src/permission.ts`
- 动态菜单路由：`src/store/modules/permission.ts`
- 登录用户状态：`src/store/modules/user.ts`
- Token 与用户缓存：`src/utils/auth.ts`
- Axios 实例与拦截器：`src/utils/request.ts`
- 身份/系统上下文：`src/layout/components/AuthContextSwitcher.vue`、`src/utils/system-context.ts`

必须保留的现有行为：

- 后端 `/system-service/menu/getRouters` 返回菜单，前端将组件字符串映射为 Vue 组件并动态注册路由。
- 登录后或刷新时，先恢复用户信息，再生成权限路由；根路径跳转到首个可访问页面。
- Axios 成功响应已在拦截器中解包为 `res.data`，业务 API 调用方通常直接读取 `data`、`rows`、`total`。
- 请求默认附带 `Authorization: Bearer <token>`；只有显式设置 `headers.isToken = false` 才跳过。
- 身份上下文切换会换取新 Token、清除用户缓存，并通过整页刷新重建权限和路由。
- 常见业务详情表单由 `add.vue`、`edit.vue`、`detail.vue` 包装同一个 `template/handleDetail.vue`，`pageType` 通常为 `1/2/3`。
- 全局自动导入由 `vite/plugins/auto-import.ts` 提供，生成声明文件为 `src/types/auto-imports.d.ts`。

不要把服务端菜单路由改造成纯前端静态路由，也不要在没有完整回归方案时移除上下文切换后的整页刷新。

## 6. 编码约定

- Vue 代码继续使用 Vue 3 Composition API、`<script setup lang="ts">`。
- 新文件优先使用 TypeScript；旧文件允许渐进迁移，不做与任务无关的批量改写。
- 使用 `@/` 指向 `src/`，使用 `~/` 指向仓库根目录。
- Pinia Store 放在 `src/store/modules/`；跨页面共享状态才进入 Store，页面临时状态保留在组件内。
- 后端请求封装放在 `src/api/<domain>/`，页面不要重复创建 Axios 实例。
- 权限按钮沿用 `v-hasPermi` / `v-hasRole`，路由权限沿用 `permissions` / `roles`。
- 字典数据沿用 `proxy.useDict(...)` 和全局 `DictTag`。
- 复用现有全局组件和插件前先检查 `src/main.ts`，不要重复局部实现同一能力。
- 修改公共类型时检查 `src/types/api.d.ts`、`src/types/router.d.ts` 和 `src/types/global.d.ts`。
- 不要因为终端出现中文乱码就批量转码。先确认文件真实编码和浏览器显示；保持原有 UTF-8、换行符和无关文本不变。
- 避免全仓库格式化。项目包含大量历史业务页面，机械格式化会制造难以审查的差异。

## 7. API 与页面实现规则

- 新增 API 时明确 HTTP 方法、路径、参数位置和返回类型。
- 分页接口优先使用全局 `PageQuery` / `PageResult<T>`；普通接口使用 `ApiResult<T>` 或更精确类型。
- 注意 Axios 0.27 的类型和行为，不要直接套用 Axios 1.x 示例。
- GET 参数会被请求拦截器序列化到 URL；不要重复手工拼接普通查询参数。
- POST/PUT 默认启用 1 秒内防重复提交；确需关闭时显式使用 `headers.repeatSubmit = false` 并说明原因。
- 文件上传使用 `upload`，下载使用 `download`；确认服务端是否要求 JSON 或表单编码。
- 新增后端菜单页面时，组件路径必须能被 `import.meta.glob('./../../views/**/*.vue')` 解析。
- 动态路由的 `name`、页面 `<script setup name>` 和 TagsView 缓存行为相互关联，修改任一项都要检查另外两项。

## 8. 验证要求

按改动风险选择最低但充分的验证：

- 文档或纯注释：检查路径、链接、忽略状态和 diff。
- 普通 `.ts` / `.vue`：运行 `npm run type-check`。
- Vite、依赖、环境或构建相关：运行 `npm run type-check` 和 `npm run build`。
- 只需快速验证产物时可运行 `npm run build:fast`，但它不会验证 gzip 产物。
- 登录、Token、请求拦截、动态路由、身份切换：除类型检查和构建外，必须列出并尽量执行针对性的人工场景。
- 修复缺陷时优先补最小可重复验证；当前仓库没有自动化测试框架，不得把“构建成功”等同于业务行为正确。

不要为了让检查通过而扩大修改范围。若基线本身失败，记录失败命令、首个相关错误和是否由本次改动引入。

## 9. 文档维护责任

不同变化对应的文档：

| 变化 | 必须更新 |
| --- | --- |
| 技术栈、入口、目录、核心流程 | `AI_CONTEXT.md`、`docs/architecture.md` |
| 新增、删除或重命名业务域 | `AI_CONTEXT.md`、`docs/domain-map.md` |
| 开发命令、环境、代理、构建变化 | `docs/development.md` |
| 鉴权、路由、请求、上下文风险或排障方法 | `docs/maintenance.md` |
| AI 工作规则、验证门槛、CodeGraph 流程 | `AGENTS.md` |

文档只记录已从源码或实际命令验证的事实。推测必须标为“待确认”，不要把临时任务状态写成长期架构。

## 10. 禁止事项

- 不向团队仓库提交 `.codegraph/`、`AGENTS.md`、`AI_CONTEXT.md` 或 `docs/`；这些真实内容在私人 Hub 中正常管理和提交。
- 不把密钥、Token、账号、真实业务数据写入源码、日志或文档。
- 不擅自升级核心依赖、替换路由/状态管理方案或批量迁移页面。
- 不绕过统一请求层、权限指令或动态路由体系。
- 不删除用户改动，不使用破坏性 Git 命令处理脏工作树。
- 不把 `dist/`、`node_modules/` 或本机缓存当作跨环境事实来源。
