# -*- coding: utf-8 -*-
# 阶段 4: ECharts 全量导入改为按需注册。
# 只替换 import 行并追加 use() 注册,不改动任何 option 或调用点。
import io, sys

EDITS = [
    (
        'src/views/system/currency/template/historyRateDialog.vue',
        u"import * as echarts from 'echarts'\n",
        u"""import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
""",
        u"""
echarts.use([LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])
""",
    ),
    (
        'src/views/information/market-data/index.vue',
        u"import * as echarts from 'echarts'\n",
        u"""import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
""",
        u"""
echarts.use([LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])
""",
    ),
    (
        'src/views/information/customs-data/index.vue',
        u"import * as echarts from 'echarts'\n",
        u"""import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
""",
        u"""
echarts.use([PieChart, LineChart, BarChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])
""",
    ),
    (
        'src/views/workbench/components/WorkbenchArrivalChart.vue',
        u"import * as echarts from 'echarts'\n",
        u"""import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
""",
        u"""
echarts.use([BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])
""",
    ),
]

only = sys.argv[1] if len(sys.argv) > 1 else None

for path, old_import, new_import, use_block in EDITS:
    if only and only not in path:
        continue
    s = io.open(path, encoding='utf-8').read()
    if new_import in s:
        print('skip (already applied): %s' % path)
        continue
    assert old_import in s, 'import 行未找到: %s' % path
    s = s.replace(old_import, new_import, 1)

    # use() 紧跟在该文件最后一条 import 语句之后
    lines = s.split('\n')
    last_import = max(i for i, ln in enumerate(lines) if ln.startswith('import '))
    lines.insert(last_import + 1, '\n' + use_block.strip('\n'))
    s = '\n'.join(lines)

    io.open(path, 'w', encoding='utf-8').write(s)
    print('patched: %s' % path)
