# Codex Prompt — NodePing CLI v1.2 (sync mode + API coverage)

Repo: `~/nodeping-cli`

Goal: Make nodeping-cli a truly shippable general-purpose NodePing tool, not just list/delete.

## Requirements

### A) Add core write operations
Add CLI subcommands (or extend existing):
1. `nodeping checks create ...` — create a check (at least AUDIO + HTTP) with key parameters.
2. `nodeping checks update <id> ...` — update label/interval/enable state/parameters target/threshold/sensitivity.
3. `nodeping checks enable <id>` / `disable <id>` (or `set-status`).
4. `nodeping checks rename <id> <newLabel>`.

Implementation notes:
- Must support `--account` for ALL operations.
- Prefer JSON-first internal representation; keep human output as presentation layer.

### B) Add `sync` command
Add:
- `nodeping sync plan --desired <desired.json> --account <id> [--normalize] [--json]`
- `nodeping sync apply --desired <desired.json> --account <id> [--normalize] --force`

Desired file format:
- Support our existing real-world shape: `desired-nodeping-checks.json` where JSON is `{ "checks": [ ... ] }`.
- For open-source: include a redacted example in `examples/desired-checks.example.json`.

Normalization rules (must be implemented and documented):
- Edge vs origin endpoints
- `-icy` vs `/playlist.m3u8` vs `-mp3` vs no-suffix
- Canonicalize URLs (strip trailing slashes, normalize scheme if safe)
- Optional: follow redirects only in plan mode (no network in tests)

Plan output:
- Must produce counts and lists: create/update/disable/delete.
- Default behavior should be SAFE (plan only). Apply requires `--force`.

### C) Tests
- Extend `test.js` with offline tests for:
  - CLI help includes new commands
  - `sync plan` parses desired JSON and produces deterministic output on a mocked current state.
  - normalization function unit tests.

No live API calls in tests.

### D) Docs + versioning
- Bump version to `1.2.0`.
- Update CHANGELOG.md.
- Update README with:
  - write operations
  - sync plan/apply usage
  - safety notes
  - normalization caveats

### E) Prompt artifact
- Keep this prompt file in `prompts/` (already created).

## Constraints
- No RFC-specific IDs or files should be required to use the CLI.
- Keep the CLI installable via npm as it is.

Deliverable: PR-quality commits in this repo with working tests.
