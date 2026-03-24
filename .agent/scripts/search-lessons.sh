#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# 🔍 search-lessons.sh — Tìm kiếm nhanh trong Lessons Learned
# Tránh lessons-learned.md trở thành write-only document.
#
# Usage:
#   bash search-lessons.sh                    # Interactive mode
#   bash search-lessons.sh "#RaceCondition"   # Search by tag
#   bash search-lessons.sh "race condition"   # Search by keyword
#   bash search-lessons.sh --severity high    # Filter by severity
#   bash search-lessons.sh --platform Meta    # Filter by platform
#   bash search-lessons.sh --list             # List all lesson IDs
# ─────────────────────────────────────────────────────────────

LESSONS_FILE="$(dirname "$0")/../../knowledge/lessons-learned.md"
BOLD='\033[1m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RESET='\033[0m'

# ── Validate file exists ──────────────────────────────────────
if [ ! -f "$LESSONS_FILE" ]; then
  echo -e "${RED}❌ File not found: $LESSONS_FILE${RESET}"
  exit 1
fi

# ── Helper: print a lesson block ─────────────────────────────
print_lesson() {
  local lesson_id="$1"
  echo -e "\n${BOLD}${CYAN}$lesson_id${RESET}"
  # Extract from ## [LL-XXX] to next ## or end of file
  awk "/^## \[${lesson_id}\]/,/^## \[LL-/" "$LESSONS_FILE" \
    | head -n -1 \
    | sed "s/🔴/${RED}🔴${RESET}/g;s/🟡/${YELLOW}🟡${RESET}/g;s/🟢/${GREEN}🟢${RESET}/g"
}

# ── Mode: --list ─────────────────────────────────────────────
if [[ "$1" == "--list" ]]; then
  echo -e "\n${BOLD}📚 Tất cả Lessons Learned:${RESET}\n"
  grep -oP "## \[LL-\d+\] .+" "$LESSONS_FILE" | while IFS= read -r line; do
    id=$(echo "$line" | grep -oP "LL-\d+")
    title=$(echo "$line" | sed "s/## \[LL-[0-9]*\] //")
    tags=$(grep -A2 "## \[$id\]" "$LESSONS_FILE" | grep "Tags:" | sed 's/\*\*Tags:\*\* //')
    severity=$(grep -A20 "## \[$id\]" "$LESSONS_FILE" | grep "Mức độ" | grep -oP "(🔴|🟡|🟢).+")
    printf "  ${CYAN}%-8s${RESET} %-50s ${YELLOW}%-30s${RESET} %s\n" "[$id]" "$title" "$tags" "$severity"
  done
  echo ""
  exit 0
fi

# ── Mode: --severity ─────────────────────────────────────────
if [[ "$1" == "--severity" ]]; then
  case "${2,,}" in
    high|cao)   EMOJI="🔴" ;;
    medium|mid) EMOJI="🟡" ;;
    low|thap)   EMOJI="🟢" ;;
    *)          echo "Usage: --severity [high|medium|low]"; exit 1 ;;
  esac
  echo -e "\n${BOLD}🔍 Lessons với severity ${EMOJI}:${RESET}"
  grep -B30 "Mức độ.*${EMOJI}" "$LESSONS_FILE" | grep "## \[LL-" | sed 's/## /  /'
  exit 0
fi

# ── Mode: --platform ─────────────────────────────────────────
if [[ "$1" == "--platform" ]]; then
  PLATFORM="$2"
  echo -e "\n${BOLD}🔍 Lessons liên quan đến platform: ${YELLOW}$PLATFORM${RESET}\n"
  grep -n "Platform liên quan.*$PLATFORM" "$LESSONS_FILE" | while IFS= read -r match; do
    LINE_NUM=$(echo "$match" | cut -d: -f1)
    # Find the ## [LL-XXX] above this line
    LESSON_ID=$(head -n "$LINE_NUM" "$LESSONS_FILE" | grep "## \[LL-" | tail -1 | grep -oP "LL-\d+")
    print_lesson "$LESSON_ID"
  done
  exit 0
fi

# ── Mode: tag or keyword search ──────────────────────────────
QUERY="$1"

if [ -z "$QUERY" ]; then
  # Interactive mode
  echo -e "\n${BOLD}🧠 Lessons Learned — Search${RESET}"
  echo "─────────────────────────────────"
  echo "Nhập tag (vd: #RaceCondition) hoặc keyword (vd: workspace):"
  read -r QUERY
fi

if [ -z "$QUERY" ]; then
  echo "No query provided."; exit 1
fi

echo -e "\n${BOLD}🔍 Tìm kiếm: ${YELLOW}\"$QUERY\"${RESET}\n"

# Find matching lesson IDs
MATCHES=$(grep -in "$QUERY" "$LESSONS_FILE" | grep -v "^#" | head -20)

if [ -z "$MATCHES" ]; then
  echo -e "${RED}Không tìm thấy lesson nào chứa \"$QUERY\"${RESET}"
  echo ""
  echo "Gợi ý:"
  echo "  bash search-lessons.sh --list       # xem tất cả"
  echo "  bash search-lessons.sh #API         # tìm theo tag"
  echo "  bash search-lessons.sh --severity high"
  exit 0
fi

# Get unique lesson IDs from context
LESSON_IDS=$(echo "$MATCHES" | while IFS= read -r line; do
  LINE_NUM=$(echo "$line" | cut -d: -f1)
  head -n "$LINE_NUM" "$LESSONS_FILE" | grep "## \[LL-" | tail -1 | grep -oP "LL-\d+"
done | sort -u)

COUNT=$(echo "$LESSON_IDS" | grep -c "LL-")
echo -e "Tìm thấy ${BOLD}${COUNT}${RESET} lesson(s):"

for ID in $LESSON_IDS; do
  print_lesson "$ID"
done

echo ""
