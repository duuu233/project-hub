# 没有 poppler 也能抽 PDF 文字（借 pdfjs-dist）

> 来源项目：album-app（相册 APP，2026-09-18 读 `docs/相框v2.0.0/` 四份 PDF）
> 适用：SSH 开发机上要读 PDF（规格书、通讯协议），但装不了系统包

## 痛点

这台开发机上 **没有 `pdftotext` / `pdfinfo`（poppler-utils）**，也没有 `PyPDF2` /
`pdfminer` / `PyMuPDF`；Claude Code 的 Read 工具读 PDF 依赖 `pdftoppm` 渲染，
同样报 `pdftoppm is not installed`。装系统包要 root，而且这台机器内存紧张，能不装就不装。

## 解法

**只读借用** `/pgdata/pg/work` 下别的项目已经装好的 `pdfjs-dist`（Node，纯 JS，不需要系统库）。
用户规则允许「只读借用别人目录里的依赖，产物写回 dh 自己的目录」。

```js
// .codex-tmp/frame-pdf/extract.mjs
import fs from 'node:fs'
const LIB = '/pgdata/pg/work/.../node_modules/pdfjs-dist/legacy/build/pdf.mjs'
const pdfjs = await import(LIB)
pdfjs.GlobalWorkerOptions.workerSrc = LIB.replace('pdf.mjs', 'pdf.worker.mjs')

const doc = await pdfjs.getDocument({
  data: new Uint8Array(fs.readFileSync(process.argv[2])),
  useSystemFonts: true,
  isEvalSupported: false,
}).promise

for (let i = 1; i <= doc.numPages; i++) {
  const content = await (await doc.getPage(i)).getTextContent()
  // ⚠️ 关键：PDF 里的文字块顺序**不是阅读顺序**，必须自己归行
  //    按 transform[5]（y）分组、组内按 transform[4]（x）排序，再按 y 从大到小输出
}
```

⚠️ **两个坑**：

1. **必须归行**。直接 `items.map(i => i.str).join('')` 出来的是乱序——表格尤其明显
   （表头、单元格、示例 JSON 会互相穿插）。按 y 归行 + 行内按 x 排序之后，中文表格和
   代码块基本可读。
2. **pdfjs 5.x 是 ESM**（`.mjs`），脚本要写成 `.mjs` 并用 `await import()`；
   `legacy/build` 那份才是给 Node 用的。

## 顺带：不装包也能数页数

```bash
python3 -c "import re,sys; d=open(sys.argv[1],'rb').read(); print(len(re.findall(rb'/Type\s*/Page[^s]', d)))" x.pdf
```

粗暴但够用（与 pdfjs 报的 `numPages` 在这四份 PDF 上完全一致）。

## 产物去向

抽出来的 `.txt` 写在 `project-hub/.codex-tmp/`（已 gitignore），**不进业务仓**——
它只是读文档的中间产物，结论写进业务仓的分析文档即可。
