# 2026-10-13 work 项目代码同步

用户确认公司电脑 work 环境，按注册表和 work 映射核实七个业务仓库的实际根目录、origin 身份、当前分支与 upstream，读取各项目规则。Project Hub 当前 main 工作区干净，先显式 pull origin main，d608c9d 快进至 92d2c5e；新拉取内容未改变注册表、work 映射与执行规则。

| 项目 | 当前分支 | 起始提交 | 拉取后提交 | 结果 |
| --- | --- | --- | --- | --- |
| 泰乾超级 | master | 7d3dd63 | 7d3dd63 | 已为最新 |
| 花盆APP | main | 2f863f3 | f36be8c | 快进成功 |
| 花盆后台 | main | db02ba1 | db02ba1 | 已为最新 |
| 相册后台 | main | 322e960 | 322e960 | 已为最新 |
| 相册小程序 | main | 118ff7e | 118ff7e | 已为最新 |
| 相册APP | main | 2f3a67c | 2a9752f | 快进成功 |
| 正矿 | feature-v1.8.5 | f152a424 | f152a424 | 已为最新，未设置 upstream |

每仓先核实远端同名分支存在，再执行 `git pull --ff-only origin <当前分支>`。没有切分支、自动 merge/rebase、配置 upstream 或推送业务仓库。

## 原有修改保留

用户本轮明确授权仅暂存以下五文件，pull 后立即恢复，不提交它们：

- 泰乾超级：未跟踪 `pnpm-lock.yaml`。
- 花盆后台：已修改 `dist.zip`。
- 相册后台：未跟踪 `dist.zip`。
- 相册APP：已修改 `pubspec.lock`、`android/build/reports/problems/problems-report.html`。

两份 dist.zip 与相册APP两文件的操作前后 SHA256、Git 状态完全一致。泰乾锁文件在 stash apply 时因 core.autocrlf=true 从 LF 转成 CRLF，首次 SHA256 检查拦截，因此保留此次 stash；确认无额外 Git 属性，当前文件转换 CRLF→LF 后与 stash 原始 blob 字节哈希一致，再直接恢复该 blob 的原始 LF 字节。恢复后的 SHA256 为 `3262B8195B52FF403DE8B760AA53DD1433F9A9426A6119AEB205C6D5B7A06756`，Git 状态仍为未跟踪。该文件最终校验依据是 stash blob，未将其表述为操作前后 SHA256 已复核通过。

四仓此次临时 stash 在恢复核验后全部移除；相册APP原有 `9d5b5e5f24d20c9b6f228a7ce8ead592f5e465ca` stash 原样保留。未覆盖、回滚或提交任何原有文件。

## 验证与交付

- 七个业务仓库 HEAD 与拉取后的 origin 同名分支完全一致；三仓仍干净，四仓仅有上述五文件原有状态。
- 七个已有 CodeGraph 索引分别执行 sync/status，全部报告最新；未新建索引，未提交派生数据库。
- 本轮仅同步仓库与本机索引，不安装依赖、不构建、不运行业务测试或真实接口，不宣称业务功能重新验收。
- 只新增本次统筹同步记录，保留全部既有迭代和未完成事项；按当前 main 提交本轮记录，提交后再次显式 pull origin main 成功再 push。
