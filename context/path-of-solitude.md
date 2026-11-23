# 孤独之路

- project_id：`path-of-solitude`
- 用途：微信小游戏。
- 技术栈：Cocos Creator 3.8（TypeScript），项目在仓库 `client/`；`client/assets/scripts/core` 为纯逻辑，服务端经 esbuild 打包复用（`server/lib/core.cjs`）。2026-11-23 用户要求改用引擎并删除原生版本。
- 当前范围（2026-11-23 用户明确）：只做第一章主城与迷雾荒滩，打磨定型后再按此标准扩展后续地图；第一章蓝装已算稀有。角色无职业、武器决定流派；同日用户追加战士（战锤 / 巨锤）与游侠（长弓），现为三条武器路线。美术由用户另一侧维护并提交到仓库。
- 项目内规则与维护文档入口：`AGENTS.md`（开发约定、范围、验证）、`README.md`（运行步骤：Cocos 导入 `client/`、新建空场景）、`docs/architecture.md`、`docs/engineering/构建与安全.md`、`docs/design/命名与合规规范.md`、`docs/design/美术资源设计规范.md`、`docs/design/美术素材清单.md`、`docs/design/法师联动设计.md`、`docs/design/战士与游侠设计.md`、规格书三份、变更记录 `docs/history/YYYY-MM/`。数值总表 `client/assets/scripts/core/data/balance.ts`。无 `.codegraph/`。

## 执行方式

每次迭代读取目标项目的适用规则、文档索引和任务相关维护文档。有 CodeGraph 索引时先用它理解或定位代码。具体实现、验证命令和文档维护遵循目标项目要求。
