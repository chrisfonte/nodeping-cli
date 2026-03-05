# NodePing CLI

A powerful command-line interface for the [NodePing](https://nodeping.com) monitoring API. Manage checks, contacts, schedules, and subaccounts from your terminal.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org)

## Features

- **Check Management** — List, create, update, delete, enable/disable, rename checks
- **Bulk Operations** — Filter and delete multiple checks with dry-run preview
- **Contact Management** — List, create, update, delete notification contacts
- **Schedule Management** — View and manage notification schedules
- **Subaccount Support** — All commands work with subaccounts by name or ID
- **Sync Engine** — Declarative check management from JSON files
- **Interactive TUI** — Terminal UI for browsing checks and results
- **Multiple Output Formats** — Human-readable with color or JSON for scripting
- **Safety First** — Dry-run mode, force flags, and clear confirmations

## Quick Start

```bash
# Install globally
npm install -g nodeping-cli

# Set up your API token
mkdir -p ~/.credentials/nodeping
echo "YOUR_API_TOKEN" > ~/.credentials/nodeping/api_token

# List your accounts
nodeping accounts list

# List checks for a subaccount
nodeping checks list --account "My Company"

# Get an account summary
nodeping info
```

Get your API token from [NodePing Account Settings](https://nodeping.com/account.html).

See [QUICKSTART.md](QUICKSTART.md) for a detailed getting-started guide.

## Installation

### npm (recommended)

```bash
npm install -g nodeping-cli
```

### From source

```bash
git clone https://github.com/chrisfonte/nodeping-cli.git
cd nodeping-cli
npm link
```

### Requirements

- Node.js >= 14.0.0
- A [NodePing](https://nodeping.com) account with an API token

## Commands

### Checks

```bash
# List all checks
nodeping checks list

# List checks for a named subaccount
nodeping checks list --account "My Company"

# Filter checks by label, target, or type
nodeping checks list --filter "production"

# Create an HTTP check
nodeping checks create --type HTTP --label "Homepage" --target https://example.com --interval 5

# Create a PING check
nodeping checks create --type PING --label "Server" --target 192.168.1.1

# Create a DNS check
nodeping checks create --type DNS --label "DNS" --target example.com --param contentstring=93.184.216.34

# Create an SSL certificate check
nodeping checks create --type SSL --label "SSL Cert" --target example.com --param warningdays=30

# Create a PORT check
nodeping checks create --type PORT --label "SSH" --target example.com --port 22

# Update a check
nodeping checks update CHECK_ID --interval 10 --label "New Label"

# Enable/disable a check
nodeping checks enable CHECK_ID
nodeping checks disable CHECK_ID

# Rename a check
nodeping checks rename CHECK_ID "New Name"

# Delete a single check
nodeping checks delete CHECK_ID --force

# Preview bulk deletion (dry run)
nodeping checks delete --filter "test-" --dry-run --account "My Company"

# Execute bulk deletion
nodeping checks delete --filter "test-" --force --account "My Company"
```

### Contacts

```bash
# List all contacts
nodeping contacts list

# List contacts for a subaccount
nodeping contacts list --account "My Company" --json

# Get a specific contact
nodeping contacts get CONTACT_ID

# Create a contact with email
nodeping contacts create --name "Ops Team" --email ops@example.com --role notify

# Create a contact with webhook
nodeping contacts create --name "Slack Alerts" --webhook https://hooks.slack.com/... --role notify

# Update a contact
nodeping contacts update CONTACT_ID --name "New Name"

# Delete a contact
nodeping contacts delete CONTACT_ID --force
```

### Schedules

```bash
# List notification schedules
nodeping schedules list

# Get a specific schedule
nodeping schedules get "Business Hours"

# Create/update a schedule
nodeping schedules create "Business Hours" --data '{"data":{"monday":{"time1":"9:00","time2":"17:00","exclude":false},"tuesday":{"time1":"9:00","time2":"17:00","exclude":false},"wednesday":{"time1":"9:00","time2":"17:00","exclude":false},"thursday":{"time1":"9:00","time2":"17:00","exclude":false},"friday":{"time1":"9:00","time2":"17:00","exclude":false},"saturday":{"disabled":true},"sunday":{"disabled":true}}}'

# Delete a schedule
nodeping schedules delete "Old Schedule" --force
```

### Accounts

```bash
# List all subaccounts
nodeping accounts list

# List accounts as JSON
nodeping accounts list --json
```

### Results

```bash
# View recent results for a check
nodeping results CHECK_ID --limit 10

# Results as JSON
nodeping results CHECK_ID --limit 5 --json --account "My Company"
```

### Info

```bash
# Account summary (checks, contacts, schedules)
nodeping info

# Summary for a subaccount
nodeping info --account "My Company"

# Summary as JSON
nodeping info --account "My Company" --json
```

### Sync

Declarative check management — define desired state in a JSON file and sync.

```bash
# Preview changes
nodeping sync plan --desired desired-checks.json --normalize

# Apply changes (requires --force)
nodeping sync apply --desired desired-checks.json --normalize --force --account "My Company"
```

See [examples/desired-checks.example.json](examples/desired-checks.example.json) for the expected format.

### Interactive TUI

```bash
# Launch the interactive terminal UI
nodeping
# or
nodeping tui
```

The TUI provides menu-driven access to browse accounts, checks, results, and perform common operations.

## Global Options

| Option | Description |
|--------|-------------|
| `--account ID\|NAME` | Target a subaccount (by ID or name) |
| `--json` | Output in JSON format (for scripting) |
| `--force` | Confirm destructive operations |
| `--dry-run` | Preview bulk operations without executing |
| `--version` | Show version |
| `--help` | Show help |

## Subaccount Support

All commands accept `--account` with either a subaccount **ID** or **name**:

```bash
# These are equivalent
nodeping checks list --account YOUR_ACCOUNT_ID
nodeping checks list --account "My Company"

# Partial name matching works too
nodeping checks list --account "Company"
```

## Configuration

The CLI reads your API token from:

```
~/.credentials/nodeping/api_token
```

This file should contain only the API token string. Get your token from [NodePing Account Settings](https://nodeping.com/account.html).

## Supported Check Types

The CLI supports creating and managing all NodePing check types. Common types:

| Type | Description | Key Parameters |
|------|-------------|----------------|
| `HTTP` | HTTP/HTTPS endpoint monitoring | `--target`, `--method`, `--status` |
| `PING` | ICMP ping monitoring | `--target` |
| `DNS` | DNS record monitoring | `--target`, `--param contentstring=...` |
| `SSL` | SSL certificate monitoring | `--target`, `--param warningdays=N` |
| `PORT` | TCP port monitoring | `--target`, `--port N` |
| `AUDIO` | Audio stream monitoring | `--target`, `--threshold`, `--sensitivity` |

Any check type supported by the NodePing API can be used with `--type`. Additional parameters can be passed with `--param key=value`.

## Scripting Examples

```bash
# Export all checks as JSON
nodeping checks list --json > checks-backup.json

# Count checks by type
nodeping checks list --json | jq 'group_by(.type) | map({type: .[0].type, count: length})'

# Find all failing checks
nodeping checks list --json | jq '[.[] | select(.state != 1)]'

# Export contacts
nodeping contacts list --account "My Company" --json > contacts.json

# Bulk operations with jq
nodeping checks list --json --filter "staging" | jq -r '.[].id' | while read id; do
  nodeping checks disable "$id"
done
```

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE) © Chris Fonte
