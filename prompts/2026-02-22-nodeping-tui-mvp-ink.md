# Codex Prompt — NodePing TUI MVP (Ink)

Repo: `~/nodeping-cli` (Node.js CLI already exists)

Goal: Add an **OpenCode-like terminal UI (TUI)** for NodePing CLI using **Ink** (React for terminal).

## High-level approach
- Keep the existing `nodeping` CLI as-is.
- Add a new executable command: `nodeping tui`.
- TUI can call internal JS functions OR shell out to `nodeping ... --json` commands.
  - Prefer internal functions if clean; otherwise shell-out is acceptable for MVP.

## MVP Features
1) **Account picker**
   - Fetch `accounts list` (subaccounts) and allow selection.
   - Default to last used account (persist in a local state file under `~/.config/nodeping-cli/state.json`).

2) **Checks list view**
   - List checks with columns: label, type, enabled/disabled, target (short), interval.
   - Live filter/search input.
   - Keyboard navigation (up/down, enter to view details).

3) **Details pane**
   - Show full details for selected check.
   - Show last modified, status, notifications summary, etc.

4) **Results view**
   - Press `r` to fetch and show last N results for selected check.
   - N default 10; allow changing.

5) **Safe actions (read-only by default)**
   - Actions allowed in MVP: enable/disable, rename.
   - For anything destructive (delete/bulk delete/apply sync): DO NOT implement in MVP.
   - Add a placeholder menu item "Delete (coming soon)".

6) **Exit**
   - `q` to quit.

## Safety / non-goals
- No delete/bulk delete.
- No sync apply.
- No writing secrets.
- Don't print API token.

## Implementation details
- Add dependencies: `ink`, `ink-text-input` (or equivalent), `ink-select-input`.
- Add `src/` folder if helpful.
- Ensure `npm test` still passes.
- Add a minimal `tui.test.js` or extend `test.js` to assert `nodeping tui --help` works.
- Update README: add a "TUI" section with keybindings.

## Deliverables
- Working `nodeping tui` command.
- Docs: README + CHANGELOG entry.
- Version bump to `1.3.0`.

Do clean, minimal, shippable code.
