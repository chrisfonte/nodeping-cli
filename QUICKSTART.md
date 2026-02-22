# Quick Start Guide

Get up and running with NodePing CLI in 5 minutes.

## 1. Install

```bash
git clone https://github.com/chrisfonte/nodeping-cli.git
cd nodeping-cli
chmod +x nodeping
```

Optionally, add to your PATH:

```bash
sudo ln -s $(pwd)/nodeping /usr/local/bin/nodeping
```

## 2. Configure Authentication

Create your credentials file:

```bash
mkdir -p ~/.credentials/nodeping
echo "YOUR_API_TOKEN_HERE" > ~/.credentials/nodeping/api_token
```

Get your API token from: https://nodeping.com/account.html

## 3. Verify Installation

```bash
nodeping --version
nodeping --help
```

## 4. Basic Commands

### List all your checks

```bash
nodeping checks list
```

### Filter checks

```bash
# Find all SR station checks
nodeping checks list --filter "SR"

# Find all AUDIO type checks
nodeping checks list --filter "AUDIO"
```

### Preview bulk deletion

```bash
# See what would be deleted (dry-run)
nodeping checks delete --filter "SR" --dry-run
```

### Execute bulk deletion

```bash
# Actually delete matching checks (requires --force)
nodeping checks delete --filter "SR" --force
```

### View check results

```bash
# Get recent results for a specific check
nodeping results YOUR_CHECK_ID

# Get more results
nodeping results YOUR_CHECK_ID --limit 25
```

## 5. SR Station Shutdown Workflow

For the SR station shutdown project:

```bash
# Step 1: Audit current SR checks
nodeping checks list --filter "SR" > sr-audit-before.txt

# Step 2: Preview deletion
nodeping checks delete --filter "SR" --dry-run

# Step 3: Execute deletion (when ready)
nodeping checks delete --filter "SR" --force

# Step 4: Verify deletion
nodeping checks list --filter "SR" > sr-audit-after.txt
```

## Common Patterns

### Get JSON output for scripting

```bash
nodeping checks list --filter "SR" --json | jq '.[] | {id, label, type}'
```

### Count matching checks

```bash
nodeping checks list --filter "SR" --json | jq '. | length'
```

### Delete a single check

```bash
nodeping checks delete CHECK_ID_HERE --force
```

## Safety Features

- `--dry-run` — Preview bulk deletions before executing
- `--force` — Required for all deletions to prevent accidents
- Pattern matching — Only delete exactly what matches your filter

## Troubleshooting

### "Could not read API token"

Make sure the credentials file exists and contains your token:

```bash
cat ~/.credentials/nodeping/api_token
```

### "HTTP 403" error

Your API token is invalid or expired. Get a fresh token from your NodePing account settings.

### "No checks found matching filter"

Your filter pattern didn't match any checks. Try:

```bash
nodeping checks list --json | jq '.[] | .label'
```

## Next Steps

- Read the full [README](README.md) for detailed documentation
- Check the [NodePing API docs](https://nodeping.com/docs-api-overview.html)
- Review [CHANGELOG](CHANGELOG.md) for version history

## Getting Help

- CLI issues: https://github.com/chrisfonte/nodeping-cli/issues
- NodePing API support: support@nodeping.com
