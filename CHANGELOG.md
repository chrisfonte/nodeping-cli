# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
