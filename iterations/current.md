# 当前迭代

状态：已完成（代码与文档均已提交推送）
日期：2026-09-08
环境：ssh（用户本次声明；路径从 environments/ssh/projects.local.yaml 解析）

## 需求与分发

延续 work 端中断的「原价字段接入」，完成剩余工作。

| 项目 | 需求 | 交付 |
| --- | --- | --- |
| album-admin | 商品详情/新增/编辑新增四语种划线价（marketAmount 及英/繁/日三个变体） | 代码 e949ce3（work 端），文档 746407d |
| album-app | 星币管理接入划线价字段 marketAmount | 代码 9ccc387（work 端），文档 03c985a |
| album-miniapp | 星币管理接入划线价字段 marketAmount | 代码 834c9d7（work 端），文档 0b1a7b3 |

三个项目恢复时均先 `git pull --ff-only`，工作分支保持各自当前的 main。代码部分在 work 端已由用户提交推送，本端核对 diff 无误；缺失的维护文档在本端按各项目自身约定补齐。

## 验证摘要

- album-miniapp：定向测试全部通过，另做运行时冒烟核对语种码与原价归一。
- album-admin：字段检查脚本通过；生产构建通过（3044 模块）。
- album-app：**未验证**，本机无 Flutter / Dart SDK。
- 三个仓库本机均无 CodeGraph 索引，索引同步未执行。真机与页面验收未做。

## 遗留

1. album-admin 有四处 import 大小写与实际文件名不符，在 Linux 上会中断构建；既有问题，本轮未修，待用户决定修法。
2. album-app 的本轮测试仍需在有 Flutter SDK 的机器上补跑。
3. 客户端原价接口形态（按语种投影 vs 四字段全给）尚未固化，两端当前都兼容。
4. 三端真机 / 后台页面验收未做。

详细过程与技术口径见 `iterations/archive/2026-09-08-原价字段接入.md` 及各项目自身的变更记录。
