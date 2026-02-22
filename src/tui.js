const React = require('react');
const { render, Box, Text, useApp, useInput, useStdout } = require('ink');
const TextInput = require('ink-text-input').default;
const SelectInput = require('ink-select-input').default;
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const API_BASE = 'api.nodeping.com';
const API_VERSION = '/api/1';
const STATE_PATH = path.join(os.homedir(), '.config', 'nodeping-cli', 'state.json');

function getApiToken() {
  const tokenPath = path.join(os.homedir(), '.credentials', 'nodeping', 'api_token');

  try {
    const token = fs.readFileSync(tokenPath, 'utf8').trim();
    if (!token) {
      throw new Error('Token file is empty');
    }
    return token;
  } catch (err) {
    throw new Error(`Could not read API token from ${tokenPath}`);
  }
}

function apiRequest(method, endpoint, data = null, accountId = null) {
  return new Promise((resolve, reject) => {
    let token;
    try {
      token = getApiToken();
    } catch (err) {
      reject(err);
      return;
    }

    let requestPath = `${API_VERSION}${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${token}`;
    if (accountId) {
      requestPath += `&customerid=${accountId}`;
    }

    const options = {
      hostname: API_BASE,
      path: requestPath,
      method,
      headers: {
        Accept: 'application/json'
      }
    };

    if (data && method !== 'GET') {
      const postData = JSON.stringify({ json: data });
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode >= 400) {
            const errorMsg = parsed.error || parsed.message || `HTTP ${res.statusCode}`;
            reject(new Error(errorMsg));
          } else {
            resolve(parsed);
          }
        } catch (err) {
          reject(new Error(`Failed to parse response: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Network error: ${err.message}`));
    });

    if (data && method !== 'GET') {
      req.write(`json=${encodeURIComponent(JSON.stringify(data))}`);
    }

    req.end();
  });
}

function readState() {
  try {
    const raw = fs.readFileSync(STATE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return {};
  }
}

function writeState(nextState) {
  try {
    fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
    fs.writeFileSync(STATE_PATH, JSON.stringify(nextState, null, 2));
  } catch (err) {
    // Ignore state write failures in the TUI.
  }
}

function normalizeChecks(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Object.entries(data).map(([id, check]) => ({ id, ...check }));
}

function truncate(text, max) {
  if (!text) return '';
  const str = String(text);
  if (str.length <= max) return str;
  return `${str.slice(0, Math.max(0, max - 1))}…`;
}

function padRight(text, width) {
  const str = text === undefined || text === null ? '' : String(text);
  if (str.length >= width) return str.slice(0, width);
  return str + ' '.repeat(width - str.length);
}

function formatTimestamp(value) {
  if (!value) return 'n/a';
  let timestamp = value;
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    timestamp = Number(value);
  }
  if (typeof timestamp === 'number' && timestamp < 1e12) {
    timestamp *= 1000;
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'n/a';
  }
  return date.toISOString();
}

function getLastModified(check) {
  return (
    check.modified ||
    check.lastmodified ||
    check.lastModified ||
    check.modified_time ||
    check.m ||
    null
  );
}

function countNotifications(check) {
  const data = check.notifications || check.notification || check.notify;
  if (!data) return 0;
  if (Array.isArray(data)) return data.length;
  if (typeof data === 'object') return Object.keys(data).length;
  return 1;
}

function deriveStatus(check) {
  if (check.state === 1) return 'PASS';
  if (check.state === 0) return 'FAIL';
  if (check.state === 'up') return 'PASS';
  if (check.state === 'down') return 'FAIL';
  return 'UNKNOWN';
}

function getTarget(check) {
  return check.parameters?.target || check.target || '';
}

function ChecksList({ checks, selectedIndex }) {
  const { stdout } = useStdout();
  const rows = (stdout && stdout.rows) ? stdout.rows : 24;
  const listHeight = Math.max(5, rows - 12);
  const start = Math.max(
    0,
    Math.min(
      selectedIndex - Math.floor(listHeight / 2),
      Math.max(0, checks.length - listHeight)
    )
  );
  const visible = checks.slice(start, start + listHeight);

  return (
    <Box flexDirection="column">
      {visible.map((check, index) => {
        const actualIndex = start + index;
        const isSelected = actualIndex === selectedIndex;
        const enabled = check.enable === 'active' ? 'enabled' : 'disabled';
        const target = truncate(getTarget(check), 24);
        const label = truncate(check.label || '', 26);
        const type = (check.type || '').toUpperCase();
        const interval = check.interval !== undefined ? `${check.interval}m` : '-';
        const row = [
          padRight(label, 26),
          padRight(type, 6),
          padRight(enabled, 9),
          padRight(target, 24),
          padRight(interval, 6)
        ].join(' ');

        return (
          <Text key={check.id} inverse={isSelected}>
            {row}
          </Text>
        );
      })}
      {visible.length === 0 ? (
        <Text color="gray">No checks matched the current filter.</Text>
      ) : null}
    </Box>
  );
}

function DetailsPane({ check }) {
  if (!check) {
    return (
      <Box flexDirection="column">
        <Text color="gray">Select a check to see details.</Text>
      </Box>
    );
  }

  const enabled = check.enable === 'active' ? 'Enabled' : 'Disabled';
  const status = deriveStatus(check);
  const lastModified = formatTimestamp(getLastModified(check));
  const notifications = countNotifications(check);

  return (
    <Box flexDirection="column">
      <Text bold>{check.label || 'Untitled Check'}</Text>
      <Text color="gray">{check.id}</Text>
      <Box marginTop={1} flexDirection="column">
        <Text>Type: {check.type || 'n/a'}</Text>
        <Text>Target: {getTarget(check) || 'n/a'}</Text>
        <Text>Interval: {check.interval !== undefined ? `${check.interval} minutes` : 'n/a'}</Text>
        <Text>Status: {status}</Text>
        <Text>Enabled: {enabled}</Text>
        <Text>Last Modified: {lastModified}</Text>
        <Text>Notifications: {notifications}</Text>
      </Box>
    </Box>
  );
}

function ResultsView({ results, limit }) {
  return (
    <Box flexDirection="column">
      <Text bold>Recent Results (limit: {limit})</Text>
      <Text color="gray">Press + / - to change limit, r to refresh, b to return.</Text>
      <Box marginTop={1} flexDirection="column">
        {results.length === 0 ? (
          <Text color="gray">No results available.</Text>
        ) : (
          results.map((result, index) => {
            const doc = result.doc || result;
            const status = doc.su ? 'SUCCESS' : 'FAILURE';
            const timestamp = formatTimestamp(doc.s || doc.t);
            const runtime = doc.rt !== undefined ? `${doc.rt}ms` : 'n/a';
            const message = doc.m ? truncate(doc.m, 80) : '';
            return (
              <Box key={`${timestamp}-${index}`} flexDirection="column" marginBottom={1}>
                <Text>{timestamp}</Text>
                <Text>Status: {status} | Runtime: {runtime}</Text>
                {message ? <Text color="gray">{message}</Text> : null}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}

function App({ initialAccountId }) {
  const { exit } = useApp();
  const [mode, setMode] = React.useState('loading');
  const [accounts, setAccounts] = React.useState([]);
  const [accountId, setAccountId] = React.useState(initialAccountId || null);
  const [checks, setChecks] = React.useState([]);
  const [filter, setFilter] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [results, setResults] = React.useState([]);
  const [resultsLimit, setResultsLimit] = React.useState(10);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [accountSelectIndex, setAccountSelectIndex] = React.useState(0);
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState('');

  React.useEffect(() => {
    let isActive = true;
    async function loadAccounts() {
      setMode('loading');
      try {
        const data = await apiRequest('GET', '/accounts');
        if (!isActive) return;
        const list = Object.entries(data || {}).map(([id, account]) => ({
          id,
          name: account.name || 'Unnamed',
          status: account.status || 'Unknown'
        }));
        setAccounts(list);

        const stored = readState().lastAccountId;
        const defaultId = initialAccountId || stored;
        const defaultIndex = Math.max(0, list.findIndex((account) => account.id === defaultId));
        setAccountSelectIndex(defaultIndex);
        setMode('pick-account');
      } catch (err) {
        if (!isActive) return;
        setError(err.message || 'Failed to load accounts.');
      }
    }

    loadAccounts();
    return () => {
      isActive = false;
    };
  }, [initialAccountId]);

  async function handleAccountSelect(nextId) {
    setAccountId(nextId);
    writeState({ lastAccountId: nextId });
    setMode('loading-checks');
    setMessage('');
    try {
      const data = await apiRequest('GET', '/checks', null, nextId);
      const list = normalizeChecks(data);
      setChecks(list);
      setSelectedIndex(0);
      setMode('list');
    } catch (err) {
      setError(err.message || 'Failed to load checks.');
      setMode('list');
    }
  }

  const filteredChecks = React.useMemo(() => {
    if (!filter) return checks;
    const lower = filter.toLowerCase();
    return checks.filter((check) => {
      const target = getTarget(check).toLowerCase();
      return (
        (check.label || '').toLowerCase().includes(lower) ||
        (check.type || '').toLowerCase().includes(lower) ||
        target.includes(lower)
      );
    });
  }, [checks, filter]);

  React.useEffect(() => {
    if (selectedIndex >= filteredChecks.length) {
      setSelectedIndex(0);
    }
  }, [filteredChecks, selectedIndex]);

  const selectedCheck = filteredChecks[selectedIndex];
  const accountLabel = accounts.find((account) => account.id === accountId)?.name || accountId || 'n/a';

  async function refreshChecks() {
    if (!accountId) return;
    setMode('loading-checks');
    try {
      const data = await apiRequest('GET', '/checks', null, accountId);
      const list = normalizeChecks(data);
      setChecks(list);
      setMode('list');
    } catch (err) {
      setError(err.message || 'Failed to refresh checks.');
      setMode('list');
    }
  }

  async function toggleCheckStatus() {
    if (!selectedCheck) return;
    const nextEnable = selectedCheck.enable === 'active' ? 'inactive' : 'active';
    setMessage('Updating check status...');
    try {
      await apiRequest('PUT', `/checks/${selectedCheck.id}`, { enable: nextEnable }, accountId);
      setMessage(`Check ${nextEnable === 'active' ? 'enabled' : 'disabled'}.`);
      await refreshChecks();
    } catch (err) {
      setMessage('');
      setError(err.message || 'Failed to update check status.');
    }
  }

  async function submitRename() {
    if (!renameValue.trim() || !selectedCheck) {
      setIsRenaming(false);
      return;
    }
    setMessage('Renaming check...');
    setIsRenaming(false);
    try {
      await apiRequest('PUT', `/checks/${selectedCheck.id}`, { label: renameValue.trim() }, accountId);
      setMessage('Check renamed.');
      await refreshChecks();
    } catch (err) {
      setMessage('');
      setError(err.message || 'Failed to rename check.');
    }
  }

  async function loadResults() {
    return loadResultsWithLimit(resultsLimit);
  }

  async function loadResultsWithLimit(limit) {
    if (!selectedCheck) return;
    setMode('results');
    setMessage('Loading results...');
    try {
      const data = await apiRequest('GET', `/results/${selectedCheck.id}?limit=${limit}`, null, accountId);
      const list = Array.isArray(data) ? data : [data];
      setResults(list);
      setMessage('');
    } catch (err) {
      setError(err.message || 'Failed to load results.');
      setMessage('');
    }
  }

  useInput((input, key) => {
    if (input === 'q') {
      exit();
      return;
    }

    if (key.escape) {
      if (isRenaming) {
        setIsRenaming(false);
        setRenameValue('');
        return;
      }
      if (mode === 'results') {
        setMode('list');
        return;
      }
    }

    if (isRenaming) return;

    if (mode === 'list') {
      if (key.upArrow) {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setSelectedIndex((prev) => {
          if (filteredChecks.length === 0) return 0;
          return Math.min(filteredChecks.length - 1, prev + 1);
        });
      } else if (input === 'r') {
        loadResults();
      } else if (input === 'e') {
        toggleCheckStatus();
      } else if (input === 'n') {
        setRenameValue(selectedCheck ? selectedCheck.label || '' : '');
        setIsRenaming(true);
      } else if (input === 'a') {
        const currentIndex = Math.max(0, accounts.findIndex((account) => account.id === accountId));
        setAccountSelectIndex(currentIndex);
        setMode('pick-account');
      }
    } else if (mode === 'results') {
      if (input === 'b') {
        setMode('list');
      } else if (input === 'r') {
        loadResults();
      } else if (input === '+') {
        const next = Math.min(50, resultsLimit + 5);
        setResultsLimit(next);
        loadResultsWithLimit(next);
      } else if (input === '-') {
        const next = Math.max(1, resultsLimit - 5);
        setResultsLimit(next);
        loadResultsWithLimit(next);
      }
    }
  });

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">Error: {error}</Text>
        <Text color="gray">Press q to quit.</Text>
      </Box>
    );
  }

  if (mode === 'loading') {
    return (
      <Box flexDirection="column">
        <Text>Loading accounts...</Text>
      </Box>
    );
  }

  if (mode === 'pick-account') {
    const items = accounts.map((account) => ({
      label: `${account.name} (${account.id})`,
      value: account.id
    }));

    return (
      <Box flexDirection="column">
        <Text bold>Select an account</Text>
        <Text color="gray">Use ↑/↓ and Enter. Press q to quit.</Text>
        <Box marginTop={1}>
          <SelectInput
            items={items}
            initialIndex={accountSelectIndex}
            onSelect={(item) => handleAccountSelect(item.value)}
          />
        </Box>
      </Box>
    );
  }

  if (mode === 'loading-checks') {
    return (
      <Box flexDirection="column">
        <Text>Loading checks for {accountLabel}...</Text>
      </Box>
    );
  }

  if (mode === 'results') {
    return (
      <Box flexDirection="column">
        <ResultsView results={results} limit={resultsLimit} />
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text bold>NodePing TUI</Text>
      <Text color="gray">Account: {accountLabel} | Checks: {filteredChecks.length} | a = switch account</Text>
      <Text color="gray">↑/↓ move  r results  e enable/disable  n rename  q quit</Text>
      <Text color="gray">Delete (coming soon)</Text>

      <Box marginTop={1} flexDirection="column">
        <Box>
          <Text>Filter: </Text>
          <TextInput value={filter} onChange={setFilter} />
        </Box>

        <Box marginTop={1} flexDirection="column">
          <Text color="gray">Label                      Type   Enabled   Target                   Intvl</Text>
          <ChecksList
            checks={filteredChecks}
            selectedIndex={selectedIndex}
          />
        </Box>
      </Box>

      <Box marginTop={1} borderStyle="round" paddingLeft={1} paddingRight={1} flexDirection="column">
        <DetailsPane check={selectedCheck} />
      </Box>

      {isRenaming ? (
        <Box marginTop={1} flexDirection="column">
          <Text>Rename check (Enter to save, Esc to cancel):</Text>
          <TextInput value={renameValue} onChange={setRenameValue} onSubmit={submitRename} />
        </Box>
      ) : null}

      {message ? (
        <Box marginTop={1}>
          <Text color="green">{message}</Text>
        </Box>
      ) : null}
    </Box>
  );
}

function printHelp() {
  console.log(`NodePing TUI\n\nUsage:\n  nodeping tui\n\nKeys:\n  ↑/↓    Move selection\n  r      View recent results\n  e      Enable/disable selected check\n  n      Rename selected check\n  a      Switch account\n  q      Quit\n\nNotes:\n  Delete is not available in the MVP.`);
}

async function runTui(args = []) {
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  const state = readState();
  render(<App initialAccountId={state.lastAccountId} />);
}

module.exports = {
  runTui
};
