---
Title: NodePing TUI QA Spec
Owner: Chris
Created: 2026-02-22
Last Updated: 2026-02-22
Version: 0.1
Status: ACTIVE
Scope: nodeping-cli v1.3.0+
---

# NodePing TUI QA Spec

## Purpose
Provide a repeatable QA/acceptance checklist for the Ink-based TUI (`nodeping tui`) so we don’t rely on memory of commands.

## Non‑Goals (MVP Safety Contract)
- No delete / bulk delete
- No sync apply
- No printing secrets (API token)

## Pre-reqs
- NodePing API token present at `~/.credentials/nodeping/api_token`
- Repo: `~/nodeping-cli`

## Quick Smoke Test (10–15 min)

### 1) Launch
```bash
cd ~/nodeping-cli
node nodeping tui
```

### 2) Account picker
- Press `a`
- Pick account: **RFC Media**
- Quit (`q`) and relaunch
- Expected: last used account persists in `~/.config/nodeping-cli/state.json`

### 3) Checks list + filter
- Expected: checks load and are navigable via ↑/↓
- Filter to SR checks (e.g., type `SR `)
- Expected: list narrows; SR set appears (historically ~180)

### 4) Details pane
- Move selection up/down
- Expected: details update (label, type, target, interval, enable state)

### 5) Results view
- On a selected check press `r`
- Expected: last N results show (default N=10)

### 6) Safe actions
- Enable/disable: press `e` on a check
  - Expected: enable state toggles and UI reflects it
- Rename: press `n`, enter a new label
  - Expected: label updates and persists

### 7) Safety verification
- Confirm there is no delete action in UI.

## Regression Checklist (before releases)
- `npm test`
- `node nodeping tui --help` renders
- Confirm `state.json` is not written into the repo
- Confirm no secrets printed in logs

## Known constraints
- TUI uses the API; if NodePing is unreachable, UI should show a clear error.

