# Codex Prompt — NodePing CLI bugfix (bulk delete --account)

Context:
- Repo: ~/nodeping-cli
- Bug found in v1.1.0 during live test.

Repro:
- `node nodeping checks list --account 20241104045633YKR4TQ --filter "^SR "` returns 180.
- `node nodeping checks delete --filter "^SR " --dry-run --account 20241104045633YKR4TQ` incorrectly finds 0.

Root cause:
- bulkDelete(filter, options) calls `listChecks({ filter, json:true })` and does NOT pass `options.account`, so it queries the default account.

Requirements:
1) Fix: thread account option through bulkDelete -> listChecks so delete path respects `--account`.
2) Add/adjust regression tests in test.js for dry-run bulk delete with --account (can mock listChecks or run in a way that doesn't require live API).
3) Bump version from 1.1.0 -> 1.1.1.
4) Update CHANGELOG.md with the fix.
5) Ensure `node nodeping --help` still works.

Do minimal, clean changes.
