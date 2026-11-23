# 泰乾超级-qianrong H5 操作记录

## 2026-11-23｜ssh｜资产质押 / 解押信息、企业实名认证对接接口

- 同步：master 已最新（f99cd9d）。用户说「dev 分支」，仓库只有 master，询问后用户确认就在 master 上做；接口按 dev 后端 swagger。
- 实现（master/4904ab0）：见 Hub iterations 当日条目。要点：质押页两个接口并发（pledge/{id}、release/{id}），PledgeRecord 可空，解押按 releaseType auto / manual 映射还款 / 预提货；supportsPledgeAndPickup 改为 supportsStockAndPickup，质押入口两种模式都显示；ApiProfileRepository（orgAuth/list 判认证状态、eqb/launchOrgAuth 跳 e签宝，redirectUrl 为本站 /me）；platform/browser 条件导入。
- 取舍：authStatus 取值未注明，按 authStatusName 关键字判断；新增「认证中」状态；接口模式企业信息、操作员暂不可用（提示）；当前窗口跳转 e签宝。
- 待核对：authStatus / authStatusName 实际取值；orgAuth/list 对企业用户是否只返回本企业；launchOrgAuth 的 orgId 是否就是身份树的企业 ID；e签宝回跳是否带参数。
- 另发现（未改）：nginx `location ^~ /h5/assets/` 只找静态文件，H5 资产路由 `/h5/assets/...` 刷新会 404。
- 验证：未运行 analyze / test（本机无 Flutter）；括号配平、git diff --check、信息隔离 grep 通过。

## 2026-11-18｜ssh｜资产列表、详情对接资产接口

- 同步：master 已最新（f71ffa1）；参考仓 tq-plus test 分支已最新，资产对接代码在 origin/dev，只读 git show，未切分支。
- 实现（master/f99cd9d）：见 Hub iterations 当日条目。要点：ApiAssetRepository + parseAssetPage / parseAssetDetail；AssetSummary 改接口字段（id、billType、statusCode、人民币 / 外币价值）；AssetDict 内置单据类型、融资状态名称；supportsPledgeAndPickup 控制库存 / 提货 / 质押入口；列表分页加载。
- 取舍：只接列表、详情两个接口（用户口径）；字典不另请求接口，内置名称；无接口的功能在接口模式隐藏而不是显示演示数据。
- 待核对：字典中文名（尤其 partially_pledged）；assetBillType 与 assetType 哪个是最终字段；列表是否需要 menuPerm。
- 验证：未运行 analyze / test（本机无 Flutter）。

## 2026-11-18｜ssh｜对接短信登录、身份树与切换身份

- 同步：master 已最新（45dee66）；参考仓 tq-plus 当前 test 分支同步已最新，只读。
- 实现（master/f71ffa1）：见 Hub iterations 当日条目。要点：ApiClient 体内 code 判错 + Bearer；login_identity 解析身份树并按企业分组；登录多身份时页内第二步选择；我的页「切换身份」底部弹层；AppSession 持久化（session_storage 条件导入，Web 用 localStorage）。
- 取舍：手机端不画树，按企业分组列表；切换不再弹确认框（点一行即切，失败保持原身份）；验证码 4-6 位。
- 待核对：login / changeLogin 返回的 Token 字段；app/login 后是否已带默认身份。
- 验证：未运行 analyze / test（本机无 Flutter）。

## 2026-11-11｜ssh｜接入 ssh 并实现登录、资产、我的（演示数据）

- 接入：`/home/cc/dh/tq-plus-h5`，从 GitHub 同步 master 已最新（2fcdb27）。手动建立五项挂载与 `.git/info/exclude`，五项 check-ignore 命中。
- 分工：二人协作，用户负责登录、资产模块、我的页面；首页、融资由另一位开发。原型为 Hub `private/taiqian-front/V0.9/V16 乾融企业端H5.html`（login / assets / asset-detail / pledge-info / pickup / mine / esign / ent-info / user-add 九屏）。
- 已有基础：go_router `StatefulShellRoute.indexedStack`、`ApiClient`（同源 `/api/`、统一 `ApiException`）、`AuthRepository` + `DEMO_AUTH` 演示开关、H5 控件封装（Button/Card/ListTile/TextField/NavigationBar/TabBar/PageScaffold）、断点与主题。
- 实现（master/45dee66）：
  - 登录改为原型的短信登录：手机号 + 4 位验证码 + 协议勾选，60s 重发倒计时；`AuthRepository` 改为 `sendLoginCode` / `login(phone, code)`，Api 实现暂定 `auth/sms-code`、`auth/login`，待接口文档确认。新增 `AppSession`（手机号、当前企业）。
  - 资产 Tab（`/assets`）：资产编号搜索、卡片（类型标签/状态/价值/形成时间/核心企业/已解押数量）、部分解押可「发起提货」。详情 `/assets/:no?tab=`：资产明细、库存信息（商品名搜索、导出占位、横向滚动台账）、提货信息（含发起提货入口）。`/assets/:no/pledge` 质押/解押两 Tab。`/assets/:no/pickup` 发起提货：日期选择、底部弹层勾选商品、数量校验 1..min(解押可用, 入库可用)，提交后回到详情提货信息 Tab。
  - 我的：企业名 + 切换企业弹层、手机号脱敏、企业信息行按认证状态（实名认证/已认证/认证失败）跳 e签宝占位页或企业信息页；未认证时「新增h5登录用户」置灰提示；操作员卡片式增删、名称≤10、手机号 11 位、重复校验；退出确认后回登录。
  - 数据：`AssetRepository`、`ProfileRepository` 接口 + 共享演示实现（会话内保留提货、认证、操作员变更）；`H5Format` 统一金额/数量/日期/脱敏。新增 `H5InfoRow`、`H5MiniTable`、`h5_toast`。
  - 路由：二级页全部注册为顶层 GoRoute（不嵌套），避免 push 子路由时把父页一起压栈；Tab 改为 `H5AppShell.tabs` 列表，与 branch 顺序一一对应。
  - 测试：改写 login_page_test，新增 asset_pages_test、profile_pages_test。
- 取舍：主题沿用仓库现有青绿色（未改成原型湖蓝 #2AA8E0，避免影响合作方页面）；未加 `flutter_localizations`（需改 pubspec 并 pub get），日期选择器月份/星期为英文；未加登录守卫（静态数据阶段，避免合作方开发被重定向）；未建「融资」Tab（合作方负责，加 branch 时同步 `H5AppShell.tabs`）；支付密码、申请解押属于首页/融资链路，未做。
- 验证：本机无 flutter/dart，analyze 与 `flutter test` 未运行；括号配平与 `git diff --check` 通过，信息隔离 grep 无命中。需在本地 `bash ./tool/flutterw.sh analyze` 和 `test` 复核。

## 2026-11-11｜work｜更正为 Flutter Web 仓库

- 用户确认目标为 `qianrong/h5`，核实 `master/2fcdb27` 和干净的工作区。
- 按原项目规则保留 Git 跟踪的 `AGENTS.md`、`docs/`，私人规则和文档改用 `AGENTS.local.md`、`.local-docs/`。五项挂载经验证已被本机 Git 忽略。
- 经用户授权，GitHub 默认分支 `master` 已更新至 `2fcdb27`，核对仅有 `master` 分支，无标签。

## 2026-11-11｜work｜首次接入与 GitHub 备份

- 首次接入时核实了独立仓库根目录和当时的工作分支。
- 建立 `AGENTS.md`、`AI_CONTEXT.md`、`docs/`、`logs/`、`.codegraph/` 的私人挂载，验证业务 Git 不跟踪这些路径。首次接入仅预留 CodeGraph 挂载。
- 首次推送到 GitHub 后核对了提交。仓库身份及交付以更正记录为准。
