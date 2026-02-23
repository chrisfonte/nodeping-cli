# NodePing CLI

A command-line interface for the [NodePing](https://nodeping.com) monitoring API. Manage monitoring checks, view results, and perform bulk operations from the terminal.

## Features

- ✅ List all monitoring checks with filtering
- ✅ Subaccount support for multi-account management
- ✅ Delete single or bulk checks with safety guards
- ✅ Create, update, enable/disable, and rename checks
- ✅ Desired-state sync with plan/apply workflow
- ✅ Dry-run mode for safe bulk operations
- ✅ View recent check results with detailed status
- ✅ JSON output mode for scripting and automation
- ✅ Interactive TUI for browsing checks (`nodeping tui`)
- ✅ Comprehensive error handling with actionable messages
- ✅ Minimal dependencies (Ink-based TUI)
- ✅ Core CLI remains single-file for easy deployment
- ✅ Production-ready with automated tests

## Installation

### Prerequisites

- Node.js v14 or higher
- A NodePing account with API access

### Install

```bash
# Clone the repository
git clone https://github.com/chrisfonte/nodeping-cli.git
cd nodeping-cli

# Make the CLI executable
chmod +x nodeping

# Optional: Add to your PATH
sudo ln -s $(pwd)/nodeping /usr/local/bin/nodeping
```

## Authentication

Create a credentials file with your NodePing API token:

```bash
mkdir -p ~/.credentials/nodeping
echo "YOUR_API_TOKEN" > ~/.credentials/nodeping/api_token
```

Get your API token from: [https://nodeping.com/account.html](https://nodeping.com/account.html)

## Usage

### TUI (Interactive)

Launch the terminal UI:

```bash
nodeping
nodeping tui
```

Keybindings:
- `↑/↓` Move selection
- `Enter` Select menu item
- `q` or `Esc` Back / quit current screen
- `Ctrl+C` Quit immediately

TUI menus:
- Main: `Checks`, `Results`, `Account`, `Quit`
- Checks: `List All`, `Filter by Pattern`, `View Details`, `Delete`
- Results: `View Recent Results`, `View by Check`
- Account: `Account Info`

### List All Checks

```bash
# List all monitoring checks
nodeping checks list

# List checks in JSON format
nodeping checks list --json
```

### Filter Checks

```bash
# Filter checks by pattern (matches label, target, or type)
nodeping checks list --filter "SR"
nodeping checks list --filter "AUDIO"
nodeping checks list --filter "example.com"
```

### Delete a Single Check

```bash
# Delete a specific check by ID (requires --force)
nodeping checks delete 201205050153W2Q4C-0J2HSIRF --force
```

### Create Checks

```bash
# Create an HTTP check
nodeping checks create --type HTTP --label "Homepage" --target https://example.com --interval 5

# Create an AUDIO check
nodeping checks create --type AUDIO --label "Stream" --target https://stream.example.com/live --interval 5 --threshold 15 --sensitivity 3
```

### Update Checks

```bash
# Update label and interval
nodeping checks update 201205050153W2Q4C-0J2HSIRF --label "New Label" --interval 10

# Update target parameters
nodeping checks update 201205050153W2Q4C-0J2HSIRF --target https://example.com/health --method GET --status 200
```

### Enable/Disable Checks

```bash
nodeping checks enable 201205050153W2Q4C-0J2HSIRF
nodeping checks disable 201205050153W2Q4C-0J2HSIRF
```

### Rename Checks

```bash
nodeping checks rename 201205050153W2Q4C-0J2HSIRF "Station East"
```

### Bulk Delete Checks

```bash
# Preview deletion (dry-run)
nodeping checks delete --filter "SR" --dry-run

# Execute bulk deletion (requires --force)
nodeping checks delete --filter "SR" --force
```

### View Check Results

```bash
# Show last 10 results for a check
nodeping results 201205050153W2Q4C-0J2HSIRF

# Show last 25 results
nodeping results 201205050153W2Q4C-0J2HSIRF --limit 25

# Get results in JSON format
nodeping results 201205050153W2Q4C-0J2HSIRF --json
```

### Desired-State Sync

```bash
# Plan changes against a desired JSON file
nodeping sync plan --desired examples/desired-checks.example.json --normalize

# Apply the plan (requires --force)
nodeping sync apply --desired examples/desired-checks.example.json --normalize --force
```

Desired files support the shape:

```json
{
  "checks": [
    {
      "label": "Homepage",
      "type": "HTTP",
      "interval": 5,
      "enable": "active",
      "parameters": {
        "target": "https://example.com"
      }
    }
  ]
}
```

### Subaccount Management

```bash
# List all subaccounts
nodeping accounts list

# List checks for a specific subaccount
nodeping checks list --account 20240908165130J79077

# Delete checks on a subaccount
nodeping checks delete 201205050153W2Q4C-0J2HSIRF --force --account 20240908165130J79077

# View results for a check on a subaccount
nodeping results 201205050153W2Q4C-0J2HSIRF --account 20240908165130J79077
```

## Command Reference

### `nodeping checks list [options]`

List all monitoring checks or filter by pattern.

**Options:**
- `--filter PATTERN` — Filter checks by label, target, or type (regex)
- `--account ID` — List checks for a specific subaccount
- `--json` — Output in JSON format

### `nodeping checks delete <id> [options]`

Delete a single check by ID.

**Options:**
- `--force` — Confirm deletion (required)
- `--account ID` — Delete check from a specific subaccount

### `nodeping checks delete --filter PATTERN [options]`

Bulk delete checks matching a filter pattern.

**Options:**
- `--filter PATTERN` — Filter pattern to match checks
- `--dry-run` — Preview deletion without executing
- `--force` — Confirm deletion (required for execution)
- `--account ID` — Delete checks from a specific subaccount

### `nodeping checks create [options]`

Create a new check. At minimum provide `--type`, `--label`, and `--target`.

**Options:**
- `--type TYPE` — Check type (HTTP, AUDIO, etc.)
- `--label LABEL` — Check label
- `--target TARGET` — Target URL or host
- `--interval N` — Check interval in minutes
- `--enable` / `--disable` — Initial enable state
- `--threshold N` — AUDIO threshold parameter
- `--sensitivity N` — AUDIO sensitivity parameter
- `--method METHOD` — HTTP method (GET, HEAD)
- `--status CODE` — Expected HTTP status code
- `--param key=value` — Extra parameter (repeatable)
- `--account ID` — Create the check in a specific subaccount

### `nodeping checks update <id> [options]`

Update an existing check.

**Options:**
- `--label LABEL` — Update label
- `--interval N` — Update interval
- `--enable` / `--disable` — Update enable state
- `--target TARGET` — Update target
- `--threshold N` — AUDIO threshold parameter
- `--sensitivity N` — AUDIO sensitivity parameter
- `--method METHOD` — HTTP method (GET, HEAD)
- `--status CODE` — Expected HTTP status code
- `--param key=value` — Extra parameter (repeatable)
- `--account ID` — Update a check in a specific subaccount

### `nodeping checks enable <id> [options]`

Enable a check without modifying other parameters.

**Options:**
- `--account ID` — Enable a check in a specific subaccount

### `nodeping checks disable <id> [options]`

Disable a check without deleting it.

**Options:**
- `--account ID` — Disable a check in a specific subaccount

### `nodeping checks rename <id> <newLabel> [options]`

Rename a check label.

**Options:**
- `--account ID` — Rename a check in a specific subaccount

### `nodeping accounts list [options]`

List all subaccounts.

**Options:**
- `--json` — Output in JSON format

### `nodeping results <check-id> [options]`

Show recent results for a specific check.

**Options:**
- `--limit N` — Number of results to show (default: 10)
- `--account ID` — Get results for a check on a specific subaccount
- `--json` — Output in JSON format

### `nodeping sync plan [options]`

Compare a desired checks file against current checks and output a plan.

**Options:**
- `--desired FILE` — Desired checks JSON file
- `--normalize` — Normalize targets before comparison
- `--current FILE` — Use a local current checks JSON file (offline)
- `--account ID` — Plan against a specific subaccount
- `--json` — Output the plan in JSON format

### `nodeping sync apply [options]`

Apply changes from a desired checks file (requires `--force`).

**Options:**
- `--desired FILE` — Desired checks JSON file
- `--normalize` — Normalize targets before comparison
- `--account ID` — Apply against a specific subaccount
- `--force` — Confirm apply (required)

## Use Case: SR Station Shutdown

This tool was built to help with the SR station shutdown project, which requires deleting 180 AUDIO monitoring checks.

### Workflow

1. **Audit**: See which SR checks exist
   ```bash
   nodeping checks list --filter "SR" > sr-checks-audit.txt
   ```

2. **Preview**: Dry-run to confirm what will be deleted
   ```bash
   nodeping checks delete --filter "SR" --dry-run
   ```

3. **Execute**: Delete all SR checks
   ```bash
   nodeping checks delete --filter "SR" --force
   ```

4. **Verify**: Confirm deletion
   ```bash
   nodeping checks list --filter "SR"
   ```

## API Documentation

This CLI wraps the NodePing REST API. For more details on the API:

- [NodePing API Overview](https://nodeping.com/docs-api-overview.html)
- [NodePing Checks API](https://nodeping.com/docs-api-checks.html)
- [NodePing Results API](https://nodeping.com/docs-api-results.html)

## Security Notes

- **Never commit your API token** to version control
- Store credentials in `~/.credentials/nodeping/api_token` (gitignored)
- Use limited-access tokens when possible
- Review deletions with `--dry-run` before using `--force`
- `sync apply` will delete checks that are not present in the desired file; always run `sync plan` first

## Normalization Notes

When `--normalize` is enabled, the sync logic:

- Treats edge and origin endpoints as equivalent by normalizing edge hosts to origin.
- Collapses stream suffix variants (`-icy`, `-mp3`, `/playlist.m3u8`) to a canonical target.
- Strips trailing slashes and normalizes default ports.

If you rely on distinct edge vs origin targets or suffix-specific endpoints, omit `--normalize`.

## Development

The core CLI remains a single-file Node.js script with stdlib-only dependencies. The TUI is implemented in `src/tui.js` and uses Ink.

Core stdlib modules:
- `https` — API requests
- `fs` — Read credentials file
- `path` — File path handling
- `os` — Home directory resolution

TUI dependencies:
- `ink`
- `ink-text-input`
- `ink-select-input`

## Roadmap

- [x] List checks with filtering
- [x] Delete single check
- [x] Bulk delete with dry-run
- [x] View check results
- [x] Create new checks
- [x] Update check configuration
- [x] Enable/disable/rename checks
- [x] Desired-state sync (plan/apply)
- [ ] Manage contacts and contact groups
- [ ] Interactive mode for bulk operations

## License

MIT License - see [LICENSE](LICENSE)

## Author

Chris Fonte ([@chrisfonte](https://github.com/chrisfonte))

Built for Fontastic LLC operations.

## Contributing

Contributions welcome! Please open an issue or pull request.

## Support

For NodePing API issues, contact: [support@nodeping.com](mailto:support@nodeping.com)

For CLI issues, open a GitHub issue: [chrisfonte/nodeping-cli/issues](https://github.com/chrisfonte/nodeping-cli/issues)
