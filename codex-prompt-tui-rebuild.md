# Codex Prompt: Rebuild NodePing CLI TUI with Ink

## Context

You are rebuilding the NodePing CLI TUI based on comprehensive research findings.

**Current State:**
- Location: `/Users/chrisfonte/nodeping-cli/nodeping`
- The CLI has a TUI mode (when run with no args) that uses raw readline + ANSI codes
- Current TUI is janky: arrow-key navigation rough, screen flickers, sometimes hangs on quit
- The CLI also has direct command mode (e.g., `nodeping checks list --filter X`)

**Issues with Current TUI:**
1. Janky arrow-key navigation (using manual readline.emitKeypressEvents)
2. Screen flickers (clearScreen() on every transition)
3. Sometimes hangs on quit (stdin listeners not cleaned up properly)
4. Hard to maintain (manual state management for every menu)

**Research Recommendation:**
Use **Ink** (React for CLIs) to rebuild the TUI. Research doc: `/Users/chrisfonte/operations/docs/04-professional/research/ai-tools-research/nodejs-tui-development/nodejs-tui-best-practices-research.md`

**Key Benefits of Ink:**
- Component-based architecture (React patterns)
- Proper rendering (no flicker, double-buffered)
- Clean input handling (useInput hook)
- Proper lifecycle (clean unmount, no hanging)
- Flexbox layout (easy responsive design)
- Active maintenance and rich ecosystem

---

## Requirements

### Core Functionality (Preserve All Existing Behavior)

1. **TUI launches when no args given**
   ```bash
   ./nodeping
   # → Opens interactive TUI
   ```

2. **All existing CLI flags still work** (NO BREAKING CHANGES)
   ```bash
   ./nodeping checks list --filter SR
   ./nodeping checks list --account "RFC Media"
   ./nodeping checks delete <id> --force
   ./nodeping --help
   ./nodeping --version
   ```

3. **TUI Navigation:**
   - Main menu: Checks, Results, Account, Quit
   - Checks submenu: List All, Filter by Pattern, View Details, Delete, Back
   - Results submenu: View Recent Results, View by Check, Back
   - Account submenu: Account Info, Back

4. **Current TUI Functions to Migrate:**
   - `runTui()` → Main TUI app
   - `selectMenu()` → Ink-based menu component
   - `actionListAllChecks()` → Component
   - `actionFilterChecks()` → Component
   - `actionViewCheckDetails()` → Component
   - `actionDeleteCheck()` → Component
   - `actionViewRecentResults()` → Component
   - `actionViewResultsByCheck()` → Component
   - `actionAccountInfo()` → Component

---

## Target State

### User Experience Goals

1. **Smooth arrow-key navigation** — Menus feel responsive, no missed keypresses
2. **Colored tables** — Check listings use colors for status (green=PASS, red=FAIL)
3. **Clean transitions** — Between screens, no flicker
4. **Proper quit behavior** — No hanging, restores terminal state cleanly
5. **Loading states** — Show spinner during API calls
6. **Help text** — Show keyboard shortcuts in status bar

### Technical Goals

1. **Zero or minimal new dependencies** — Use Ink core + minimal extras
   - `ink` (core)
   - `react` (peer dep)
   - `ink-select-input` (for menus, optional - can build custom)
   - `ink-text-input` (for text prompts, optional - can build custom)
   - `ink-spinner` (for loading, optional)
   
2. **All existing CLI functionality preserved** — No breaking changes
3. **Clean code structure** — Component-based, easy to extend
4. **Proper TypeScript/JSX setup** — Set up Babel for JSX if needed

---

## Implementation Plan

### Step 1: Setup Ink

1. Install dependencies:
   ```bash
   npm install ink react
   npm install --save-dev @babel/core @babel/preset-react
   npm install ink-select-input ink-text-input ink-spinner
   ```

2. Create `.babelrc` or update existing config:
   ```json
   {
     "presets": ["@babel/preset-react"]
   }
   ```

3. Add build script to `package.json`:
   ```json
   {
     "scripts": {
       "build": "babel src/tui -d lib/tui",
       "dev": "babel src/tui -d lib/tui --watch"
     }
   }
   ```

### Step 2: Create TUI Components Structure

**File structure:**
```
nodeping-cli/
├── nodeping                    # Main entry point (existing, modify minimally)
├── src/
│   └── tui/
│       ├── index.jsx           # TUI entry point
│       ├── App.jsx             # Main TUI app
│       ├── MainMenu.jsx        # Main menu component
│       ├── ChecksMenu.jsx      # Checks submenu
│       ├── ChecksList.jsx      # List all checks
│       ├── ChecksFilter.jsx    # Filter checks
│       ├── CheckDetails.jsx    # Check details
│       ├── CheckDelete.jsx     # Delete confirmation
│       ├── ResultsMenu.jsx     # Results submenu
│       ├── AccountInfo.jsx     # Account info
│       ├── ChecksTable.jsx     # Reusable table component
│       └── StatusBar.jsx       # Bottom status bar
├── lib/
│   └── tui/                    # Compiled output
└── package.json
```

**OR simpler structure (if avoiding build step):**
```
nodeping-cli/
├── nodeping                    # Main entry point
└── tui.js                      # All TUI code in one file (using React.createElement instead of JSX)
```

**Recommendation:** Use the simpler structure initially (single `tui.js` file with React.createElement) to avoid build complexity. Can refactor later.

### Step 3: Minimal Changes to Main File

In the main `nodeping` file, modify the TUI launch:

**Before:**
```javascript
if (args.length === 0) {
  try {
    await runTui();
    process.exit(0);
  } catch (err) {
    console.error(`${colors.red}Error:${colors.reset} ${err.message}`);
    process.exit(1);
  }
}
```

**After:**
```javascript
if (args.length === 0) {
  try {
    const { runInkTui } = require('./tui.js');
    await runInkTui();
    process.exit(0);
  } catch (err) {
    console.error(`${colors.red}Error:${colors.reset} ${err.message}`);
    process.exit(1);
  }
}
```

### Step 4: Build Core Components

#### `tui.js` — Main TUI Entry Point

Use `React.createElement` instead of JSX to avoid build step:

```javascript
const React = require('react');
const { render, Box, Text } = require('ink');
const SelectInput = require('ink-select-input');
const TextInput = require('ink-text-input');
const Spinner = require('ink-spinner');

// Import API functions from main file
const { listChecks, deleteCheck, /* ... */ } = require('./nodeping');

const App = () => {
  const [screen, setScreen] = React.useState('main');
  const [checks, setChecks] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const { exit } = require('ink').useApp();

  // Main menu
  if (screen === 'main') {
    return React.createElement(MainMenu, {
      onSelect: (item) => setScreen(item.value)
    });
  }

  // Checks menu
  if (screen === 'checks') {
    return React.createElement(ChecksMenu, {
      onSelect: (item) => setScreen(item.value),
      onBack: () => setScreen('main')
    });
  }

  // ... other screens
};

const MainMenu = ({ onSelect }) => {
  const items = [
    { label: 'Checks', value: 'checks' },
    { label: 'Results', value: 'results' },
    { label: 'Account', value: 'account' },
    { label: 'Quit', value: 'quit' }
  ];

  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Text, { bold: true, color: 'cyan' }, 'NodePing CLI v1.3.0'),
    React.createElement(SelectInput, { items, onSelect })
  );
};

// Export function to run TUI
exports.runInkTui = async () => {
  const { waitUntilExit } = render(React.createElement(App));
  await waitUntilExit();
};
```

#### ChecksTable Component

```javascript
const ChecksTable = ({ checks }) => {
  return React.createElement(Box, { flexDirection: 'column' },
    // Header
    React.createElement(Box, null,
      React.createElement(Text, { bold: true, color: 'cyan' }, 'ID'),
      React.createElement(Text, null, ' | '),
      React.createElement(Text, { bold: true, color: 'cyan' }, 'Label'),
      React.createElement(Text, null, ' | '),
      React.createElement(Text, { bold: true, color: 'cyan' }, 'Type'),
      React.createElement(Text, null, ' | '),
      React.createElement(Text, { bold: true, color: 'cyan' }, 'Status')
    ),
    // Rows
    ...checks.map(check =>
      React.createElement(Box, { key: check.id },
        React.createElement(Text, null, check.id),
        React.createElement(Text, null, ' | '),
        React.createElement(Text, null, check.label),
        React.createElement(Text, null, ' | '),
        React.createElement(Text, null, check.type),
        React.createElement(Text, null, ' | '),
        React.createElement(Text, {
          color: check.state === 1 ? 'green' : 'red'
        }, check.state === 1 ? 'PASS' : 'FAIL')
      )
    )
  );
};
```

#### Input Handling with useInput

```javascript
const { useInput } = require('ink');

const MyComponent = () => {
  const { exit } = require('ink').useApp();

  useInput((input, key) => {
    // Quit
    if (input === 'q' || key.escape) {
      exit();
    }

    // Handle Ctrl-C
    if (key.ctrl && input === 'c') {
      exit();
    }
  });

  return // ... component content
};
```

### Step 5: Migrate Each Screen

For each TUI action function (e.g., `actionListAllChecks`), create a corresponding component:

**Pattern:**
1. Extract API call logic
2. Use `React.useState` for data
3. Use `React.useEffect` to load data on mount
4. Show spinner while loading
5. Display results when loaded
6. Handle errors gracefully

**Example: ChecksList Component**

```javascript
const ChecksList = ({ accountId, onBack }) => {
  const [checks, setChecks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function loadChecks() {
      try {
        setLoading(true);
        const data = await listChecks({ json: true, account: accountId });
        setChecks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadChecks();
  }, [accountId]);

  useInput((input, key) => {
    if (input === 'q' || key.escape) {
      onBack();
    }
  });

  if (loading) {
    return React.createElement(Box, null,
      React.createElement(Spinner, { type: 'dots' }),
      React.createElement(Text, null, ' Loading checks...')
    );
  }

  if (error) {
    return React.createElement(Box, null,
      React.createElement(Text, { color: 'red' }, 'Error: ' + error),
      React.createElement(Text, { dimColor: true }, '\nPress q to go back')
    );
  }

  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Text, { bold: true }, 'All Checks'),
    React.createElement(ChecksTable, { checks }),
    React.createElement(Text, { dimColor: true }, '\nPress q to go back')
  );
};
```

---

## Testing Requirements

After implementation, verify:

### Functional Tests

- [ ] `./nodeping` launches TUI (no args)
- [ ] Arrow keys navigate menus smoothly (no missed keys)
- [ ] `q` quits cleanly from any screen
- [ ] Ctrl-C quits cleanly from any screen
- [ ] Terminal state restored on exit (cursor visible, raw mode off)
- [ ] No hanging processes after quit
- [ ] Tables display with colors (green=PASS, red=FAIL)
- [ ] Filter by pattern works
- [ ] View check details works
- [ ] Delete check works (with confirmation)
- [ ] View results works
- [ ] Account info works

### CLI Flags (NO BREAKING CHANGES)

- [ ] `./nodeping checks list` works
- [ ] `./nodeping checks list --filter SR` works
- [ ] `./nodeping checks list --account "RFC Media"` works
- [ ] `./nodeping checks delete <id> --force` works
- [ ] `./nodeping results <check-id>` works
- [ ] `./nodeping --help` works
- [ ] `./nodeping --version` works

### UX Tests

- [ ] No flicker on screen transitions
- [ ] Loading spinner shows during API calls
- [ ] Error messages are clear and helpful
- [ ] Status bar shows helpful context
- [ ] Help text visible (keyboard shortcuts)

---

## Key Design Decisions

### 1. Avoid JSX Build Step (Initially)

**Reason:** Keep it simple. Use `React.createElement()` instead of JSX to avoid Babel setup initially. Can refactor to JSX later if needed.

**Trade-off:** More verbose code, but simpler setup.

### 2. Single File vs Multiple Components

**Recommendation:** Start with single `tui.js` file for simplicity. Can split into modules later.

### 3. Menu Library vs Custom

**Options:**
- Use `ink-select-input` (recommended - saves time)
- Build custom menu component (more control)

**Recommendation:** Use `ink-select-input` for menus unless customization is needed.

### 4. API Integration

**Approach:** Extract API functions from main `nodeping` file and call them from TUI components. Avoid duplicating API logic.

**Pattern:**
```javascript
// In main nodeping file, export API functions
exports.listChecks = listChecks;
exports.deleteCheck = deleteCheck;
// ... etc

// In tui.js
const { listChecks, deleteCheck } = require('./nodeping');
```

### 5. State Management

**Approach:** Use React's `useState` for screen navigation and data. Keep it simple.

**Pattern:**
```javascript
const [screen, setScreen] = useState('main');
const [checksData, setChecksData] = useState([]);
const [accountId, setAccountId] = useState(null);
```

---

## Deliverables

1. **Refactored TUI code** (`tui.js` or `src/tui/` directory)
2. **Updated `nodeping` main file** (minimal changes to launch Ink TUI)
3. **Updated `package.json`** (with Ink dependencies)
4. **Updated README.md** (with TUI usage examples)
5. **No breaking changes** to existing CLI interface

---

## Example: Minimal Working TUI

Here's a minimal working example to get started:

```javascript
// tui.js
const React = require('react');
const { render, Box, Text, useApp, useInput } = require('ink');
const SelectInput = require('ink-select-input');

const App = () => {
  const [screen, setScreen] = React.useState('main');
  const { exit } = useApp();

  useInput((input, key) => {
    if (input === 'q' || key.escape) {
      exit();
    }
  });

  if (screen === 'main') {
    const items = [
      { label: 'Checks', value: 'checks' },
      { label: 'Quit', value: 'quit' }
    ];

    return React.createElement(Box, { flexDirection: 'column' },
      React.createElement(Text, { bold: true, color: 'cyan' }, 'NodePing CLI'),
      React.createElement(SelectInput, {
        items,
        onSelect: (item) => {
          if (item.value === 'quit') {
            exit();
          } else {
            setScreen(item.value);
          }
        }
      }),
      React.createElement(Text, { dimColor: true }, 'Use ↑/↓ and Enter. Press q to quit.')
    );
  }

  if (screen === 'checks') {
    return React.createElement(Box, { flexDirection: 'column' },
      React.createElement(Text, null, 'Checks screen (TODO)'),
      React.createElement(Text, { dimColor: true }, 'Press q to go back')
    );
  }

  return null;
};

exports.runInkTui = async () => {
  const { waitUntilExit } = render(React.createElement(App));
  await waitUntilExit();
};
```

**Usage in main `nodeping` file:**
```javascript
if (args.length === 0) {
  const { runInkTui } = require('./tui.js');
  await runInkTui();
  process.exit(0);
}
```

---

## Success Criteria

✅ TUI rebuilt with Ink (smooth navigation, colored tables, clean quit)  
✅ All existing CLI flags work (no breaking changes)  
✅ TUI launches when no args given  
✅ No flicker, no hanging processes  
✅ Code is clean and maintainable  

---

## Notes

- **Preserve all existing CLI behavior** — This is critical. Users rely on CLI flags.
- **Start simple** — Get basic menu navigation working first, then add features.
- **Test incrementally** — Test each screen as you build it.
- **Keep it maintainable** — Use components, avoid duplication.

---

**Target completion: 2026-02-23**

**Approach: Incremental rebuild starting with core navigation, then migrate screens one by one.**
