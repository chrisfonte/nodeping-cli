#!/bin/bash
#
# NodePing Status Report
# Generates a summary of all checks grouped by status
#

echo "=== NodePing Status Report ==="
echo "Generated: $(date)"
echo ""

# Get all checks
CHECKS=$(nodeping checks list --json)
TOTAL=$(echo "$CHECKS" | jq '. | length')

echo "Total Checks: $TOTAL"
echo ""

# Count by state
PASSING=$(echo "$CHECKS" | jq '[.[] | select(.state == 1)] | length')
FAILING=$(echo "$CHECKS" | jq '[.[] | select(.state == 0)] | length')

echo "Status Breakdown:"
echo "  ✓ Passing: $PASSING"
echo "  ✗ Failing: $FAILING"
echo ""

# Count by type
echo "Check Types:"
echo "$CHECKS" | jq -r '
  group_by(.type) |
  map({type: .[0].type, count: length}) |
  sort_by(.count) |
  reverse |
  .[] |
  "  \(.type): \(.count)"
'
echo ""

# Count by enabled status
ENABLED=$(echo "$CHECKS" | jq '[.[] | select(.enable == "active")] | length')
DISABLED=$(echo "$CHECKS" | jq '[.[] | select(.enable != "active")] | length')

echo "Enabled Status:"
echo "  Active: $ENABLED"
echo "  Disabled: $DISABLED"
echo ""

# List failing checks
if [ "$FAILING" -gt 0 ]; then
    echo "Currently Failing Checks:"
    echo "$CHECKS" | jq -r '
      [.[] | select(.state == 0)] |
      .[] |
      "  [\(.type)] \(.label) - \(.parameters.target // "N/A")"
    '
    echo ""
fi
