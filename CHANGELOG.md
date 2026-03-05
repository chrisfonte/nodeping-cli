# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-03-05

### Added

- **Account name resolution** — `--account "My Company"` now works alongside account IDs. Partial name matching supported.
- **Contacts management** — `contacts list`, `contacts get`, `contacts create`, `contacts update`, `contacts delete` commands.
- **Schedules management** — `schedules list`, `schedules get`, `schedules create`, `schedules delete` commands.
- **Account info command** — `info` shows account summary with check type breakdown.
- **Notification settings on check creation** — `--contact ID[:DELAY[:SCHEDULE]]` and `--location LOC` flags.
- **Extended check type support** — PING, DNS, SSL, PORT types documented with examples (all types work via `--type`).
- **Professional documentation** — Comprehensive README, QUICKSTART guide, and examples.
- **Improved error messages** — Unknown options now suggest `--help`, account resolution errors show available accounts.

### Changed

- Version bumped to 2.0.0 (breaking: account resolution behavior).
- URL encoding for API token and account IDs in requests (fixes issues with special characters).
- Help text rewritten with grouped commands, all options documented, and copy-pasteable examples.
- PII removed from all documentation and examples.

### Fixed

- `--account "Name With Spaces"` no longer causes "unescaped characters" error.
- POST/PUT request body encoding now correctly sends data.

## [1.3.0] - 2026-02-22

### Added

- Interactive TUI with Ink (React-based terminal UI).
- Account picker, checks browser, results viewer in TUI.
- Enable/disable and rename operations in TUI.

## [1.2.0] - 2026-02-22

### Added

- `checks create` — Create new checks (HTTP, AUDIO types).
- `checks update` — Update check label, interval, parameters.
- `checks enable` / `checks disable` — Toggle checks without deletion.
- `checks rename` — Update check labels.
- `sync plan` / `sync apply` — Declarative check management from JSON files.
- URL normalization for sync comparison (edge/origin, stream suffixes).

## [1.1.1] - 2026-02-22

### Fixed

- Bulk delete now correctly respects `--account` flag.

## [1.1.0] - 2026-02-22

### Added

- Bulk delete with `--filter` pattern.
- `--dry-run` mode for previewing bulk operations.
- `--force` flag for confirming destructive operations.

## [1.0.0] - 2026-02-22

### Added

- Initial release.
- `checks list` with `--filter` and `--json` support.
- `checks delete` for single check deletion.
- `accounts list` for viewing subaccounts.
- `results` for viewing check results with `--limit`.
- Subaccount support via `--account` flag (ID only).
- Color-coded terminal output.
- API token from `~/.credentials/nodeping/api_token`.
