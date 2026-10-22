# 仓储统计字段对接

接口与实现核对日期：2026-10-16。当轮对应 `feature-v1.8.5` 本地未提交实现，用户要求先本地测试，不提交、不推送；当轮 HEAD `09e4d1d2` 是任务开始前已有的本地提交，领先远端 `c9d01577` 一项，当时未重置、合并或推送。

2026-10-19 同步复核：业务当前 `feature-v1.8.5` / `5946aab8`，工作区干净，同名 pull/push 后与真实远端一致；已用 CodeGraph 核对当前共享统计字段定义、格式化及组件输入仍在。本轮只同步与审查文档，按用户新授权提交原维护记录，不新增业务提交，也不代表用户已完成本地验收。下述接口缺项和未真实联调限制继续保留。

2026-10-22 详情补充：四类详情的信息卡片已按原有详情字段统一接入，字段和Figma链接见 [仓储详情说明](warehouse-figma-ui.md#当前详情卡片接口接入-2026年10月22日)。下文“未明确新增独立统计结构”指不得猜测新聚合字段，不表示旧详情字段不可用于卡片；列表的统计缺项及历史验收边界仍保留。

## 来源与范围

2026-10-22 当前需求调整（feature-v1.8.5）：库存存放预警顶部移除“已超期批数”整张卡，不再显示其 `--` 占位和“接口暂未提供”。剩余预警总批数、临期预警批数、预警总重量三项原字段及格式不变；列表行里的超期/剩余天数、筛选、分页与请求不变。

接口入口：[开发环境接口文档](https://dev-m.zhengkuangsc.com/doc.html#/home)。实际核对同站点 `/warehouse-service/v3/api-docs`，统计都在现有列表响应根对象，和 `rows / total / code / msg` 同级，不在 `data`，不新增统计请求。

对应 dh 的 2.10/2.11 入库计划列表、2.12 入库列表、2.14 出库计划列表、2.16 出库列表及 2.18 库存查询/日志/存放预警。2.13 入库详情、2.15 出库计划详情、2.17 出库详情一并核对，未发现文档明确新增的独立统计结构，因此保留现有真实详情字段与货物汇总，不往详情拼接列表级企业总数，也不更改保存参数。

## 顶层字段映射

所有路径均以 `/warehouse-service` 开头，GET，原查询、分页和日期参数不变。

| 列表接口 | 响应结构 | 统计字段 → 展示 |
| --- | --- | --- |
| `/stockInPlan/list` | `StockInPlanCountVO` | `stockInPlanCount` 总数；`pendingAuditCount` 待审核（已创建）；`pendingStockInCount` 待入库；`completedStockInCount` 已入库 |
| `/stockIn/list` | `StockInCountVO` | `stockInCount` 总数；`completedStockInCount` 已入库；`currentMonthStockInWeight` 本月入库总重量 |
| `/stockOutPlan/list` | `StockOutPlanCountDTO` | `currentMonthStockOutPlanCount` 本月计划总数；`pendingStockOutPlanCount` 待出库；`partialStockOutPlanCount` 部分出库；`completedStockOutPlanCount` 已完全出库；`currentMonthStockOutPlanWeight` 本月计划出库总重量 |
| `/stockOut/list` | `StockOutCountDTO` | `stockOutCount` 总数；`completedStockOutCount` 已出库；`currentMonthStockOutWeight` 本月出库总重量 |
| `/stockInfo/list` | `StockInfoCountDTO` | `stockInfoCount` 在库批次；`availableWeight` 可用重量；`beDeliveredWeight` 冻结重量 |
| `/stockInfoLog/list` | `StockInfoLogCountDTO` | `batchNoCount` 库存总批次数；`currentMonthStockInCount` 本月累计入库；`currentMonthStockInWeight` 本月累计入库重量；`currentMonthStockOutCount` 本月累计出库；`currentMonthStockOutWeight` 本月累计出库重量 |
| `/stockInfo/earlylist` | `EarlyStockInfoCountDTO` | `earlyStockInfoCount` 预警总批数；`willEarlyStockInfoCount` 临期预警批数；`earlyStockInfoWeight` 预警总重量 |

注意冻结字段是 **`beDeliveredWeight`**，不是 `beDeliveredCount`；库存日志首卡是库存批次数，不是变动次数。日志其余统计明确限定本月，标题同步体现时间范围。入库计划补出文档中新增的“待审核”卡，复用原有图标，原图标、配色、布局规则不改。

## 展示和请求规则

- `WarehouseMetrics` 新增 `statistics` 输入，保留 `metrics` 显式卡片覆盖。七页只把同一次原列表返回的顶层统计传入，不取分页 `total` 充当总数，不以 `rows`、本页筛选或明细求和冒充全量统计。
- 有限数值或数字字符串可展示。0/`"0"` 是有效值；缺字段、null、空白字符串、非数值、无穷值显示 `--`，不当作零。数量按整数千分位，重量沿用现有设计的吨、四位小数，不自行转换或推断混合单位。
- 不再显示写死的 128/27 等样例、“本月新增”“较昨日”“较上月”及百分比；文档没提供趋势，不能生成趋势。
- 每次请求清空统计为占位，只有最新请求可以写入列表、分页和统计并结束 loading，防止旧查询成功/失败覆盖新结果。最新请求失败清空统计、行和分页总数，结束 loading；错误提示仍由统一请求层处理。
- 原服务路径、GET 参数、日期转换、当前页 `ui*` 筛选边界、分页、权限、详情/编辑/新增/关闭等业务不改。统计采用后端返回口径，不承诺本页筛选会重算企业总数。

## 文档缺项与限制

- 原设计“已超期批数”没有独立统计字段。10-16 另查其它公开服务也未找到可替代字段，当时保留占位；10-22 按新需求移除整张统计卡，不拿预警总数减临期数推算，也不统计当前页替代全量数。今后新增统计须有明确接口字段和产品需求。
- `willEarlyStockInfoCount` 标题写 ≤3天，描述写 `0 < 剩余天数 < 3`，边界不一致。本轮沿用设计标题和后端计数，不前端另算，3天边界需后端确认。
- `stockOutCount / completedStockOutCount` 的描述误用了“入库”，按出库接口及字段名映射出库卡片，不复用入库数字。
- 详情 `/stockOutPlan/get` 返回 `StockOutPlanCreateDTO`、`/stockOut/get` 返回 `StockOutDetailDTO`，计划 `totalWeight` 和货物重量已由原页面使用。`/stockIn/detail/{id}` 只声明通用 Result，未提供可据以新增的详情统计契约；不猜字段。新增详情专用统计需补充响应文档/实例。

## 验证与本地验收

- 隔离脚本 59 项通过：七页全部字段与当日 OpenAPI 逐项核对、零/空/非法值、数值格式、根字段与行/分页隔离、请求参数与修改前逐项对比、同响应刷新、竞态成功/失败、失败清空以及 Vue 脚本/模板编译。
- `npm run type-check` 修改前后均为 24 项既有错误，错误条目逐条一致；不能声称全量类型检查通过。构建结果与本轮完整验证见同日实施日志。
- 未用真实企业会话请求业务列表，未新增/关闭/出入库或改真实数据，未部署。需用户本地登录验证接口实际返回值及文档的吨单位、临期3天边界。
- 本地验收依次打开七个列表，看网络响应顶层字段与卡片一致；翻页/查询后看最新响应，快速切换查询无回跳，模拟失败不残留旧统计；再回看三类详情和原业务操作是否保持。后端缺字段应为 `--`，真实零应为 0 或 0.0000 吨。
