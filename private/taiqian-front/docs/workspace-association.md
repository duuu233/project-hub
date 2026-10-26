# 环境关联与私人维护

核实日期：2026-10-12。依据：共享注册表、home/work 映射、公司仓库根目录与远端、挂载实测、CodeGraph status。

## 身份与范围

- 名称「泰乾超级」，稳定 ID 为 taiqian-front；home 与 work 是同一个逻辑项目，Git 操作以 front 仓库根目录为单位。
- packages 是用户最初指定的重点维护范围，包括 auth、request、shared、ui；具体需求决定改动位置。qianrong 和 qianlian 是同一仓库内的独立应用，不登记为独立仓库。
- packages 不依赖应用，应用不相互引用业务代码。共享包改动需核对两个应用的消费者；单个应用的视觉改动优先留在该应用。
- 路径仅从当前用户声明环境的 projects.local.yaml 读取，不能拿 home 路径在 work 执行，也不能根据 packages 子目录自动改用父目录。

## 私人资料

| 业务根目录入口 | 私人真实资料 | 本机呈现 |
| --- | --- | --- |
| AGENTS.md | instructions/AGENTS.md | 文件 SymbolicLink |
| AI_CONTEXT.md | instructions/AI_CONTEXT.md | 文件 SymbolicLink |
| docs | docs | 目录 Junction |
| logs | logs | 目录 Junction |
| .codegraph | .codegraph | 目录 Junction |

真实资料统一位于 private/taiqian-front。规则、文档、日志由统筹 Git 同步；业务侧仅通过本地忽略的链接读取。面向同事的源码、使用规范与示例继续随业务仓库提交，不能写入私人路径或维护机制。

## 换电脑或恢复关联

1. 核对两仓库的当前分支和用户原改动；干净后分别显式 pull origin 的当前同名分支。不根据远端默认分支自动切换，不自动设置 upstream。
2. 读取同步后的规则与文档，使用当前环境执行 `node scripts/setup-links.mjs --env <环境> --project taiqian-front --dry-run`。实体文件冲突时停止，不覆盖、不自动迁移。
3. 预检通过后执行同一命令去掉 --dry-run，再检查五项入口指向私人真实文件，`git check-ignore -v -- .codegraph docs AGENTS.md AI_CONTEXT.md logs` 全部命中本地忽略，业务 `git status --short` 干净。
4. 每台机器独立维护索引。数据库未初始化时执行 `codegraph init .`；已有数据库时执行 `codegraph sync .`，最后 `codegraph status .`。数据库、配置缓存和运行产物由私人 .codegraph/.gitignore 忽略，不跨机器复制或提交。
5. 公司于 2026-10-12 已恢复五项挂载并初始化索引。初始化结果不是业务验收，不代表页面、接口或构建已通过。

## SSH 服务器（2026-10-26 接入）

- 用户在 ssh 环境引入 `/home/cc/dh/tq-plus`，称「超级泰乾-qianrong」。核实：Git 根目录、master 与 origin/master 一致（9975d7f，44 个提交），本目录日志记录的多个提交号均在其历史中，确认是同一 front 仓库，复用 taiqian-front 和本私人目录，不新建项目。
- 远端一直是用户 GitHub 上的 tq-plus 仓库，ssh 与 home/work 的 origin 相同；pull/push 按规则走 origin 的同名分支。
- 本机无 node，setup-links.mjs 无法运行；按脚本同样的规则手动建立五项绝对路径软链接（目录、文件均为普通 symlink），`.git/info/exclude` 追加五条忽略。`git check-ignore -v` 五项全部命中，业务 `git status --short` 干净。
- 本机无 codegraph CLI，索引未初始化；装好后在业务根目录执行 `codegraph init .`。本机也无法运行 pnpm 构建，验证边界需在后续任务里如实说明。

详细记录见 [history/2026-10-12-work-association.md](history/2026-10-12-work-association.md)。
