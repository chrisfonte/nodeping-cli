# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-02-22

### Added
- **Write operations**: `checks create`, `checks update`, `checks enable/disable`, and `checks rename`
- **Sync workflow**: `sync plan` and `sync apply` for desired-state management
- **Normalization engine**: target normalization for edge/origin endpoints and stream suffix variants
- **Offline sync planning**: `--current` flag to plan against a local checks JSON file
- **Extended tests**: sync plan determinism and normalization unit tests

### Changed
- CLI help and README updated to document write and sync operations

## [1.1.1] - 2026-02-22

### Fixed
- Bulk delete dry-run now respects `--account` when filtering checks

## [1.1.0] - 2026-02-22

### Added
- **Subaccount support**: `--account` flag to specify customerid for all commands
- **`accounts list` command**: View all subaccounts with status and details
- **Comprehensive error handling**: Specific error messages for authentication, network, and API errors
- **Test suite**: Basic automated tests covering CLI functionality (`node test.js`)
- **GitHub templates**: Issue templates (bug report, feature request) and PR template
- **CONTRIBUTING.md**: Comprehensive contribution guide with development workflow
- **Enhanced help text**: All commands now documented with examples
- **npx support**: Can be run with `npx nodeping-cli` after publishing

### Fixed
- **Results command bug**: Fixed date parsing error in `results` command (API response structure mismatch)
- **Error messages**: Improved error messages for all failure modes (401, 403, 404, network errors)
- **PII removal**: Genericized all hardcoded user paths in SR_CLEANUP_INSTRUCTIONS.md

### Changed
- Updated `package.json` with proper npm metadata, keywords, and test script
- Version bumped to 1.1.0 for production-ready release
- Enhanced README with subaccount examples
- Improved help text consistency across all subcommands

### Technical Improvements
- Better API response handling with nested doc structure support
- Network error detection (ENOTFOUND, ECONNREFUSED)
- HTTP status code specific error messages
- Account ID parameter support in all API requests

### Documentation
- Added cross-references to NodePing API research documentation (internal)
- Updated examples with subaccount usage patterns
- Professional tone audit across all documentation

## [1.0.0] - 2026-02-21

### Added
- Initial release of NodePing CLI
- `checks list` command with filtering support
- `checks delete` command for single check deletion
- `checks delete --filter` for bulk deletion with dry-run mode
- `results` command to view check results
- JSON output mode for all commands
- Color-coded terminal output for better readability
- Zero external dependencies (Node.js stdlib only)
- Single-file CLI for easy deployment
- MIT License
- Comprehensive README with examples

### Features
- Regex-based filtering on check label, target, and type
- Dry-run mode to preview bulk deletions before executing
- Safety flags (`--force`) to prevent accidental deletions
- Configurable result limits
- Human-readable and JSON output formats
- Credential management via `~/.credentials/nodeping/api_token`

### Use Case
- Built specifically for SR station shutdown project
- Enables bulk deletion of 180 AUDIO monitoring checks
- Provides audit trail and dry-run capabilities for safe operations
