# Quick Start Guide

Get up and running with the NodePing CLI in 5 minutes.

## 1. Install

```bash
npm install -g nodeping-cli
```

Or clone from source:

```bash
git clone https://github.com/chrisfonte/nodeping-cli.git
cd nodeping-cli
npm link
```

## 2. Configure

Get your API token from [NodePing Account Settings](https://nodeping.com/account.html), then:

```bash
mkdir -p ~/.credentials/nodeping
echo "YOUR_API_TOKEN_HERE" > ~/.credentials/nodeping/api_token
```

## 3. Verify

```bash
nodeping --version
# → nodeping v2.0.0

nodeping accounts list
# Shows your accounts and subaccounts
```

## 4. Explore Your Checks

```bash
# List all checks in the primary account
nodeping checks list

# List checks for a subaccount (by name!)
nodeping checks list --account "My Company"

# Filter checks
nodeping checks list --filter "production"

# Get results for a check
nodeping results CHECK_ID --limit 5

# Get an account summary
nodeping info --account "My Company"
```

## 5. Create a Check

```bash
# HTTP check
nodeping checks create --type HTTP --label "Homepage" --target https://example.com --interval 5

# PING check
nodeping checks create --type PING --label "Server" --target 192.168.1.1

# SSL certificate check
nodeping checks create --type SSL --label "SSL Cert" --target example.com --param warningdays=30
```

## 6. Manage Contacts

```bash
# List notification contacts
nodeping contacts list

# Create a contact
nodeping contacts create --name "Ops Team" --email ops@example.com

# List schedules
nodeping schedules list
```

## 7. Bulk Operations

```bash
# Preview what would be deleted (safe!)
nodeping checks delete --filter "staging" --dry-run

# Actually delete (requires --force)
nodeping checks delete --filter "staging" --force
```

## 8. Interactive Mode

Just run `nodeping` with no arguments to launch the interactive TUI:

```bash
nodeping
```

## Next Steps

- See the full [README.md](README.md) for all commands and options
- Check [examples/](examples/) for scripting examples
- Use `--json` for machine-readable output
- Use `--account "Name"` to target subaccounts by name
