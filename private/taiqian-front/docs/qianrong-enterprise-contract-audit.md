# 企业用户新增/编辑契约核对

核验日期：2026-10-19，work，业务起点master/b3c1c73。首次仅核对；用户随后明确“直接改代码”，已实施用户组契约及证件类型修复，未请求真实新增/编辑。实施与验证见[同日记录](history/2026-10-19-work-enterprise-group-contract.md)。

修复已发布到当前master/4c5f6f2，显式同名pull后push，远端一致且干净；不是仅本地待提交。

## 结论

首次核对时企业表单仍提交旧用户组对象，不是新增/编辑URL或HTTP方法错误。用户提供的请求包含`sysOrgGroups: { userGroupId: "0" }`，但没有最新要求的`userGroupIds`，能够解释后端“请至少选择一个用户组”的反馈。本轮已改多选数组、回填和编辑省略/清空保护，并补证件类型；隔离验证通过，没有后台日志或真实写入验证，不将编译通过等同于落库联调成功。

依据：用户指定的 [新增接口页面](https://dev-qianrong.ftechain.com/api-qianrong/doc.html#/default/%E4%BC%81%E4%B8%9A%E5%9F%BA%E7%A1%80%E4%BF%A1%E6%81%AF%E7%AE%A1%E7%90%86/tenantInsertUsingPOST) 及同站只读获取的 [Swagger JSON](https://dev-qianrong.ftechain.com/api-qianrong/v2/api-docs)。本次 JSON SHA-256 为 D73691035EB38512721D6ECA734B1DC726DB19EE845493E46B381C4D5176957D，快照仅留在忽略的临时目录。10/15 的单用户组对象及无银行列表结论已过时。

## 新增与编辑

| 项目 | 最新契约 | 当前实现 |
| --- | --- | --- |
| 新增 | POST /api-qianrong/system/org/insert，tenantInsertUsingPOST | API 包装一致 |
| 编辑 | POST /api-qianrong/system/org/update，updateOrgUsingPOST | API 包装一致 |
| 请求模型 | 两者均为“企业信息基础表” | 共用 handleDetail.vue 的提交白名单和序列化 |
| 用户组 | 顶层 userGroupIds，array[integer/int64]；编辑不传保留，不允许空列表 | 已改多选，兼容新旧回填；新增/改组发数组，编辑未改则省略，清空已有组阻断；旧对象仅兼容读取、不写回 |
| 银行 | bankList，array[SysOrgBank对象]；编辑不传保留，空列表清除 | 本轮未新增银行CRUD界面，始终省略未编辑字段，保留后台银行信息、不误发空数组 |
| 法人证件类型 | legalIdType，integer；0身份证/1护照/2港澳通行证 | 已补三选项、回填和保存，0保留，缺失不强设默认 |

Swagger body 本身声明 required，但模型没有 required 数组；这不等于没有服务端业务校验。新增至少选择一个用户组的要求也由用户提供的实际业务反馈佐证。其它审计、认证、删除标记等未进入前端白名单的服务端字段，不因模型中存在就都改成用户可编辑项。

正确结构应为 `userGroupIds: [实际用户组ID]`，不是 `sysOrgGroups` 对象，也不是对象数组或逗号字符串。数值0在文档中没有被 minimum/enum 禁止，不能仅凭“0”就认定它是假ID；必须核对用户组列表实际选项。若0确为合法组，可表示为 `userGroupIds: [0]`，但此例只解释结构，不承诺该组在真实服务中存在/可用。不要将 int64 ID 无条件转换为不安全的 JavaScript Number。

## 首次核对源码位置（修复前行号）

- apps/qianrong/src/api/system/enterprise-users.js：新增和编辑包装直接传 data，未转换用户组字段。
- apps/qianrong/src/views/system/enterprise-users/template/handleDetail.vue:32：单选字段及必填校验仍使用 sysOrgGroups.userGroupId。
- 同文件:215：详情回填仍初始化旧对象。
- 同文件:221：白名单包含 sysOrgGroups，缺少 userGroupIds/bankList/legalIdType。
- 同文件:236：显式组装旧对象，新增/编辑共用，因此两者都受影响。

详情GET /system/org/detail/{id}仍只声明通用R，不能据其它DTO断言所有响应都已改为data.sysOrg。修复后平铺data.id优先，若实际存在data.sysOrg.id则兼容读取；两者都没有则停止保存。真实形态仍需联调，不替换成单一猜测包裹层。

## 当前修复范围

统一多用户组选择、初始值、详情回填、校验和最终请求序列化；纯函数放在enterprise-groups.js。保留未知/既有关联，编辑不改组时遵循不传保留，显式修改不得发送空组；缺失列表项仅标明未返回，不删除关联。法人证件类型已补齐，银行本轮不做新CRUD、更不发送空数组误清账户。原企业字段、附件、地区、管理员、权限及保存流程继续保留。

## 实际操作与边界

首次核对无源码改动；本轮获明确修复授权后重新pull两仓并sync索引，CodeGraph定位目标后改3个qianrong企业文件，不改qianlian/共享包。49项隔离回归、7项真实浏览器隔离场景、双尺寸和生产构建通过；未调用真实企业新增/编辑、未登录读取业务资料、未部署。业务按当前master提交、再次pull后push；维护记录按统筹main同样提交同步。真实落库和大ID绑定边界见同日实施记录，不宣称已完成真实联调。
