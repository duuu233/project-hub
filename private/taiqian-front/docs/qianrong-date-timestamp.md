# qianrong 负责模块日期传参：统一时间戳

2026-10-28 ssh dev/ffeb87b。用户要求：dh（git 作者 dh / duu233）负责的模块，所有表单提交给接口的日期一律传毫秒时间戳，不传日期字符串。

## 菜单结构调整后的模块位置

同事 4257369（kimi 自动同步，2026-10-28 合入 dev）把 `views/system/*`、`views/monitor/*` 拆到两个新目录，内容基本是原样搬迁（R090–R100）：

| 模块 | 现路径（apps/qianrong/src/views/） |
| --- | --- |
| S01 菜单管理 | config-audit/menu |
| S02 系统管理 | config-audit/all-system |
| S03 用户组管理 | config-audit/user-group |
| S04 企业用户管理 | organization/enterprise-users |
| S05 角色管理 | organization/role |
| S06 用户账号管理 | organization/user |
| S07 部门管理 | organization/dept |
| S08 字典管理 | config-audit/dict |
| S09 操作日志 | config-audit/operlog |
| S10 登录日志 | config-audit/logininfor |
| S12 接口日志 | config-audit/api-log（共用 config-audit/log-shared，原 monitor/components） |
| S13 登录 | login.vue |
| S14 个人信息 | organization/user/profile |

旧的 business/、credit/、tenant/ 等 dh 曾改过样式的目录已不在源码中，不在本次范围。

## 改法

新增 `utils/timestamp.js`（不改同事的 `dateText.js` 与公共 `addDateRange`、`SearchField`）：
- `toTimestamp`：空值原样、数字原样、纯数字串转数字、其余 dayjs 可解析的转 `valueOf()`，解析不了的不动。
- `timestampFields(payload)`：把键名以 Time / Date 结尾的字段转时间戳，用于整份详情回传的表单。
- `toTimestampRange`：查询时间范围逐个转。

| 位置 | 原来传 | 现在 |
| --- | --- | --- |
| 企业用户 成立日期 establishmentDate | 选择器 value-format `YYYY-MM-DDTHH:mm:ssZ` 字符串 | 选择器 `value-format="x"`，详情回填先 toTimestamp，提交再走 timestampFields |
| 菜单 新增/编辑 | `{...详情}` 原样回传 createTime / updateTime 等字符串 | 提交前 timestampFields |
| 用户账号 新增/编辑 | cloneDeep(详情)，已删 createTime/updateTime，其余如 loginDate、pwdUpdateDate 原样 | 提交前 timestampFields |
| 操作日志 / 登录日志 查询与导出 | params.beginTime / endTime 为 `YYYY-MM-DD HH:mm:ss` | 时间戳（syncSearch 时转） |
| 接口日志 查询 | 同上（thirdApiQuery） | 时间戳 |

系统、用户组、角色、部门、字典、列字段、数据权限、个人资料、改密的提交体都是显式挑字段，不含日期，未改。企业/字典/用户组列表的 addDateRange 没有日期范围输入，未改。

## 边界

- 日志查询属于搜索表单，按“所有表单提交”一并改了；若后端日志查询仍要字符串，回退 logininfor/operlog 的 syncSearch 与 log-model.js 的 thirdApiQuery 即可。
- 本机无 node，未构建、未浏览器、未联调。
