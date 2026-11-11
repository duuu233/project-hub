# 泰乾超级-qianrong H5 操作记录

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
