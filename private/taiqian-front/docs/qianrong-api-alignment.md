# qianrong 新接口对照与续接清单

> 2026-10-20登录专项已替换旧Web入口和无调用的辅助包装，现用编号1–5接口；当前实现以[Web登录契约](qianrong-web-login.md)为准。下文登录表格是历史核对，不代表本轮继续调用旧端点。

> **2026-10-15更新**：用户已暂停本轮新原型对接。最新Swagger为268路径/213定义，已包含菜单isList与“菜单列字段配置”7接口；用户确认菜单及权限从用户组迁移到系统管理、接口已支持。下文216路径和“接口不存在/迁移等待”的说明属于历史核查，不能作为当前结论。当前后端就绪范围、旧原型替代与实施任务统一见[本轮可续接清单](qianrong-v08-integration-tasks.md)。

> 状态：2026-10-14 home 用户恢复；已实施确认的地址/方法修正和13模块静态预览，尚未真实业务联调。
> 本轮业务分支 / 起始版本：master / 79878c2；2026-10-13暂停基线为7d3dd63。
> 当前静态范围和验证见 [静态模块说明](qianrong-static-modules.md)，下文保留前一天的接口对照事实与暂停历史。

## 目标与身份

用户要求确认 dh 负责的模块，对照新接口文档，并将 qianrong 请求切换至新服务。dh 是业务提交作者；当前四次样式/代理提交 7e1a00a、dbe5853、97f1e31、7d3dd63 的作者均为 dh。

子应用仍为 `apps/qianrong`，根仓库是 taiqian-front；不另建项目、不切分支，不扩展到 qianlian 或共享包。沿用现有 JavaScript/Vue、登录权限机制和页面交互。

已确认负责 13 个模块：S01、S02、S03、S04、S05、S06、S07、S08、S09、S10、S12、S13、S14，详见 [负责模块](qianrong-owned-modules.md)。

## 文档来源与当前请求配置

- 用户提供的 [Swagger UI](https://dev-qianrong.ftechain.com/api-qianrong/doc.html#/home) 和 [Swagger JSON](https://dev-qianrong.ftechain.com/api-qianrong/v2/api-docs)。
- 2026-10-13 本机读取 JSON 返回 200：Swagger 2.0，标题「泰乾-乾融后台管理系统_接口文档」，host 为 `dev-qianrong.ftechain.com`，basePath 为空，共 216 个路径；每条路径自身已含 `/api-qianrong`。
- 当前开发服务为 `https://dev-qianrong.ftechain.com/api-qianrong`。2026-10-14已从旧德邦测试目标切换；重新只读读取JSON仍为216路径。
- `apps/qianrong/vite.config.js`：`resUrl` 为代理目标，`server.proxy['/api-qianrong']` 配置 changeOrigin；rewrite 移除请求中一个 `/api-qianrong` 前缀后交给目标路径。
- `apps/qianrong/src/utils/request.js`：Axios `baseURL: ''`，多数包装接口 URL 自带 `/api-qianrong`；GET 查询、Token 和统一响应处理仍在此文件。
- 开发环境 `VITE_APP_BASE_API` 为空；production/staging 分别为 `/prod-api`、`/stage-api`，部分组件直接使用它。不能把目标的完整 `/api-qianrong` 再追加到已有 URL，避免重复前缀。
- 已实施：代理目标改为新服务完整地址，保留rewrite和查询字符串，应用README已同步。实际转发在本地捕获服务验证，未调用真实业务目标。

## 模块与契约核对

| 模块 | 现有 API 入口 | 新文档观察 |
| --- | --- | --- |
| S01 菜单 | `src/api/system/menu.js` | menu 列表、详情、树、增改删及 roleMenuTreeselect 仍有对应路径；菜单 DTO 声明 refApiPerms，必填 menuName/menuType/orderNum |
| S02 系统 | `src/api/system/system.js` | add/del/update/page/detail 路径匹配；systemList 的 POST 与文档 GET 不一致 |
| S03 用户组 | `src/api/system/user-group.js` | 8 个包装路径/方法均匹配；DTO 仍包含 groupsSystemMenuDTOList |
| S04 企业 | `src/api/system/enterprise-users.js` | 企业列表、增改删、启停和详情对应；两项旧辅助请求未列出 |
| S05 角色 | `src/api/system/role.js` | 13 个包装路径/方法匹配；角色表单 roleSystems 与文档 SysRole 字段存在兼容疑点，见下文 |
| S06 账号 | `src/api/system/user.js` | 用户基本操作、分配角色、资料/密码/头像、部门树有对应；orgDeptTree 和 authInfo 两项包装未列出；页面导入/导出地址另需修正 |
| S07 部门 | `src/api/system/dept.js` | 6 个包装路径/方法匹配 |
| S08 字典 | `src/api/system/dict/type.js`、`data.js` | 共 13 个包装路径/方法匹配；getDicts 的同步 XHR 也走 `/api-qianrong` |
| S09 操作日志 | `src/api/system/operlog.js` | 3 个包装路径/方法匹配；页面导出应走 monitor/operlog/export |
| S10 登录日志 | `src/api/system/logininfor.js` | 4 个包装路径/方法匹配；页面导出应走 monitor/logininfor/export |
| S12 接口日志 | 已有静态页面，无独立API | 新JSON仍无独立接口日志tag或查询/详情/导出路径；先以records示例预览，不虚构接口或正式菜单 |
| S13 登录 | `src/api/login.js`、`src/api/menu.js` | login/getInfo/getRouters/loginOrgList/loginRoleList 等存在；部分旧辅助与认证入口未列出，不等于服务实际不存在 |
| S14 个人信息 | `src/api/system/user.js` 的 profile、updatePwd、avatar | 路径/方法匹配；updatePwd 仍用查询参数，avatar multipart 字段为 avatarfile |

对照上述 13 个 API 文件的 105 个导出包装：86 个路径/方法匹配，1 个明确方法不符，18 个未列入本次 Swagger。包装文件还含其它业务辅助函数，这个数字不是「13 模块已联调成功」或「缺失后端接口数」。getRouters 是箭头导出，已单独核对。

分页 `TableDataInfo` 定义含 code/msg/rows/total，现有分页解析有契约依据；多个详情响应只声明通用 Map/R，不能据此推定真实回填字段已兼容。没有真实登录、列表或写入请求验证。

## 已确认并实施的请求修正（2026-10-14）

以下为2026-10-13确认的续接计划，2026-10-14已按最新JSON完成这9项配置/请求修正，参数与认证流程保持现状：

1. 代理目标和应用 README 切换至新 qianrong 服务。
2. `src/api/system/system.js::systemList`：保持 `/api-qianrong/system/list`，POST + data 改为文档 GET + params；systemPage 的 GET 分页接口无需改成此接口。
3. 页面直接下载地址应完整进入 `/api-qianrong` 代理，登录/操作日志还需改路径域：

| 页面 / 功能 | 当前字面量 | 文档对应请求 |
| --- | --- | --- |
| `views/monitor/operlog/index.vue` 导出 | `system/operlog/export` | POST `/api-qianrong/monitor/operlog/export` |
| `views/monitor/logininfor/index.vue` 导出 | `system/logininfor/export` | POST `/api-qianrong/monitor/logininfor/export` |
| `views/system/role/index.vue` 导出 | `system/role/export` | POST `/api-qianrong/system/role/export` |
| `views/system/dict/index.vue` 导出 | `system/dict/type/export` | POST `/api-qianrong/system/dict/type/export` |
| `views/system/dict/data.vue` 导出 | `system/dict/data/export` | POST `/api-qianrong/system/dict/data/export` |
| `views/system/user/index.vue` 导出 | `system/user/export` | POST `/api-qianrong/system/user/export` |
| 同页导入模板下载 | `system/user/importTemplate` | POST `/api-qianrong/system/user/importTemplate` |
| 同页批量导入 | `VITE_APP_BASE_API + '/system-service/user/importData'` | POST `/api-qianrong/system/user/importData`，multipart file + updateSupport |

4. 保留现有请求参数、权限、Token、下载和上传流程；仅纠正已证实的地址/方法，不凭旧 PRD 重写权限关系。

## 新文档未列出的旧包装

未执行这些真实请求，不能将「文档未列出」当成「服务不存在」。先保留并查调用/后端契约，不能随便映射到名称相似的接口：

| 文件 | 函数 / 现有路径 |
| --- | --- |
| `system/menu.js` | regulatoryAuthoritiesSelectList：GET `/regulatoryAuthorities/selectList`；capitalOrgAllList：POST `/fund-info/list`；projectAllList：POST `/project/all` |
| `system/enterprise-users.js` | beAccessList：GET `/refineryAccess/beAccessList`；enterpriseUserListBySelectOrg：POST `/org/selectOrgList` |
| `system/user.js` | deptTreeSelectByOrg：GET `/system/user/orgDeptTree`；authInfoPage：POST `/authInfo/page`；authInfoDetail：GET `/authInfo/detail/{id}` |
| `login.js` | register：POST `/index/register`；refreshToken：POST `/refresh`；logout：DELETE `/logout`；getCodeImg：GET `/code` |
| `login.js` | sysOrgList：GET `/index/getSysOrgList`；userGroupsList：GET `/index/getUserGroupsList`；systemList：GET `/index/getSystemList`；deptList：GET `/index/getDeptList`；roleList：POST `/index/getRoleList`；getLoginUserInfo：POST `/index/getLoginUserInfo` |

表中省略公共前缀 `/api-qianrong`。一些认证端点可能不进入 Swagger，需先查实际实现与调用，不改现有登录模式。

其它待确认：

- 用户组/企业页面的旧导出处理都指向 `system/role/export`，新文档没有相应用户组/企业导出端点；不能简单加前缀就宣称导出正确。
- 系统 DTO 已包含 menuIds，但用户组 DTO 仍保留 groupsSystemMenuDTOList。原「菜单权限迁移等待后端」安排未被用户撤销；需要明确系统树、详情、保存和兼容规则后再迁移，不能仅因 DTO 有字段就搬 UI。
- 角色表单使用 roleSystems，Swagger SysRole 声明 menuIds/userGroupId/orgId 等而没有 roleSystems；现有查看页直接读 res.data.roleSystems。需要后端真实响应/保存样例确认，不能宣称授权已兼容。

## 2026-10-13暂停现场与当时恢复步骤（历史）

- 2026-10-13 用户明确「先暂停，将已知上下文记录到文档，提交当前项目，晚上再启动开发」。立即停止业务修改、构建和进一步接口试调，仅提交维护记录。
- 本轮 Hub main / e66bde8 与业务 master / 7d3dd63 均已显式 pull 同名远端成功；业务无源码差异。
- 用户仅授权暂存根 `pnpm-lock.yaml`，pull 后原样恢复，不提交。该文件仍未跟踪，SHA256：`3262B8195B52FF403DE8B760AA53DD1433F9A9426A6119AEB205C6D5B7A06756`。
- Git stash -u 恢复时触发 LF→CRLF，哈希检查已拦截；从本次 stash 的未跟踪文件 blob 还原原字节并核对成功，再移除本轮 stash。没有留下未恢复的用户文件。
- CodeGraph sync 已为最新。隔离 VM 对照只替换 request/XHR 为捕获桩，没有真实 API 请求；JSON 下载是文档读取。未运行 build、浏览器联调或部署。
- 文档 JSON 与审计脚本/输出目前仅在本机忽略的临时目录，不作为跨环境前提；上述确认事实已写入受控文档，恢复时重新下载最新 JSON。

恢复开发时：确认当晚实际环境与当前分支，先读本文件和项目规则，再按规定保护用户文件、pull 两仓库当前同名分支并同步 CodeGraph；重新读取最新契约，实施已证实的代理/路径/方法修正。对未列出端点与权限 DTO 先核对后端，保留待确认边界。运行受影响应用构建和无真实业务请求的代理、URL、参数/回填隔离检查，更新记录后提交、再 pull/push。未经额外授权不发真实业务 POST、不部署。
