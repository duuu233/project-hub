#!/usr/bin/env bash
# 用法: report-dist.sh <标签>
# 统计 dist 体积、类型分布、首屏 preload 资源
LABEL="${1:-run}"
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"
OUT="$DIR/${LABEL}-dist.txt"
cd "$ROOT" || exit 1

kib() { awk -v n="$1" 'BEGIN {printf "%.2f", n/1024}'; }
mib() { awk -v n="$1" 'BEGIN {printf "%.2f", n/1048576}'; }

{
  echo "== 总量 =="
  RAW=$(find dist -type f ! -name '*.gz' -printf '%s\n' | awk '{s+=$1} END {printf "%.2f", s/1048576}')
  GZ=$(find dist -type f -name '*.gz' -printf '%s\n' | awk '{s+=$1} END {printf "%.2f", s/1048576}')
  ALL=$(find dist -type f -printf '%s\n' | awk '{s+=$1} END {printf "%.2f", s/1048576}')
  echo "dist 原始部署文件: ${RAW} MiB"
  echo ".gz 预压缩副本:    ${GZ} MiB"
  echo "dist 磁盘总量:     ${ALL} MiB"

  echo
  echo "== 类型分布(原始, MiB) =="
  find dist -type f ! -name '*.gz' -printf '%f %s\n' \
    | awk '{n=$1; ext="(none)"; if (match(n, /\.[^.]+$/)) ext=tolower(substr(n, RSTART+1)); s[ext]+=$2} END {for (e in s) printf "%-8s %8.2f\n", e, s[e]/1048576}' \
    | sort -k2 -nr

  echo
  echo "== index.html 直接加载的资源 =="
  TOTAL=0
  TOTALGZ=0
  for f in $(grep -oE '(href|src)="/assets/[^"]+"' dist/index.html | sed -E 's/.*"(\/assets\/[^"]+)"/\1/' | sort -u); do
    P="dist${f}"
    [ -f "$P" ] || continue
    SZ=$(stat -c %s "$P")
    GZS=0
    [ -f "${P}.gz" ] && GZS=$(stat -c %s "${P}.gz")
    TOTAL=$((TOTAL + SZ))
    TOTALGZ=$((TOTALGZ + GZS))
    printf "%10s KiB  gz %8s KiB  %s\n" "$(kib "$SZ")" "$(kib "$GZS")" "$f"
  done
  echo "(gz 为 0 表示该文件小于 10KiB 压缩阈值,未生成预压缩副本)"
  printf "首屏 raw 合计: %s MiB / 预压缩 gz 合计: %s MiB\n" "$(mib "$TOTAL")" "$(mib "$TOTALGZ")"

  echo
  echo "== 最大的 20 个 JS/CSS chunk =="
  find dist/assets -type f \( -name '*.js' -o -name '*.css' \) -printf '%s %p\n' | sort -nr | head -20 \
    | awk '{printf "%10.2f KiB  %s\n", $1/1024, $2}'

  echo
  echo "== 构建告警 =="
  grep -E "Circular chunk|modules transformed|built in" "$DIR/${LABEL}-build.log" 2>/dev/null
} > "$OUT"

cat "$OUT"
