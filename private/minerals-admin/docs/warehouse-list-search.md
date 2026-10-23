# 仓储列表聚合关键词查询

核验日期：2026-10-23，`feature-v1.8.5`。范围为 dh 负责的入库计划、入库单、出库计划、出库单、库存查询、库存日志、库存存放预警七个列表。

## 接口事实与界面取舍

从[开发接口文档](https://dev-m.zhengkuangsc.com/doc.html#/home)对应的 `/warehouse-service/v3/api-docs` 读取七条 GET 列表声明。它们引用的五种查询 DTO 均包含 `keyword: string`。此前前端 `uiKeyword` 只过滤本页、请求时被剥离，现已替换为真正传给列表接口的 keyword。

部分 DTO 仍保留单字段参数，因此不能把“合并输入框”理解为后端已删除所有单字段查询。按本轮用户要求，界面移除编号、客户、提单、货物等独立文本搜索和旧预警仓库/堆场本页筛选，只保留统一关键词；不自动将一个关键词拆填到多个字段，也不把服务端结果再按当前页字符串匹配裁剪。OpenAPI 未说明 keyword 的具体匹配字段和逻辑，界面只提示“请输入关键词”，实际命中范围由服务端实现与联调确认。

## 当前界面参数

所有路径带 `/warehouse-service` 前缀，分页继续传原 pageNum/pageSize。

| 列表 | GET 路径 | 关键词以外保留的筛选参数 |
| --- | --- | --- |
| 入库计划 | `/stockInPlan/list` | status、创建时间 createStart/createEnd |
| 入库单 | `/stockIn/list` | status、创建时间 startDate/endDate |
| 出库计划 | `/stockOutPlan/list` | status、financeFlag、创建时间 createTimeStart/createTimeEnd |
| 出库单 | `/stockOut/list` | status、financeFlag、创建时间 createTimeStart/createTimeEnd |
| 库存查询 | `/stockInfo/list` | purchaseType、financeFlag、goodsReleaseStatus |
| 库存日志 | `/stockInfoLog/list` | operationType，按声明提供 0入库/1出库计划/2出库 |
| 库存存放预警 | `/stockInfo/earlylist` | 无，界面仅提供 keyword |

入库两接口未声明 financeFlag 查询字段，所以不再显示其旧本页融资筛选；表格中原融资状态列不变。库存 DTO 仍声明 warehouseName/yard，但本轮不再提供由当前页取值生成的局部下拉框，不据此宣称 keyword 必然覆盖仓库/堆场。

## 实现与状态

- `src/components/WarehouseUi/list-filters.ts` 按列表类型生成条件和参数白名单，只发送本页声明的筛选键，keyword 去首尾空白；0和字符串0保留，不变异页面 query。
- 七页直接显示同一次服务端列表响应的 rows、total 和统计，不再使用 ui* 筛选、不展示“本页筛选”条数。已删除旧文本条件、库存页遗留 storeId/orderNo/customerOrgName 和无用候选加载。
- 搜索、重置、清除单个条件回到第一页；翻页沿用当前关键词和筛选。日期继续按各接口原字段映射完整日开始/结束，不发送 timer 界面数组。
- 保留原请求序号保护：只接受最新结果，失败清空列表/分页/统计并结束 loading；不新增统计请求，不改详情、新增、关闭或出入库操作。
- 入库计划顶部按用户要求移除“待入库”整卡，保留总数、待审核、已入库三项；后端 pendingStockInCount 字段仍存在，但界面不展示。其它六类统计定义不变。

验证和真实联调边界见[当次记录](../logs/2026-10-23-warehouse-keyword-and-inbound-metrics.md)。
