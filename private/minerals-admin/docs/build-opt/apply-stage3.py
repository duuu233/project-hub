# 阶段 3: 把页面级依赖从通用 vendor 中拆出来,避免被入口 chunk 提前预加载
import io
p = 'vite.config.ts'
s = io.open(p, encoding='utf-8').read()

old = """            if (id.includes('@wangeditor') || id.includes('quill')) return 'vendor-editor'
"""
new = """            if (id.includes('@wangeditor') || id.includes('quill')) return 'vendor-editor'
            // 下面这些依赖只服务于单个业务页面,单独成块后不会再跟着入口 chunk 预加载。
            // 用完整路径段匹配,避免误伤名字相近的包(例如 jsqr / @types/qrcode)。
            if (/node_modules[\\\\/](vue3-lottie|lottie-web)[\\\\/]/.test(id)) return 'vendor-lottie'
            if (/node_modules[\\\\/](@vue-flow|@dagrejs)[\\\\/]/.test(id)) return 'vendor-flow'
            if (/node_modules[\\\\/]qrcode[\\\\/]/.test(id)) return 'vendor-qrcode'
            if (/node_modules[\\\\/]vue-cropper[\\\\/]/.test(id)) return 'vendor-cropper'
            if (/node_modules[\\\\/]sortablejs[\\\\/]/.test(id)) return 'vendor-sortable'
"""
assert old in s and new not in s
s = s.replace(old, new, 1)
io.open(p, 'w', encoding='utf-8').write(s)
print('stage3 applied')
