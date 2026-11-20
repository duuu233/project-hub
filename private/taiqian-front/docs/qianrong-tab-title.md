# qianrong 浏览器页签标题

## 2026-11-20 ssh test/60c062f 页签固定显示「乾融系统」

- 反馈（用户）：刷新页面时页签有时显示「泰乾德邦数字金融管理系统」，改成「乾融系统」，且不要有闪的感觉。
- 原因：刷新时浏览器先显示 index.html 的静态 `<title>`（泰乾德邦…）；路由守卫 `setTitle(to.meta.title)` 再改成「链数融亁 - 页面名」。硬刷新时动态路由还没注册，第一轮守卫拿不到 meta.title，要等 addRoute 后重进守卫才改，于是先显示旧名、再跳成页面名，形成闪烁。
- 改法：index.html `<title>` 与 `.env.development / staging / production` 的 VITE_APP_TITLE 统一为「乾融系统」；`utils/dynamicTitle.js` 不再拼页面名，始终写 settings.title（相同则不写）。从 HTML 解析到路由跳转，页签文字不变，无闪烁。settings store 的 title 仍记录当前页面名，未改。
- 取舍：页签不再显示各页面名称。若以后要「乾融系统 - 页面名」，首屏刷新必然先显示静态标题再变，需另议（如按路径缓存上次标题、在 head 内联脚本提前写入）。
- 不涉及：文件预览页（`/file-preview`，独立打开）仍按「文件名 - 文件预览」设置；登录页品牌标题（页面内文字）未改。
- 测试：新增 `tests/tab-title.test.mjs`（index.html 与三个 env 一致、dynamicTitle 不再拼「链数融亁」）。
- 验证：无 node，未跑测试 / 构建 / 浏览器。
