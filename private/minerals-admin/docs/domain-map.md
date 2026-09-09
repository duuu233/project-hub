# 业务域地图

> 最后核对：2026-08-03。目录地图反映源码，不等同于当前用户运行时可见菜单；实际菜单由后端权限返回。

## 1. 业务主链路

可将主要业务理解为以下生命周期：

```text
基础资料 / 企业 / 站点 / 商品
  -> 代理订单 / 进口采购
  -> 提单 / 船舶 / 提货
  -> 入库 / 库存 / 出库
  -> 销售提货 / 收货
  -> 计费 / 开票 / 台账
  -> 资产 / 融资 / 质押 / 贷后
  -> 应收 / 应付 / 结算
```

工作台、消息预警、权限系统和 AI 助手横跨整条链路。

## 2. 页面域

### 工作台与导航

| 目录 | 含义 | 关联 |
| --- | --- | --- |
| `views/workbench/` | 经营工作台、审批、船舶跟踪 | `api/workbench/`、ECharts、L7、Vue Flow/Dagre |
| `views/help-center/` | 帮助中心 | 后端菜单/帮助配置 |
| `views/information/` | 市场、海关和信息数据 | `api/information/` |

### 交易与采购

| 目录 | 含义 | 主要 API 域 |
| --- | --- | --- |
| `views/order/agency-order/` | 代理订单 | `api/trade/order.ts` |
| `views/import-manage/list/` | 进口采购管理 | `api/purchase/order.ts` 等 |
| `views/deomestic-purchasing/` | 国内采购静态原型，自包含列表/新增/编辑/详情及其类型、mock、组件 | 待接采购接口 |
| `views/domestic-sales/` | 国内销售列表/新增/编辑/详情，含商品选择、附件和状态流转 | `api/purchase/domestic-sale-order.ts` |
| `views/bill-lading/` | 提单与物流节点 | `api/purchase/bill-lading.ts` |
| `views/exporter/` | 出口商资料/业务 | 多领域接口 |
| `views/service-provider/` | 服务商 | `api/purchase/service-provider.ts` |
| `views/site/`、`views/site-goods/` | 站点和站点商品 | `api/system/site.ts`、`api/trade/site-goods.ts` |
| `views/goods-library/` | 商品库 | `api/system/goods*.ts` |

### 运输、仓储与库存

| 目录 | 含义 | 主要 API 域 |
| --- | --- | --- |
| `views/car/` | 车辆 | `api/transport/car.ts` |
| `views/carrier/` | 承运商 | `api/transport/carrier.ts` |
| `views/pick-up-goods/` | 提货、码头库存 | `api/transport/pick-up-goods.ts` |
| `views/enter-warehouse/` | 入库计划、入库单 | `api/warehouse/warehouse.ts` |
| `views/out-warehouse/` | 出库计划、出库单 | `api/warehouse/warehouse.ts` |
| `views/warehouse/` | 仓库资料 | `api/warehouse/warehouse.ts` |
| `views/store/` | 库存相关资料/管理 | 业务 API |
| `views/stock/` | 库存查询、流水、预警 | 多领域接口 |
| `views/sales-pickup/` | 销售提货 | 交易/运输接口 |
| `views/sales-receipt/` | 销售收货 | 交易/仓储接口 |

堆场提货新增页 `views/sales-pickup/list/yard-add.vue` 先选择进口采购订单，再选择客户。采购订单列表保留 `customerId/customerName` 用于回填；任一字段缺失或为空（含纯空格）时按自营模式展示，客户清空、禁用且不做必填校验。非自营模式允许手动更换客户，提交使用最终选中的客户信息。堆场货物弹框每次打开时请求列表，必须先选择进口采购订单；库存列表查询和新增保存均传所选订单返回的 `purchaseNo`。切换采购订单时清空已选货物、关闭弹框，并丢弃旧请求响应，避免跨订单混入货物。堆场新增、补充和详情的货物信息表不展示成分列。三个页面的货物信息表「批次号」列统一取 `goodsList` 元素的 `stockBatchNo`：库存接口 `stockInfoList` 返回的是 `batchNo`，新增与补充页在写入 `form.goodsList` 时已映射为 `stockBatchNo`，提货单详情接口返回的 `goodsList` 本身只带 `stockBatchNo`，因此列绑定和补充页 `objectSpanMethod` 的合并列都用 `stockBatchNo`，不要再读 `batchNo`。

### 计费、结算与台账

| 目录 | 含义 | 主要 API 域 |
| --- | --- | --- |
| `views/billing/` | 计费协议、计费项 | `api/billing/` |
| `views/invoicing/` | 开票/未开票 | `api/trade/invoicing.ts` |
| `views/ledger/` | 台账 | `api/ledger/ledger.ts` |
| `views/cope-*` | 应付类流程 | billing/finance/业务接口 |
| `views/receivable-*`、`views/receivable-list/` | 应收类流程 | billing/finance/业务接口 |

`cope-*` 与 `receivable-*` 内存在大量相似的银行信息、采购选择、仓储阶段和账户信息组件。修改相似逻辑前应先用 CodeGraph 查是否已有共享实现，避免继续复制。

国内采购当前仍是基于 `src/assets/181/` demo 的静态原型。国内销售已通过 `api/purchase/domestic-sale-order.ts` 接入 `/purchase-service/domesticSaleOrder` 的 7 个接口，列表和商品选择使用服务端分页，编辑/详情以订单 `id` 加载，保存/提交通过 `btnType=1/2` 区分，附件先经全局 `FileUpload` 上传。两个国内贸易模块仍严格独立。

### 资产与融资

| 目录 | 含义 | 主要 API 域 |
| --- | --- | --- |
| `views/assets/` | 资产 | `api/finance/assets.ts` |
| `views/financial-project/` | 金融项目 | `api/finance/financing.ts` 等 |
| `views/financing/` | 融资申请与详情 | `api/finance/financing.ts` |
| `views/pledge/` | 质押、解押 | `api/finance/pledge.ts` |
| `views/credit/` | 授信/集中器等 | finance/system 接口 |
| `views/post-loan/` | 贷后 | `api/finance/loanAfter.ts` |
| `src/common/post-loan/` | 可复用贷后业务片段 | 贷后页面 |

### 系统管理与运维

| 目录 | 含义 | 主要 API 域 |
| --- | --- | --- |
| `views/system/` | 用户、角色、部门、菜单、字典、组织、系统等 | `api/system/` |
| `views/monitor/` | 在线用户、定时任务和日志 | `api/monitor/` |
| `views/tool/` | 表单构建、代码生成 | `api/tool/` |
| `views/error/` | 401、404 | Router/权限流程 |
| `views/redirect/` | TagsView 刷新重定向 | Router/TagsView |

## 3. API 域

`src/api/` 当前按后端业务域组织：

| API 目录 | 主要职责 |
| --- | --- |
| `ai/` | AI 对话/解析 |
| `billing/` | 账户、计费、收付款 |
| `finance/` | 资产、融资、质押、贷后、仓储金融 |
| `information/` | 市场、海关、资讯 |
| `ledger/` | 台账 |
| `monitor/` | 在线、任务、日志 |
| `purchase/` | 采购、提单、服务商 |
| `system/` | 用户、角色、菜单、组织、字典、基础资料 |
| `tool/` | 代码生成 |
| `trade/` | 订单、交付、开票、站点商品 |
| `transport/` | 车辆、承运、提货 |
| `warehouse/` | 仓库与出入库 |
| `workbench/` | 仪表盘、审批、船舶 |

根部 `login.ts` 负责认证与上下文切换；`menu.ts` 负责获取运行时路由；`common.ts` 保存跨域通用请求。

目录名不能完全代表后端微服务前缀。新增接口前先查看同类 API 文件实际 URL。

## 4. 公共组件族

### 平台级

- `Pagination`
- `RightToolbar`
- `TableSearch`
- `DictTag`
- `TreeSelect`
- `FileUpload` / `ImageUpload` / `ImagePreview`
- `Editor`
- `SvgIcon`
- `BottomFixedBtnsBox`

这些组件使用方多，修改 props、事件、v-model 或默认值前必须做 blast radius 分析。

### 业务详情聚合

`components/Details/` 聚合代理订单、提单、采购合同、融资、质押、解押、还款、资金流水等详情片段。它与多个业务域共享数据结构，修改字段映射时要核对所有调用方。

### AI

- `GlobalAiChat`
- `AiChatDialog`
- `AiResultCompare`

AI 组件通过 `utils/aiChatState.ts` 与当前页面处理器连接，并可能跨路由保留待消费 payload。

### 地图和流程

- 船舶跟踪位于 `views/workbench/vessel-tracking/`。
- 提单轨迹位于 `views/bill-lading/.../components/Track/`。
- 布局算法使用 Dagre/Vue Flow 或模块内部 `useLayout.ts`。

调整节点尺寸、端口、边或布局常量时，应同时检查容器尺寸、缩放和详情弹窗交互。

## 5. Pinia 状态边界

| Store | 跨域影响 |
| --- | --- |
| `user` | 全应用认证和权限 |
| `permission` | 全应用菜单和路由 |
| `tagsView` | 页面缓存、刷新和 iframe |
| `app` / `settings` | 全局 UI |
| `dict` | 大量表单和表格显示 |
| `copy` | 业务复制流程 |
| `importList` | 进口采购相关页面 |
| `vesselTracking` | 船舶跟踪 |
| `excludeRouters` | KeepAlive/页面缓存辅助 |

在业务 Store 新增状态前判断：

- 是否需要跨页面或跨 TagsView 生命周期保存。
- 切换身份或退出时是否必须清理。
- 页面关闭、刷新、复制操作是否会遗留旧数据。

## 6. 典型变更的相邻检查

| 修改位置 | 同时检查 |
| --- | --- |
| 订单/采购字段 | add/edit/detail、handleDetail、列表、详情聚合、API 类型、AI 回填 |
| 文件字段 | 上传组件、详情回显、下载、AI 附件、服务端字段名 |
| 字典值 | `useDict` 调用、`DictTag`、表单选项、后端枚举 |
| 路由路径/name | 后端菜单、页面 name、TagsView、AI route action、activeMenu |
| 站点/商品逻辑 | 订单、采购、商品匹配、AI site resolver |
| 仓储阶段 | cope/receivable、贷后、库存、资产详情 |
| 金额/重量 | 单位、精度、千分位、汇率、合计、后端字符串/数字类型 |
