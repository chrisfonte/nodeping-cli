#!/bin/bash
#
# Export NodePing Checks to CSV
# Usage: ./export-checks-csv.sh [filter] [output.csv]
#

FILTER="${1:-.*}"  # Default to all checks
OUTPUT="${2:-nodeping-checks.csv}"

echo "Exporting NodePing checks to CSV..."
echo "Filter: $FILTER"
echo "Output: $OUTPUT"
echo ""

# Get checks as JSON and convert to CSV
nodeping checks list --filter "$FILTER" --json | jq -r '
  (["ID", "Label", "Type", "Target", "State", "Enabled", "Interval"] | @csv),
  (.[] | [
    .id,
    .label,
    .type,
    .parameters.target // "N/A",
    (if .state == 1 then "PASS" else "FAIL" end),
    .enable,
    .interval
  ] | @csv)
' > "$OUTPUT"

LINE_COUNT=$(wc -l < "$OUTPUT")
CHECK_COUNT=$((LINE_COUNT - 1))  # Subtract header

echo "✓ Exported $CHECK_COUNT check(s) to $OUTPUT"
echo ""
head -n 5 "$OUTPUT"
echo "..."
