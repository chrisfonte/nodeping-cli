# NodePing CLI

A command-line interface for the [NodePing](https://nodeping.com) monitoring API. Manage monitoring checks, view results, and perform bulk operations from the terminal.

## Features

- ✅ List all monitoring checks with filtering
- ✅ Delete single or bulk checks
- ✅ Dry-run mode for bulk deletions
- ✅ View recent check results
- ✅ JSON output mode for scripting
- ✅ Zero external dependencies (Node.js stdlib only)
- ✅ Single-file CLI for easy deployment

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

## Command Reference

### `nodeping checks list [options]`

List all monitoring checks or filter by pattern.

**Options:**
- `--filter PATTERN` — Filter checks by label, target, or type (regex)
- `--json` — Output in JSON format

### `nodeping checks delete <id> [options]`

Delete a single check by ID.

**Options:**
- `--force` — Confirm deletion (required)

### `nodeping checks delete --filter PATTERN [options]`

Bulk delete checks matching a filter pattern.

**Options:**
- `--filter PATTERN` — Filter pattern to match checks
- `--dry-run` — Preview deletion without executing
- `--force` — Confirm deletion (required for execution)

### `nodeping results <check-id> [options]`

Show recent results for a specific check.

**Options:**
- `--limit N` — Number of results to show (default: 10)
- `--json` — Output in JSON format

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

## Development

The CLI is designed as a single-file Node.js script with zero external dependencies. It uses only Node.js stdlib modules:

- `https` — API requests
- `fs` — Read credentials file
- `path` — File path handling
- `os` — Home directory resolution

## Roadmap

- [x] List checks with filtering
- [x] Delete single check
- [x] Bulk delete with dry-run
- [x] View check results
- [ ] Create new checks
- [ ] Update check configuration
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
