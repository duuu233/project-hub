# qianrong 产业配置非必填、右上角显示当前系统、合同模板 docx 预览（2026-11-11 ssh test/244f3bc）

- 需求（用户）：在 test 分支改三处——1. 新增产业配置的融资H5配置、PC登录配置下表单改为非必填；2. 登录后右上角显示当前登录的系统；3. 合同模板详情的 .docx 平铺展示在页面中，固定高度可滚动，旁边两个按钮：新页面打开、下载。
- 同步：tq-plus 当前即 test，工作区干净，test 同名 pull 已最新（7f55b3b）；origin GitHub。

## 1. 产业配置非必填

- `config-audit/project-list/template/handleDetail.vue`（新增 / 编辑 / 详情共用）：rules 只留产业项目、融资对象（用户未提，保持必填）；H5 的名称、注册方式、LOGO、用户协议、隐私协议去掉必填；PC 块页面类型、域名、大小标题、XY 坐标、背景图去掉必填。
- 页面类型保留「不能重复」校验，未选时跳过（否则两个空块都是 undefined 会报重复）。
- 自行决定：新增页默认带一个空 PC 块，全非必填后空块会被提交成一条空记录，故保存时过滤「无 id 且七个字段全空」的块；已有 id 的块即使清空也照常提交（不擅自变成删除）。后端是否接受空字段、是否另有必填校验未联调。
- 去掉 fileRequired / validateLater（上传后触发校验已无意义）。

## 2. 右上角显示当前系统

- 口径变化：11-03 用户曾要求「无角色只显示按钮、不显示系统名」（2e66dd1），本次明确要显示系统，改为系统、角色两个标签依次显示。
- IdentitySwitcher：系统标签（「系统 | 名称」，名称加粗）+ 原角色标签，样式统一为 `identity-switcher__chip`，单个 max-width 由 min(420px, 32vw) 收窄到 min(320px, 22vw)（两个并排）；悬停均为完整身份；≤768px 都隐藏。
- identityNeedsNames：有 systemId 缺 systemName 也查身份树补名（原来只有带角色才查）。登录时系统名取登录页所选系统，正常不会缺。
- 未覆盖：SSO 入口不经 authorize、没有 loginIdentity，仍只显示按钮；登录页不选系统且 context.systemName 为空时也不显示系统。

## 3. 合同模板详情 docx 预览

- 新依赖 `docx-preview@0.3.7`（2025-09，npm 最新 0.4.1 为 2026 新大版本未用；依赖 jszip）。仓库用 yarn workspaces、yarn.lock 不入库，需本地 `yarn` 安装后才能跑起来。
- 新组件 `components/DocxViewer`：fetch 文件（站内路径带 Bearer Token；返回 JSON 视为失败）→ 动态 import docx-preview renderAsync 渲染；body 固定高度 overflow:auto；页宽超容器时 wrapper 用 CSS zoom 缩小（最小 0.5，ResizeObserver 跟随）；.doc 等提示下载；下载用 file-saver 存同一份 blob。model.js 放纯函数（后缀判断、URL 白名单、zoom 计算）。
- 新页面：常量路由 `/file-preview`（hidden、无 Layout，走正常登录守卫；token 在 Cookie，新标签可用），query url / name，url 只接受站内 `/` 路径或 http(s)。window.open 带 noopener。
- 合同模板弹窗详情态：宽度 680 → 960px；「上传合同模板」表单项只在新增 / 编辑显示，详情改在 el-form 外渲染 DocxViewer（el-form disabled 会连带禁用内部 el-button），高度 min(560px, 60vh)。
- 风险：docx-preview 对复杂排版（文本框、域、部分表格样式）还原度有限；文件服务若跨域或不允许带 Authorization 头会预览失败（会显示失败提示，可下载——下载同样走 fetch，跨域时也会失败，届时需改回直链）。

## 验证

- 本机无 Node：测试、构建、浏览器均未运行。新增 tests/docx-viewer.test.mjs、tests/industry-config-optional.test.mjs，更新 tests/identity-display.test.mjs；新增断言里的正则已用 Python 对源码核对命中。
- docx-preview 0.3.7 的 renderAsync 签名与选项、`.docx-wrapper > section.docx` 结构已对照 unpkg 发布文件核对。
- diff --check、信息隔离自查通过。
