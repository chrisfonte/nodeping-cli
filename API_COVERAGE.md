# NodePing API Coverage

Tracks which NodePing API features are implemented in the CLI.

## Implemented ✅

### Checks Management
- ✅ `GET /checks` — List all checks (`checks list`)
- ✅ `POST /checks` — Create new checks (`checks create`)
- ✅ `PUT /checks/{id}` — Update existing checks (`checks update`)
- ✅ `DELETE /checks/{id}` — Delete a check (`checks delete`)
- ✅ Bulk delete with filter (`checks delete --filter`)
- ✅ Enable/disable (`checks enable`, `checks disable`)
- ✅ Rename (`checks rename`)
- ✅ All check types supported via `--type` (HTTP, AUDIO, PING, DNS, SSL, PORT, AGENT, PUSH, etc.)
- ✅ Notification contacts on check creation (`--contact`)
- ✅ Run locations (`--location`)

### Results
- ✅ `GET /results/{id}` — Get check results (`results`)
- ✅ Result limiting (`--limit`)

### Contacts
- ✅ `GET /contacts` — List all contacts (`contacts list`)
- ✅ `GET /contacts/{id}` — Get specific contact (`contacts get`)
- ✅ `POST /contacts` — Create contact (`contacts create`)
- ✅ `PUT /contacts/{id}` — Update contact (`contacts update`)
- ✅ `DELETE /contacts/{id}` — Delete contact (`contacts delete`)

### Schedules
- ✅ `GET /schedules` — List notification schedules (`schedules list`)
- ✅ `GET /schedules/{id}` — Get specific schedule (`schedules get`)
- ✅ `PUT /schedules/{id}` — Create/update schedule (`schedules create`)
- ✅ `DELETE /schedules/{id}` — Delete schedule (`schedules delete`)

### Account Management
- ✅ `GET /accounts` — List subaccounts (`accounts list`)
- ✅ Account name resolution — Use names instead of IDs (`--account "My Company"`)

### Sync Engine
- ✅ Declarative check management from JSON (`sync plan`, `sync apply`)
- ✅ Target normalization for comparison

### Output & Safety
- ✅ JSON output (`--json`)
- ✅ Human-readable color output
- ✅ Dry-run mode (`--dry-run`)
- ✅ Force confirmation (`--force`)
- ✅ Account info summary (`info`)

## Not Yet Implemented 🚧

### Account Management
- ⏳ `POST /accounts` — Create subaccounts
- ⏳ `PUT /accounts/{id}` — Update subaccount settings

### Advanced Features
- ⏳ Contact groups
- ⏳ Check dependencies
- ⏳ Uptime reports
- ⏳ Notification history
- ⏳ Maintenance windows

## Coverage Statistics

- **Implemented Endpoints**: 15 (GET/POST/PUT/DELETE across checks, contacts, schedules, accounts, results)
- **Coverage**: ~50% of full API

## Last Updated

- **Date**: 2026-03-05
- **CLI Version**: 2.0.0
