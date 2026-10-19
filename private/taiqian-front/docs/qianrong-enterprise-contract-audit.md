# 企业用户新增/编辑契约核对

核验日期：2026-10-19，work，业务 master/b3c1c73。仅核对，不修改业务源码或请求真实新增/编辑。

## 结论

当前企业用户表单与最新接口请求模型不一致，问题不是新增/编辑 URL 或 HTTP 方法，而是旧用户组字段仍在提交。用户提供的请求包含 `sysOrgGroups: { userGroupId: "0" }`，但没有最新要求的 `userGroupIds`，能够解释后端“请至少选择一个用户组”的反馈；没有后台日志或真实写入验证，不将此核对等同于修复后联调成功。

依据：用户指定的 [新增接口页面](https://dev-qianrong.ftechain.com/api-qianrong/doc.html#/default/%E4%BC%81%E4%B8%9A%E5%9F%BA%E7%A1%80%E4%BF%A1%E6%81%AF%E7%AE%A1%E7%90%86/tenantInsertUsingPOST) 及同站只读获取的 [Swagger JSON](https://dev-qianrong.ftechain.com/api-qianrong/v2/api-docs)。本次 JSON SHA-256 为 D73691035EB38512721D6ECA734B1DC726DB19EE845493E46B381C4D5176957D，快照仅留在忽略的临时目录。10/15 的单用户组对象及无银行列表结论已过时。

## 新增与编辑

| 项目 | 最新契约 | 当前实现 |
| --- | --- | --- |
| 新增 | POST /api-qianrong/system/org/insert，tenantInsertUsingPOST | API 包装一致 |
| 编辑 | POST /api-qianrong/system/org/update，updateOrgUsingPOST | API 包装一致 |
| 请求模型 | 两者均为“企业信息基础表” | 共用 handleDetail.vue 的提交白名单和序列化 |
| 用户组 | 顶层 userGroupIds，array[integer/int64]；编辑不传保留，不允许空列表 | 单选绑定 sysOrgGroups.userGroupId，白名单/序列化均发送旧对象，不发送 userGroupIds |
| 银行 | bankList，array[SysOrgBank对象]；编辑不传保留，空列表清除 | 无银行列表编辑界面，保存白名单未包含该字段；不能把未编辑误发为空数组 |
| 法人证件类型 | legalIdType，integer；0身份证/1护照/2港澳通行证 | 当前界面未提供类型选择，保存白名单未包含；不把此项认定为本次用户组报错原因 |

Swagger body 本身声明 required，但模型没有 required 数组；这不等于没有服务端业务校验。新增至少选择一个用户组的要求也由用户提供的实际业务反馈佐证。其它审计、认证、删除标记等未进入前端白名单的服务端字段，不因模型中存在就都改成用户可编辑项。

正确结构应为 `userGroupIds: [实际用户组ID]`，不是 `sysOrgGroups` 对象，也不是对象数组或逗号字符串。数值0在文档中没有被 minimum/enum 禁止，不能仅凭“0”就认定它是假ID；必须核对用户组列表实际选项。若0确为合法组，可表示为 `userGroupIds: [0]`，但此例只解释结构，不承诺该组在真实服务中存在/可用。不要将 int64 ID 无条件转换为不安全的 JavaScript Number。

## 源码位置

- apps/qianrong/src/api/system/enterprise-users.js：新增和编辑包装直接传 data，未转换用户组字段。
- apps/qianrong/src/views/system/enterprise-users/template/handleDetail.vue:32：单选字段及必填校验仍使用 sysOrgGroups.userGroupId。
- 同文件:215：详情回填仍初始化旧对象。
- 同文件:221：白名单包含 sysOrgGroups，缺少 userGroupIds/bankList/legalIdType。
- 同文件:236：显式组装旧对象，新增/编辑共用，因此两者都受影响。

详情 GET /system/org/detail/{id} 的当前响应只声明通用 R，不能根据另一处“企业详情”DTO就断言这个端点返回 data.sysOrg。现代码要求 data.id，真实回填结构需用实际详情响应确认；本轮没有鉴权读取业务资料，不擅自改包裹层。

## 修复范围建议（尚未实施）

统一多用户组选择、初始值、详情回填、校验、白名单和最终请求序列化，不能仅重命名一个字段；保留未知/既有关联，编辑不改组时遵循不传保留，显式修改不得发送空组。银行列表及证件类型按新增契约与页面需求另行明确，不能为补字段误清已有银行账户；保留原企业字段、附件、地区、管理员、权限及保存流程。

## 实际操作与边界

两仓开始干净并先显式快进pull当前 main/master成功；已有索引sync成功，先用CodeGraph两次定位，但索引同名组件匹配到其它应用，随后按规则定向读取已知qianrong模块，不把qianlian当成修改目标。只读下载文档，完成请求路径、方法、模型引用和字段差异核对；未运行构建/业务测试、未调用企业新增/编辑、未登录读取真实企业资料、未部署。业务源码保持b3c1c73；仅提交维护核对记录，具体修复待用户下一步决定。
