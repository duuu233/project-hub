# qianrong 额度账本对接接口

2026-11-20 ssh dev/6de9a29（用户明确：先把 test 同步到 dev，再对接额度账本）。页面：`views/supply-chain/credit-ledger/`（路由 `/quota-ledger/credit-ledger`），原 2026-11-11 静态页面见 [新增模块静态页](qianrong-new-modules-static.md)。

## 同步 dev

- test 原有 6 个提交（fc6570b…60c062f）未进 dev；按同事惯例 `Merge branch 'test' into dev`，dev/a98015a。
- 冲突 3 处：index.html 与 dynamicTitle.js（dev 上同事已改为「泰乾数字金融管理系统」/「乾融 - 页面名」），按用户最新要求取 test 的「乾融系统」固定页签；listGrid.js 两边合并（dev 的 `columnRules` + test 的 `fitHeight`）。login.vue 的 `useDynamicTitle('登录')` 参数被忽略，页签仍为系统名。

## 接口（业务管理 / 额度总览，dev swagger 2026-11-20 只读）

| 用途 | 接口 | 参数 | 返回 |
| --- | --- | --- | --- |
| 额度总览统计 | GET /quota/count | 无 | quotaTotal 授信总额度；projectCountList：projectCode / projectName / bankNumber / bankQuotaTotal / financeTypeNumber / productNumber / assetValue / assetQuantity / assetUnit / quotaFrozen / quotaUsed / quotaAvailable |
| 资金维度视图 | GET /quota/queryFundDimView | projectCode（必填） | 银行列表：bankOrgId / bankName / bankQuota / assetValue / quotaFrozen / quotaUsed / quotaAvailable / startDate / endDate / usageRate(%) / productQuotaList（productName / productQuota / quotaFrozen / quotaUsed / quotaAvailable / assetValue） |
| 企业维度视图 | GET /quota/queryEnterpriseDimView | projectCode、financeOrgName（模糊）、financeOrgId、bankOrgId、pageNum、pageSize（默认 5） | 企业 + 银行卡片：financeOrgId / financeOrgName / bankOrgId / bankName / quotaTotal / quotaUsed / quotaFrozen / quotaAvailable / startDate / endDate / rows（第一页明细）/ total |
| 企业维度视图分页 | GET /quota/queryEnterpriseQuotaRecordPage | 同上 | 明细：financeSerialNo / financeProductName / financeMaterStatus（字典 mater_status）/ recordTime / quotaChangeType（字典 quota_change_type）/ quotaChangeAmount / quotaAvailableAfter |

所有金额单位为元。

## 页面改法

- `api/quota/index.js` 新增四个接口；`static-data.js` 改为 `model.js`（接口字段整理、元→万、日期兼容字符串 / 时间戳、分页响应兼容），静态数据删除。
- 顶部：进页调 count；胶囊 = 产业项目名-bankNumber家银行，默认选第一个；总授信 = quotaTotal（接口顶层，不随胶囊变）；6 张统计卡取所选项目；资产标的说明 = assetQuantity + assetUnit。失败时胶囊位置提示 + 重试。
- 资金维度：按所选项目调 queryFundDimView；银行卡片去掉「批复版本」标签（接口无此字段）；logo 取银行名首字；产品明细表头补「(万)」。
- 企业维度：按所选项目 + 企业名称（服务端模糊）调 queryEnterpriseDimView，pageNum 1 / pageSize 5 取每张卡片第一页明细；翻页、改每页条数按卡片调 queryEnterpriseQuotaRecordPage（financeOrgId + bankOrgId + projectCode）；默认展开第一张；明细加载失败卡片内错误条 + 重试。融资状态、额度动作类型按字典显示名称，时间 / 金额标签按状态名称（融资处理中 / 待放款 / 融资已取消 / 待还款 / 已结清）切换，其余显示「记录时间 / 调整额度」。
- 每次请求带序号，切项目或连续搜索时旧响应不覆盖新结果。
- 测试：新增 `tests/credit-ledger-model.test.mjs`。

## 自行决定（可改）

- 单位：额度类指标（总授信、统计卡、银行指标、产品明细、企业卡片额度）按原型以万展示（元 ÷ 10000，两位小数），原型里没写「(万)」的已用 / 可用 / 资产标的价值也统一补上；使用明细金额保持元（与原型示例 527,432.80 一致）。
- 用信率按卡片展示数值计算（冻结 + 已用）/ bankQuota，银行额度缺失才用接口 usageRate（按百分数 ÷ 100）。
- 分页接口 swagger 声明 `R<List>`（无 total），页面兼容 `rows / total`；只有数组时 total 沿用企业卡片的 total。
- 导出没有接口，按钮保留，点击提示「导出接口尚未提供」。

## 待确认

- 字典 `mater_status` 的名称是否与原型状态名一致（不一致时时间 / 金额标签退回「记录时间 / 调整额度」）；`quota_change_type` 字典值。
- usageRate 是百分数还是小数；企业维度 pageNum / pageSize 是否确实作用于明细而非企业列表。
- financeOrgId / bankOrgId 为 int64，request 未做大整数处理，超过 2^53 会失精（全局既有情况）。

## 验证

- 只读拉取 dev swagger（业务管理分组）核对接口与字段；本轮没有登录 Token，未调用接口、未看真实数据。
- 无 node：构建、测试、浏览器均未运行；模板标签配对、导入使用、括号配平用 Python 核对通过；信息隔离 grep 无命中。CodeGraph 本机未安装 / 无索引，未同步。

## 2026-11-25 总授信位置调整（dev/d061a1e）

- 用户指出：原型（F04 V0.1.1 头部 `ov-top`）中「额度总览」(BR-01) 与「总授信(万)：285,000.00」同在最上方一行，总授信是所有产业项目下各银行额度之和；页面原先把它放在项目胶囊行右端，看起来像所选项目的数据。
- 改法：总授信移入 `ListPageHeader` 标题右侧（紧挨标题、基线对齐，与原型 gap 16px 一致），胶囊行只留胶囊；数据仍取 count 顶层 quotaTotal，加载中 / 失败显示 `--`。
- `ListPageHeader` 新增可选插槽 `title-extra`：传入时标题与插槽包在 `.qr-page-header-title`（flex，可换行），不传时仍是原 h1，其他页面不受影响。
- 验证：无 Node，未构建、未在浏览器看效果；模板与样式改动人工核对，信息隔离 grep 无命中。
