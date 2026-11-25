# qianrong 菜单管理：企业端H5 菜单树

2026-11-25 ssh dev/9b64539（用户明确，给了临时 token，写 dev 后端 https://dev-qianrong.ftechain.com/api-qianrong）：按 H5 页面级在菜单管理新增单独的 H5 树，包括 H5 的 4 个 Tab 和里面的详情页。

## 依据

- 4 个 Tab：原型 `V0.9/V16 乾融企业端H5.html` 底部 tab-bar（首页 home / 融资 finance / 资产 assets / 我的 mine）。H5 仓库（tq-plus-h5 master，只读）目前只实现了首页、资产、我的 3 个 Tab，融资 Tab 未实现。
- 二级页面归属按原型跳转关系：首页「近期待还」还款按钮 → 支付密码 / 重置支付密码；融资列表卡片按状态 → 预申请、授权书、授信结果、融资申请、签署提示、E签宝签署、提交成功、融资详情（待还款 / 部分还款）、申请还款、还款确认、还款结果、还款记录、申请解押；资产列表 → 资产详情、质押/解押信息、发起提货；我的 → 企业信息、企业实名认证（esign）、新增H5登录用户。
- 不建：登录页（不在 Tab 下）、原型 `pre-apply-2`（原型标注「不再途经，待裁决删除」）。

## 结果（dev 后端，menuId 2552–2578）

- 2552 企业端H5（M，path h5，routeName H5，o=8，**隐藏**）：PC 侧栏 siderMenu / TopNav / firstAccessiblePath 都跳过 hidden，所以 PC 看不到；菜单管理、角色授权树照常显示。
- Tab（C，显示）：2553 首页 home、2556 融资 finance、2571 资产 assets、2575 我的 me。
- 二级页（C，隐藏，路径挂在 Tab 路径下）：2554–2555 首页下；2557–2570 融资下（路径 finance/<原型页面>，部分还款用 finance/repay-detail-partial）；2572–2574 资产下（assets/:assetId、/pledge、/pickup，与 H5 路由一致）；2576–2578 我的下（me/enterprises/:enterpriseId、/certify、/operators，与 H5 路由一致）。
- component 为空（后端返回 Layout，不会去找 PC 视图）、perms 为空；routeName 统一 H5 前缀（后端已按 routeName 返回），避免与 PC 路由重名覆盖。

## 写法（学同事 add-qianrong-routes.mjs + route-script.test.mjs）

- `scripts/add-qianrong-h5-menus.mjs`：H5_TREE 声明 + dry-run 默认、--execute 写入、QR_TOKEN；只建缺的（同一上级同名即已有），字段差异只提示，不移动不删除；执行前备份到 scripts/.backup/；执行后校验菜单字段与 /getRouters（hidden、routeName 唯一）。
- `tests/h5-menu-script.test.mjs`：解析声明块，校验树形、H5 已实现页路径、routeName 前缀 / 唯一 / 不与 PC ROUTE_TREES 重名、无组件无权限、不在 ROOT_SEQUENCE、buildSiderModel 与 firstAccessiblePath 不出现 H5。
- PC 脚本 add-qianrong-routes.mjs dry-run：企业端H5 只出现在「不在 ROOT_SEQUENCE 里，不会被调整」提示里，其余 0 变更。
- 用户说 test 分支有菜单测试写法：origin/test 没有 dev 以外的提交（dev 已合入 test），dev 上的 route-script.test.mjs 是最新写法。

## 坑

- 后端菜单不保存 remark：POST、PUT 带 remark 都返回成功但读回为 null。脚本里的 remark 只作声明说明，不再提交。（对 2572 试过一次 PUT，其余字段未变。）

## 验证

- 借用服务器只读 Node（/home/cc/sdk 下 v22）跑测试；无 node_modules，用 .codex-tmp 里的 fuse.js 桩加载器：h5-menu-script 5/5、route-script 12/12 通过，sider-menu 搜索 2 条因桩失败（与本次无关）。
- dry-run → execute 新建 27 个、失败 0；校验通过；再 dry-run 0 待建。未在浏览器看菜单管理页面、未构建。token 未写入任何文件。
