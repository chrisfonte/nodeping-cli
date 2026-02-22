#!/bin/bash
#
# SR Station Cleanup Script
# Purpose: Bulk delete all SR station monitoring checks from NodePing
# Context: SR stations shutting down April 1, 2026
# 
# This script demonstrates safe bulk deletion with audit trail
#

set -e  # Exit on error

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
AUDIT_DIR="./audit-logs"
FILTER="SR"

# Create audit directory
mkdir -p "$AUDIT_DIR"

echo "=== NodePing SR Station Cleanup ==="
echo "Timestamp: $TIMESTAMP"
echo "Filter: $FILTER"
echo ""

# Step 1: Pre-deletion audit
echo "[1/4] Creating pre-deletion audit..."
nodeping checks list --filter "$FILTER" > "$AUDIT_DIR/sr-checks-before-$TIMESTAMP.txt"
CHECK_COUNT=$(nodeping checks list --filter "$FILTER" --json | jq '. | length')
echo "      Found $CHECK_COUNT check(s) matching '$FILTER'"
echo ""

# Step 2: Dry run
echo "[2/4] Running dry-run preview..."
nodeping checks delete --filter "$FILTER" --dry-run > "$AUDIT_DIR/sr-deletion-preview-$TIMESTAMP.txt"
echo "      Preview saved to: $AUDIT_DIR/sr-deletion-preview-$TIMESTAMP.txt"
echo ""

# Step 3: Confirmation prompt
echo "[3/4] Ready to delete $CHECK_COUNT check(s)."
read -p "      Continue with deletion? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "      Deletion cancelled."
    exit 0
fi

# Step 4: Execute deletion
echo "[4/4] Executing deletion..."
nodeping checks delete --filter "$FILTER" --force | tee "$AUDIT_DIR/sr-deletion-log-$TIMESTAMP.txt"
echo ""

# Step 5: Post-deletion audit
echo "[5/5] Creating post-deletion audit..."
nodeping checks list --filter "$FILTER" > "$AUDIT_DIR/sr-checks-after-$TIMESTAMP.txt"
REMAINING=$(nodeping checks list --filter "$FILTER" --json | jq '. | length')
echo "      Remaining checks matching '$FILTER': $REMAINING"
echo ""

# Summary
echo "=== Cleanup Complete ==="
echo "Deleted: $(($CHECK_COUNT - $REMAINING)) check(s)"
echo "Audit logs: $AUDIT_DIR/"
echo ""

# List audit files
ls -lh "$AUDIT_DIR/"*-$TIMESTAMP.txt
