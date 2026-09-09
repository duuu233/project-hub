#!/usr/bin/env bash
# 用法: measure-build.sh <标签>
# 运行 npm run build，记录耗时与 vite build 进程树的峰值 RSS
LABEL="${1:-run}"
DIR="$(cd "$(dirname "$0")" && pwd)"
LOG="$DIR/${LABEL}-build.log"
PEAK=0
START=$(date +%s)

npm run build > "$LOG" 2>&1 &
BUILD_PID=$!

while kill -0 "$BUILD_PID" 2>/dev/null; do
  # ps 里 node 的 comm 是 MainThread，只能按命令行匹配
  CUR=$(ps -eo rss,args --no-headers | awk '/[v]ite build|[c]ross-env NODE_OPTIONS/ {s+=$1} END {print s+0}')
  if [ "$CUR" -gt "$PEAK" ]; then PEAK=$CUR; fi
  sleep 0.2
done

wait "$BUILD_PID"
CODE=$?
END=$(date +%s)

{
  echo "label=$LABEL"
  echo "exit=$CODE"
  echo "duration_s=$((END - START))"
  echo "peak_rss_MiB=$((PEAK / 1024))"
} | tee "$DIR/${LABEL}-metrics.txt"
exit $CODE
