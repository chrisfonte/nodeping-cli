# Codex Prompt Artifact — 2026-02-22

## Task
Fix NodePing CLI bulk delete dry-run not honoring `--account`.

## Bug
- `nodeping checks list --account RFC --filter '^SR '` returns 180
- `nodeping checks delete --filter '^SR ' --dry-run --account RFC` finds 0

Cause: `bulkDelete()` calls `listChecks({filter,json:true})` but does not pass `account`.

## Requirements
1) Thread `options.account` into bulkDelete → listChecks call.
2) Add regression test in `test.js` for bulk-delete dry-run with `--account`.
3) Bump version to **1.1.1** and update **CHANGELOG.md**.
4) Re-test live:
   - `nodeping checks list --account RFC --filter '^SR '` => 180
   - `nodeping checks delete --account RFC --filter '^SR ' --dry-run` => shows 180 + a DRY RUN line
5) Commit + push to nodeping-cli repo.

## Notes
- Use minimal change; preserve existing CLI behavior.
- Tests must pass: `npm test`.

## Progress
- Threaded `--account` into bulk delete listing.
- Added regression test for bulk delete account handling.
- Prepared version bump and changelog entry.
- Live commands attempted; both failed with network error reaching NodePing API.
