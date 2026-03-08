# SR Station Cleanup Instructions

**Project**: SR Station Shutdown (RFC Media)  
**Deadline**: April 1, 2026  
**Task**: Delete 180 AUDIO monitoring checks from NodePing  
**Cost Impact**: -$360/month (NodePing billing) + RFC Media invoice adjustment  

## Prerequisites

1. ✅ NodePing CLI installed (see README.md for installation instructions)
2. ⏳ API token stored in `~/.credentials/nodeping/api_token`
3. ⏳ Approval from stakeholders to proceed

## Step-by-Step Workflow

### Step 1: Setup Credentials

```bash
# Create credentials directory
mkdir -p ~/.credentials/nodeping

# Add your API token (get from https://nodeping.com/account.html)
echo "YOUR_NODEPING_API_TOKEN_HERE" > ~/.credentials/nodeping/api_token

# Verify
cat ~/.credentials/nodeping/api_token
```

### Step 2: Verify CLI Installation

```bash
# Navigate to your NodePing CLI installation directory
cd /path/to/nodeping-cli
./nodeping --version
# Expected: nodeping v2.0.0

./nodeping --help
# Should show usage information
```

### Step 3: Pre-Deletion Audit

```bash
# Create audit directory
mkdir -p ~/sr-station-cleanup-audit

# Get current timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Export all SR checks (before deletion)
./nodeping checks list --filter "SR" > ~/sr-station-cleanup-audit/sr-checks-before-$TIMESTAMP.txt

# Count SR checks
./nodeping checks list --filter "SR" --json | jq '. | length'

# Review the list
cat ~/sr-station-cleanup-audit/sr-checks-before-$TIMESTAMP.txt
```

**Expected**: ~180 AUDIO checks matching "SR" pattern

### Step 4: Dry-Run Preview

```bash
# Preview what will be deleted (does NOT execute deletion)
./nodeping checks delete --filter "SR" --dry-run

# Save preview to file
./nodeping checks delete --filter "SR" --dry-run > ~/sr-station-cleanup-audit/sr-deletion-preview-$TIMESTAMP.txt
```

**Review carefully**: Verify that ONLY SR station checks are listed. If any non-SR checks appear, adjust the filter pattern.

### Step 5: Final Confirmation

Before executing, verify:

- [ ] Pat/Cruze approved deletion
- [ ] Cruze confirmed which SR stations are NOT used as skinny stations
- [ ] Pre-deletion audit completed
- [ ] Dry-run preview looks correct
- [ ] You have backups of check configurations (CSV export)

### Step 6: Execute Deletion

**⚠️ THIS STEP CANNOT BE UNDONE ⚠️**

```bash
# Execute bulk deletion
./nodeping checks delete --filter "SR" --force | tee ~/sr-station-cleanup-audit/sr-deletion-log-$TIMESTAMP.txt
```

The command will:
1. Fetch all checks matching "SR"
2. Display what will be deleted
3. Delete each check
4. Show progress and summary

### Step 7: Post-Deletion Verification

```bash
# Verify SR checks are gone
./nodeping checks list --filter "SR" > ~/sr-station-cleanup-audit/sr-checks-after-$TIMESTAMP.txt

# Count remaining (should be 0 or minimal)
./nodeping checks list --filter "SR" --json | jq '. | length'

# Export remaining checks
./nodeping checks list --filter "SR" --json > ~/sr-station-cleanup-audit/sr-remaining-$TIMESTAMP.json
```

**Expected Result**: 0 checks (or only checks that are skinny/switch stations)

### Step 8: Generate Final Report

```bash
# Create summary report
cat << EOF > ~/sr-station-cleanup-audit/sr-cleanup-summary-$TIMESTAMP.md
# SR Station Cleanup Summary

**Date**: $(date)
**Executed by**: $(whoami)
**Tool**: NodePing CLI v2.0.0

## Results

- **Before**: $(wc -l < ~/sr-station-cleanup-audit/sr-checks-before-$TIMESTAMP.txt) checks
- **After**: $(wc -l < ~/sr-station-cleanup-audit/sr-checks-after-$TIMESTAMP.txt) checks
- **Deleted**: [CALCULATE DIFFERENCE]

## Audit Trail

- Pre-deletion audit: sr-checks-before-$TIMESTAMP.txt
- Deletion preview: sr-deletion-preview-$TIMESTAMP.txt
- Deletion log: sr-deletion-log-$TIMESTAMP.txt
- Post-deletion audit: sr-checks-after-$TIMESTAMP.txt

## Cost Impact

- NodePing billing reduction: -\$360/month (180 checks × \$2)
- RFC Media invoice adjustment: Update next invoice to reflect check removal

## Next Steps

- [ ] Update RFC Media invoice
- [ ] Notify Pat/Cruze of completion
- [ ] Archive audit logs
- [ ] Update StreamGuys ticket (if applicable)

EOF

# Display summary
cat ~/sr-station-cleanup-audit/sr-cleanup-summary-$TIMESTAMP.md
```

## Using Automated Scripts

If your installation includes automation scripts in the `examples/` directory:

```bash
cd /path/to/nodeping-cli
./examples/sr-station-cleanup.sh  # If available
```

Automation scripts typically:
- Create timestamped audit logs
- Run dry-run previews
- Prompt for confirmation
- Execute deletions
- Generate summaries

## Invoice Adjustment

After deletion:

1. **Calculate pro-rated amount**: 
   - Full month: 180 checks × $2 = $360
   - Pro-rated: ($360 / days_in_month) × days_remaining

2. **Update RFC Media invoice**:
   - Deduct monitoring line item
   - Add note: "SR station checks removed [DATE]"
   - Reference: SR Station Shutdown project

3. **Notify billing contact**:
   - Email: [billing contact]
   - Include: deletion date, check count, amount

## Troubleshooting

### "Could not read API token"

```bash
# Verify file exists
ls -la ~/.credentials/nodeping/api_token

# Check contents (should be a single token string)
cat ~/.credentials/nodeping/api_token
```

### "HTTP 403" error

Your API token is invalid or expired. Get a new one from NodePing account settings.

### "No checks found matching filter"

The filter pattern didn't match any checks. Verify SR checks exist:

```bash
./nodeping checks list --json | jq '.[] | .label' | grep -i sr
```

### Partial deletion / some checks failed

Check the deletion log for errors:

```bash
cat ~/sr-station-cleanup-audit/sr-deletion-log-$TIMESTAMP.txt | grep -i error
```

Re-run deletion on remaining checks:

```bash
./nodeping checks delete --filter "SR" --force
```

## Rollback Plan

**Important**: NodePing check deletion is permanent. There is no built-in undo.

To recreate checks:
1. Use the CSV export from pre-deletion audit
2. Manually recreate checks via NodePing web UI
3. Or use API POST /checks (not yet implemented in CLI)

**Therefore**: Always run dry-run first and verify the preview.

## Contact

- **NodePing Support**: support@nodeping.com
- **CLI Issues**: https://github.com/chrisfonte/nodeping-cli/issues

## Approval Chain

Before executing deletion, ensure you have:

1. **Business approval**: Confirm with stakeholders that SR station shutdown is approved
2. **Technical verification**: Verify which stations should be excluded (e.g., skinny stations)
3. **Execution authorization**: Obtain final approval from technical lead

## Timeline

- **Now**: Setup and testing
- **Before April 1**: Execute deletion
- **April 1, 2026**: Full SR station shutdown at StreamGuys

## Archive

After completion, archive audit logs:

```bash
# Create archive
tar -czf sr-cleanup-audit-$TIMESTAMP.tar.gz ~/sr-station-cleanup-audit/

# Move to your operations/project records directory
mv sr-cleanup-audit-$TIMESTAMP.tar.gz /path/to/your/project-records/

# Update project documentation
# Add completion notes to your project tracking documents
```
