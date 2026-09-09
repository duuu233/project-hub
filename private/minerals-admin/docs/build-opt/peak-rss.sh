#!/usr/bin/env bash
# 用法: peak-rss.sh <输出文件>
# 轮询 "vite build" 进程树的 RSS 峰值(KiB -> MiB)
OUT="${1:-peak.txt}"
PEAK=0
while pgrep -f "[v]ite build" > /dev/null; do
  CUR=$(ps -eo rss,args --no-headers | awk '/[v]ite build|[c]ross-env NODE_OPTIONS/ {s+=$1} END {print s+0}')
  [ "$CUR" -gt "$PEAK" ] && PEAK=$CUR
  sleep 0.2
done
echo "peak_rss_MiB=$((PEAK / 1024))" > "$OUT"
