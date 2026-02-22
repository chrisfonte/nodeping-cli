# Examples

This directory contains example scripts demonstrating how to use the NodePing CLI.

## Scripts

### `sr-station-cleanup.sh`

**Purpose**: Safely delete all SR station monitoring checks with full audit trail.

**Features**:
- Pre-deletion audit
- Dry-run preview
- Interactive confirmation
- Execution logging
- Post-deletion verification

**Usage**:
```bash
./sr-station-cleanup.sh
```

**Output**: Creates timestamped audit logs in `./audit-logs/`

---

### `export-checks-csv.sh`

**Purpose**: Export NodePing checks to CSV format for analysis.

**Usage**:
```bash
# Export all checks
./export-checks-csv.sh

# Export filtered checks
./export-checks-csv.sh "SR" sr-checks.csv

# Export AUDIO checks
./export-checks-csv.sh "AUDIO" audio-checks.csv
```

**Output**: CSV file with columns: ID, Label, Type, Target, State, Enabled, Interval

---

### `check-status-report.sh`

**Purpose**: Generate a summary report of all monitoring checks.

**Features**:
- Total check count
- Status breakdown (passing/failing)
- Check type distribution
- Enabled/disabled count
- List of currently failing checks

**Usage**:
```bash
./check-status-report.sh
```

**Example Output**:
```
=== NodePing Status Report ===
Generated: Sat Feb 21 19:30:00 EST 2026

Total Checks: 245

Status Breakdown:
  ✓ Passing: 238
  ✗ Failing: 7

Check Types:
  AUDIO: 180
  HTTP: 45
  PING: 15
  SSL: 5

Enabled Status:
  Active: 240
  Disabled: 5

Currently Failing Checks:
  [HTTP] Example Site - https://example.com
  [AUDIO] SR Station X - https://stream.example.com/sr-x.mp3
```

---

## Prerequisites

All scripts require:
- `nodeping` CLI installed and in PATH
- Valid API token in `~/.credentials/nodeping/api_token`
- `jq` for JSON processing (install via `brew install jq` on macOS)

## Making Scripts Executable

```bash
chmod +x examples/*.sh
```

## Best Practices

1. **Always run dry-run first** before bulk deletions
2. **Keep audit logs** for compliance and troubleshooting
3. **Use filters carefully** to avoid unintended deletions
4. **Export before delete** to have a backup of check configurations
5. **Verify after changes** using status reports

## Customization

These scripts are templates. Customize them for your use case:

- Change `FILTER` variable to match your naming convention
- Adjust CSV columns for your reporting needs
- Add email/Slack notifications after operations
- Schedule with cron for regular status reports

## Integration

These scripts can be integrated into:
- Overnight automation routines
- Infrastructure monitoring dashboards
- CI/CD pipelines for health checks
- Incident response workflows

## Contributing

Have a useful script? Submit a pull request with:
- Clear documentation
- Error handling
- Example usage
- Expected output
