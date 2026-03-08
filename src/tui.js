const React = require('react');
const { render, Box, Text, useApp, useInput } = require('ink');
const SelectInputModule = require('ink-select-input');
const TextInputModule = require('ink-text-input');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SelectInput = SelectInputModule.default || SelectInputModule;
const TextInput = TextInputModule.default || TextInputModule;

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
  } catch (_err) {
    throw new Error(`Could not read API token from ${tokenPath}`);
  }
}

function apiRequest(method, endpoint, data, accountId) {
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
          const parsed = JSON.parse(responseData || '{}');
          if (res.statusCode >= 400) {
            const errorMsg = parsed.error || parsed.message || `HTTP ${res.statusCode}`;
            reject(new Error(errorMsg));
          } else {
            resolve(parsed);
          }
        } catch (err) {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          } else {
            reject(new Error(`Failed to parse response: ${err.message}`));
          }
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

function listChecks(options) {
  const accountId = options && options.account ? options.account : null;
  const filter = options && options.filter ? options.filter : null;

  return apiRequest('GET', '/checks', null, accountId).then((checks) => {
    let checkList = Object.entries(checks || {}).map(([id, check]) => ({ id, ...check }));
    if (filter) {
      const pattern = new RegExp(filter, 'i');
      checkList = checkList.filter((check) => {
        return (
          pattern.test(check.label || '') ||
          pattern.test(check.parameters && check.parameters.target ? check.parameters.target : '') ||
          pattern.test(check.type || '')
        );
      });
    }
    return checkList;
  });
}

function deleteCheck(checkId, accountId) {
  return apiRequest('DELETE', `/checks/${checkId}`, null, accountId);
}

function listAccounts() {
  return apiRequest('GET', '/accounts');
}

function getResults(checkId, options) {
  const limit = options && options.limit ? options.limit : 10;
  const accountId = options && options.account ? options.account : null;
  return apiRequest('GET', `/results/${checkId}?limit=${limit}`, null, accountId).then((results) => {
    return Array.isArray(results) ? results : [results];
  });
}

function readState() {
  try {
    const raw = fs.readFileSync(STATE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (_err) {
    return {};
  }
}

function writeState(nextState) {
  try {
    fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
    fs.writeFileSync(STATE_PATH, JSON.stringify(nextState, null, 2));
  } catch (_err) {
    // Ignore state write failures in the TUI.
  }
}

function truncateText(text, maxLength) {
  const value = String(text || '');
  const chars = Array.from(value);
  if (chars.length <= maxLength) return value;
  if (maxLength <= 1) return '...';
  return `${chars.slice(0, maxLength - 3).join('')}...`;
}

function padCell(text, width) {
  const value = String(text || '');
  if (value.length >= width) return value.slice(0, width);
  return `${value}${' '.repeat(width - value.length)}`;
}

function formatTimestamp(value) {
  if (!value) return 'n/a';
  let timestamp = value;
  if (typeof timestamp === 'string' && /^\d+$/.test(timestamp)) {
    timestamp = Number(timestamp);
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

function getCheckTarget(check) {
  return (check && check.parameters && check.parameters.target) || '';
}

function getCheckStateLabel(check) {
  return check && check.state === 1 ? 'PASS' : 'FAIL';
}

function ScreenFrame(props) {
  const children = props.children;
  return React.createElement(
    Box,
    { flexDirection: 'column', paddingLeft: 1, paddingRight: 1 },
    React.createElement(Text, { bold: true, color: 'cyan' }, props.title || 'NodePing CLI'),
    props.subtitle ? React.createElement(Text, { color: 'gray' }, props.subtitle) : null,
    React.createElement(Box, { marginTop: 1, flexDirection: 'column' }, children),
    React.createElement(Box, { marginTop: 1 }, React.createElement(Text, { color: 'gray' }, props.help || 'Use arrow keys and Enter. q to go back.'))
  );
}

function SimpleSpinner() {
  const frames = ['-', '\\', '|', '/'];
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % frames.length);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  return React.createElement(Text, { color: 'cyan' }, frames[index]);
}

function LoadingScreen(props) {
  return React.createElement(
    ScreenFrame,
    {
      title: props.title,
      subtitle: props.subtitle,
      help: props.help || 'Please wait...'
    },
    React.createElement(
      Box,
      null,
      React.createElement(SimpleSpinner, null),
      React.createElement(Text, null, ` ${props.message || 'Loading...'}`)
    )
  );
}

function ErrorScreen(props) {
  useInput((input, key) => {
    if (input === 'q' || key.escape || key.return) {
      props.onBack();
    }
  });

  return React.createElement(
    ScreenFrame,
    {
      title: props.title,
      subtitle: props.subtitle,
      help: 'Press q, Esc, or Enter to go back.'
    },
    React.createElement(Text, { color: 'red' }, `Error: ${props.error || 'Unknown error'}`)
  );
}

function MenuScreen(props) {
  const items = props.items || [];

  useInput((input, key) => {
    if (input === 'q' || key.escape) {
      props.onBack();
    }
  });

  return React.createElement(
    ScreenFrame,
    {
      title: props.title,
      subtitle: props.subtitle,
      help: props.help || 'Use up/down and Enter. q to go back.'
    },
    React.createElement(SelectInput, {
      items,
      onSelect: (item) => props.onSelect(item.value)
    })
  );
}

function selectMenu(props) {
  return React.createElement(MenuScreen, props);
}

function ChecksTable(props) {
  const checks = props.checks || [];
  const rows = checks.map((check) => {
    return {
      id: check.id || '',
      label: truncateText(check.label || '', 24),
      type: truncateText((check.type || '').toUpperCase(), 8),
      target: truncateText(getCheckTarget(check), 36),
      status: getCheckStateLabel(check),
      enabled: check.enable === 'active' ? 'active' : 'inactive',
      interval: check.interval !== undefined ? String(check.interval) : ''
    };
  });

  const widths = {
    id: 24,
    label: 24,
    type: 8,
    target: 36,
    status: 6,
    enabled: 8,
    interval: 3
  };

  return React.createElement(
    Box,
    { flexDirection: 'column' },
    React.createElement(
      Text,
      { color: 'cyan' },
      `${padCell('ID', widths.id)} ${padCell('Label', widths.label)} ${padCell('Type', widths.type)} ${padCell('Target', widths.target)} ${padCell('State', widths.status)} ${padCell('Enabled', widths.enabled)} ${padCell('Int', widths.interval)}`
    ),
    rows.length === 0
      ? React.createElement(Text, { color: 'yellow' }, 'No checks found.')
      : rows.map((row) => {
          const statusNode = row.status === 'PASS'
            ? React.createElement(Text, { color: 'green' }, row.status)
            : React.createElement(Text, { color: 'red' }, row.status);

          return React.createElement(
            Box,
            { key: row.id },
            React.createElement(Text, null, `${padCell(row.id, widths.id)} ${padCell(row.label, widths.label)} ${padCell(row.type, widths.type)} ${padCell(row.target, widths.target)} `),
            statusNode,
            React.createElement(Text, null, ` ${padCell(row.enabled, widths.enabled)} ${padCell(row.interval, widths.interval)}`)
          );
        })
  );
}

function actionListAllChecks(props) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [checks, setChecks] = React.useState([]);

  React.useEffect(() => {
    let active = true;
    listChecks({ account: props.accountId })
      .then((data) => {
        if (!active) return;
        setChecks(data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Failed to load checks');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [props.accountId]);

  useInput((input, key) => {
    if (!loading && (input === 'q' || key.escape)) {
      props.onBack();
    }
  });

  if (loading) {
    return React.createElement(LoadingScreen, {
      title: 'Checks > List All',
      subtitle: props.accountText,
      message: 'Loading checks...',
      help: 'q to cancel'
    });
  }

  if (error) {
    return React.createElement(ErrorScreen, {
      title: 'Checks > List All',
      subtitle: props.accountText,
      error,
      onBack: props.onBack
    });
  }

  return React.createElement(
    ScreenFrame,
    {
      title: 'Checks > List All',
      subtitle: `${props.accountText} | ${checks.length} check(s)`,
      help: 'Press q or Esc to go back.'
    },
    React.createElement(ChecksTable, { checks })
  );
}

function actionFilterChecks(props) {
  const [stage, setStage] = React.useState('input');
  const [pattern, setPattern] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [checks, setChecks] = React.useState([]);

  useInput((input, key) => {
    if (stage !== 'input' && !loading && (input === 'q' || key.escape)) {
      props.onBack();
    }
    if (stage === 'input' && key.escape) {
      props.onBack();
    }
  });

  function submit() {
    if (!pattern.trim()) {
      setError('Filter pattern is required.');
      setStage('result');
      return;
    }

    setLoading(true);
    setError('');
    listChecks({ account: props.accountId, filter: pattern.trim() })
      .then((data) => {
        setChecks(data);
        setStage('result');
      })
      .catch((err) => {
        setError(err.message || 'Failed to filter checks');
        setStage('result');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  if (loading) {
    return React.createElement(LoadingScreen, {
      title: 'Checks > Filter',
      subtitle: props.accountText,
      message: 'Filtering checks...'
    });
  }

  if (stage === 'input') {
    return React.createElement(
      ScreenFrame,
      {
        title: 'Checks > Filter by Pattern',
        subtitle: props.accountText,
        help: 'Type a regex pattern and press Enter. Esc to go back.'
      },
      React.createElement(Box, null,
        React.createElement(Text, null, 'Pattern: '),
        React.createElement(TextInput, {
          value: pattern,
          onChange: setPattern,
          onSubmit: submit
        })
      )
    );
  }

  if (error) {
    return React.createElement(ErrorScreen, {
      title: 'Checks > Filter',
      subtitle: props.accountText,
      error,
      onBack: props.onBack
    });
  }

  return React.createElement(
    ScreenFrame,
    {
      title: 'Checks > Filter Results',
      subtitle: `${props.accountText} | pattern: ${pattern} | ${checks.length} match(es)`,
      help: 'Press q or Esc to go back.'
    },
    React.createElement(ChecksTable, { checks })
  );
}

function CheckMenu(props) {
  const items = (props.checks || []).map((check) => ({
    label: `${truncateText(check.label || '(unlabeled)', 36)} [${check.id}]`,
    value: check
  }));

  return React.createElement(MenuScreen, {
    title: props.title,
    subtitle: `${props.accountText} | ${items.length} check(s)`,
    items,
    onSelect: props.onSelect,
    onBack: props.onBack,
    help: 'Use up/down and Enter. q to cancel.'
  });
}

function actionViewCheckDetails(props) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [checks, setChecks] = React.useState([]);
  const [selected, setSelected] = React.useState(null);

  React.useEffect(() => {
    let active = true;
    listChecks({ account: props.accountId })
      .then((data) => {
        if (!active) return;
        setChecks(data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Failed to load checks');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [props.accountId]);

  useInput((input, key) => {
    if (selected && (input === 'q' || key.escape)) {
      props.onBack();
    }
  });

  if (loading) {
    return React.createElement(LoadingScreen, {
      title: 'Checks > View Details',
      subtitle: props.accountText,
      message: 'Loading checks...'
    });
  }

  if (error) {
    return React.createElement(ErrorScreen, {
      title: 'Checks > View Details',
      subtitle: props.accountText,
      error,
      onBack: props.onBack
    });
  }

  if (!selected) {
    return React.createElement(CheckMenu, {
      title: 'Checks > Select Check',
      accountText: props.accountText,
      checks,
      onSelect: setSelected,
      onBack: props.onBack
    });
  }

  return React.createElement(
    ScreenFrame,
    {
      title: 'Checks > Details',
      subtitle: `${props.accountText} | ${selected.id}`,
      help: 'Press q or Esc to go back.'
    },
    React.createElement(Text, { bold: true }, selected.label || '(unlabeled)'),
    React.createElement(Text, null, `ID: ${selected.id}`),
    React.createElement(Text, null, `Type: ${(selected.type || '').toUpperCase()}`),
    React.createElement(Text, null, `Target: ${getCheckTarget(selected) || 'n/a'}`),
    React.createElement(Text, null, `Interval: ${selected.interval || 'n/a'} min`),
    React.createElement(Text, null, `State: ${getCheckStateLabel(selected)}`),
    React.createElement(Text, null, `Enabled: ${selected.enable === 'active' ? 'active' : 'inactive'}`),
    React.createElement(Text, null, 'Raw:'),
    React.createElement(Text, { color: 'gray' }, JSON.stringify(selected, null, 2))
  );
}

function actionDeleteCheck(props) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [checks, setChecks] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);
  const [resultMessage, setResultMessage] = React.useState('');

  React.useEffect(() => {
    let active = true;
    listChecks({ account: props.accountId })
      .then((data) => {
        if (!active) return;
        setChecks(data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Failed to load checks');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [props.accountId]);

  useInput((input, key) => {
    if (!deleting && resultMessage && (input === 'q' || key.escape || key.return)) {
      props.onBack();
    }
    if (!deleting && !resultMessage && selected && (input === 'q' || key.escape)) {
      props.onBack();
    }
  });

  if (loading) {
    return React.createElement(LoadingScreen, {
      title: 'Checks > Delete',
      subtitle: props.accountText,
      message: 'Loading checks...'
    });
  }

  if (error) {
    return React.createElement(ErrorScreen, {
      title: 'Checks > Delete',
      subtitle: props.accountText,
      error,
      onBack: props.onBack
    });
  }

  if (!selected) {
    return React.createElement(CheckMenu, {
      title: 'Checks > Delete > Select Check',
      accountText: props.accountText,
      checks,
      onSelect: setSelected,
      onBack: props.onBack
    });
  }

  if (deleting) {
    return React.createElement(LoadingScreen, {
      title: 'Checks > Delete',
      subtitle: `${props.accountText} | ${selected.id}`,
      message: `Deleting ${selected.label || selected.id}...`
    });
  }

  if (resultMessage) {
    return React.createElement(
      ScreenFrame,
      {
        title: 'Checks > Delete',
        subtitle: props.accountText,
        help: 'Press q, Esc, or Enter to go back.'
      },
      React.createElement(Text, { color: resultMessage.startsWith('Deleted') ? 'green' : 'red' }, resultMessage)
    );
  }

  const confirmItems = [
    { label: 'Cancel', value: 'cancel' },
    { label: `Delete ${selected.label || selected.id}`, value: 'confirm' }
  ];

  return React.createElement(
    ScreenFrame,
    {
      title: 'Checks > Delete > Confirm',
      subtitle: `${props.accountText} | ${selected.id}`,
      help: 'Use up/down and Enter. q to cancel.'
    },
    React.createElement(Text, { color: 'yellow' }, `Delete check "${selected.label || selected.id}"?`),
    React.createElement(SelectInput, {
      items: confirmItems,
      onSelect: (item) => {
        if (item.value === 'cancel') {
          props.onBack();
          return;
        }

        setDeleting(true);
        deleteCheck(selected.id, props.accountId)
          .then((res) => {
            if (res && res.ok) {
              setResultMessage(`Deleted check: ${selected.id}`);
            } else {
              setResultMessage(`Delete failed for check: ${selected.id}`);
            }
          })
          .catch((err) => {
            setResultMessage(`Delete failed: ${err.message || 'Unknown error'}`);
          })
          .finally(() => {
            setDeleting(false);
          });
      }
    })
  );
}

function actionViewRecentResults(props) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    let active = true;

    async function loadRecent() {
      try {
        const checks = await listChecks({ account: props.accountId });
        const limitedChecks = checks.slice(0, 10);
        const nextRows = [];

        for (const check of limitedChecks) {
          try {
            const result = await getResults(check.id, { account: props.accountId, limit: 1 });
            const doc = result && result[0] ? (result[0].doc || result[0]) : null;
            nextRows.push({
              id: check.id,
              label: check.label || '',
              status: doc && doc.su ? 'SUCCESS' : 'FAIL',
              runtime: doc && doc.rt !== undefined ? String(doc.rt) : '',
              when: formatTimestamp(doc && (doc.s || doc.t))
            });
          } catch (itemErr) {
            nextRows.push({
              id: check.id,
              label: check.label || '',
              status: 'ERROR',
              runtime: '',
              when: truncateText(itemErr.message || 'Unknown error', 32)
            });
          }
        }

        if (!active) return;
        setRows(nextRows);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load recent results');
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    loadRecent();

    return () => {
      active = false;
    };
  }, [props.accountId]);

  useInput((input, key) => {
    if (!loading && (input === 'q' || key.escape)) {
      props.onBack();
    }
  });

  if (loading) {
    return React.createElement(LoadingScreen, {
      title: 'Results > View Recent Results',
      subtitle: props.accountText,
      message: 'Loading recent results...'
    });
  }

  if (error) {
    return React.createElement(ErrorScreen, {
      title: 'Results > View Recent Results',
      subtitle: props.accountText,
      error,
      onBack: props.onBack
    });
  }

  const widths = { label: 24, id: 24, status: 7, rt: 6 };

  return React.createElement(
    ScreenFrame,
    {
      title: 'Results > View Recent Results',
      subtitle: `${props.accountText} | Top ${rows.length} checks`,
      help: 'Press q or Esc to go back.'
    },
    React.createElement(Text, { color: 'cyan' }, `${padCell('Label', widths.label)} ${padCell('ID', widths.id)} ${padCell('Status', widths.status)} ${padCell('RT(ms)', widths.rt)} When`),
    rows.length === 0
      ? React.createElement(Text, { color: 'yellow' }, 'No checks found.')
      : rows.map((row) => {
          let statusColor = 'green';
          if (row.status === 'FAIL') statusColor = 'red';
          if (row.status === 'ERROR') statusColor = 'yellow';

          return React.createElement(
            Box,
            { key: row.id },
            React.createElement(Text, null, `${padCell(truncateText(row.label, widths.label), widths.label)} ${padCell(row.id, widths.id)} `),
            React.createElement(Text, { color: statusColor }, padCell(row.status, widths.status)),
            React.createElement(Text, null, ` ${padCell(row.runtime, widths.rt)} ${row.when}`)
          );
        })
  );
}

function actionViewResultsByCheck(props) {
  const [loadingChecks, setLoadingChecks] = React.useState(true);
  const [error, setError] = React.useState('');
  const [checks, setChecks] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [limitInput, setLimitInput] = React.useState('10');
  const [loadingResults, setLoadingResults] = React.useState(false);
  const [results, setResults] = React.useState([]);

  React.useEffect(() => {
    let active = true;
    listChecks({ account: props.accountId })
      .then((data) => {
        if (!active) return;
        setChecks(data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Failed to load checks');
      })
      .finally(() => {
        if (!active) return;
        setLoadingChecks(false);
      });

    return () => {
      active = false;
    };
  }, [props.accountId]);

  useInput((input, key) => {
    if (!loadingChecks && !loadingResults && results.length > 0 && (input === 'q' || key.escape)) {
      props.onBack();
    }
  });

  function submitLimit() {
    const parsed = parseInt(limitInput, 10);
    const limit = Number.isNaN(parsed) ? 10 : Math.max(1, parsed);

    setLoadingResults(true);
    getResults(selected.id, { account: props.accountId, limit })
      .then((data) => {
        setResults(data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load results');
      })
      .finally(() => {
        setLoadingResults(false);
      });
  }

  if (loadingChecks) {
    return React.createElement(LoadingScreen, {
      title: 'Results > View by Check',
      subtitle: props.accountText,
      message: 'Loading checks...'
    });
  }

  if (error) {
    return React.createElement(ErrorScreen, {
      title: 'Results > View by Check',
      subtitle: props.accountText,
      error,
      onBack: props.onBack
    });
  }

  if (!selected) {
    return React.createElement(CheckMenu, {
      title: 'Results > View by Check > Select Check',
      accountText: props.accountText,
      checks,
      onSelect: setSelected,
      onBack: props.onBack
    });
  }

  if (loadingResults) {
    return React.createElement(LoadingScreen, {
      title: 'Results > View by Check',
      subtitle: `${props.accountText} | ${selected.id}`,
      message: 'Loading results...'
    });
  }

  if (results.length === 0) {
    return React.createElement(
      ScreenFrame,
      {
        title: 'Results > View by Check',
        subtitle: `${props.accountText} | ${selected.id}`,
        help: 'Enter a limit and press Enter. Esc to go back.'
      },
      React.createElement(Text, null, `Selected: ${selected.label || selected.id}`),
      React.createElement(Box, null,
        React.createElement(Text, null, 'Limit: '),
        React.createElement(TextInput, {
          value: limitInput,
          onChange: setLimitInput,
          onSubmit: submitLimit
        })
      )
    );
  }

  return React.createElement(
    ScreenFrame,
    {
      title: 'Results > View by Check',
      subtitle: `${props.accountText} | ${selected.id} | ${results.length} result(s)`,
      help: 'Press q or Esc to go back.'
    },
    results.map((result, index) => {
      const doc = result.doc || result;
      const status = doc.su ? 'SUCCESS' : 'FAILURE';
      const statusColor = doc.su ? 'green' : 'red';
      const when = formatTimestamp(doc.s || doc.t);
      const runtime = doc.rt !== undefined ? `${doc.rt}ms` : 'n/a';
      const message = doc.m ? truncateText(doc.m, 96) : '';
      return React.createElement(
        Box,
        { key: `${when}-${index}`, flexDirection: 'column', marginBottom: 1 },
        React.createElement(Text, null, `${when} | Runtime: ${runtime}`),
        React.createElement(Text, { color: statusColor }, status),
        message ? React.createElement(Text, { color: 'gray' }, message) : null
      );
    })
  );
}

function actionAccountInfo(props) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [accounts, setAccounts] = React.useState([]);

  React.useEffect(() => {
    let active = true;
    listAccounts()
      .then((data) => {
        if (!active) return;
        const list = Object.entries(data || {}).map(([id, account]) => ({ id, ...account }));
        setAccounts(list);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Failed to load accounts');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useInput((input, key) => {
    if (!loading && (input === 'q' || key.escape)) {
      props.onBack();
    }
  });

  if (loading) {
    return React.createElement(LoadingScreen, {
      title: 'Account > Account Info',
      subtitle: props.accountText,
      message: 'Loading account info...'
    });
  }

  if (error) {
    return React.createElement(ErrorScreen, {
      title: 'Account > Account Info',
      subtitle: props.accountText,
      error,
      onBack: props.onBack
    });
  }

  return React.createElement(
    ScreenFrame,
    {
      title: 'Account > Account Info',
      subtitle: `${props.accountText} | ${accounts.length} account(s)`,
      help: 'Press q or Esc to go back.'
    },
    accounts.length === 0
      ? React.createElement(Text, { color: 'yellow' }, 'No subaccounts found.')
      : accounts.map((account) => {
          const statusColor = account.status === 'Active' ? 'green' : 'gray';
          return React.createElement(
            Box,
            { key: account.id, flexDirection: 'column', marginBottom: 1 },
            React.createElement(Text, { color: 'cyan' }, account.id),
            React.createElement(Text, null, `  Name: ${account.name || 'Unnamed'}`),
            React.createElement(Text, { color: statusColor }, `  Status: ${account.status || 'Unknown'}`),
            account.parent ? React.createElement(Text, null, `  Parent: ${account.parent}`) : null
          );
        })
  );
}

function App(props) {
  const { exit } = useApp();
  const [screen, setScreen] = React.useState('main');
  const [accountId] = React.useState(props.initialAccountId || null);

  React.useEffect(() => {
    writeState({ lastAccountId: accountId });
  }, [accountId]);

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exit();
    }
  });

  const accountText = accountId ? `Account: ${accountId}` : 'Account: default';

  if (screen === 'main') {
    return React.createElement(MenuScreen, {
      title: 'NodePing CLI v2.0.0',
      subtitle: accountText,
      items: [
        { label: 'Checks', value: 'checks' },
        { label: 'Results', value: 'results' },
        { label: 'Account', value: 'account' },
        { label: 'Quit', value: 'quit' }
      ],
      onSelect: (value) => {
        if (value === 'quit') {
          exit();
        } else {
          setScreen(value);
        }
      },
      onBack: exit,
      help: 'Use up/down and Enter. q to quit.'
    });
  }

  if (screen === 'checks') {
    return React.createElement(MenuScreen, {
      title: 'Checks',
      subtitle: accountText,
      items: [
        { label: 'List All', value: 'checks-list' },
        { label: 'Filter by Pattern', value: 'checks-filter' },
        { label: 'View Details', value: 'checks-details' },
        { label: 'Delete', value: 'checks-delete' },
        { label: 'Back', value: 'main' }
      ],
      onSelect: (value) => setScreen(value),
      onBack: () => setScreen('main')
    });
  }

  if (screen === 'results') {
    return React.createElement(MenuScreen, {
      title: 'Results',
      subtitle: accountText,
      items: [
        { label: 'View Recent Results', value: 'results-recent' },
        { label: 'View by Check', value: 'results-by-check' },
        { label: 'Back', value: 'main' }
      ],
      onSelect: (value) => setScreen(value),
      onBack: () => setScreen('main')
    });
  }

  if (screen === 'account') {
    return React.createElement(MenuScreen, {
      title: 'Account',
      subtitle: accountText,
      items: [
        { label: 'Account Info', value: 'account-info' },
        { label: 'Back', value: 'main' }
      ],
      onSelect: (value) => setScreen(value),
      onBack: () => setScreen('main')
    });
  }

  if (screen === 'checks-list') {
    return React.createElement(actionListAllChecks, {
      accountId,
      accountText,
      onBack: () => setScreen('checks')
    });
  }

  if (screen === 'checks-filter') {
    return React.createElement(actionFilterChecks, {
      accountId,
      accountText,
      onBack: () => setScreen('checks')
    });
  }

  if (screen === 'checks-details') {
    return React.createElement(actionViewCheckDetails, {
      accountId,
      accountText,
      onBack: () => setScreen('checks')
    });
  }

  if (screen === 'checks-delete') {
    return React.createElement(actionDeleteCheck, {
      accountId,
      accountText,
      onBack: () => setScreen('checks')
    });
  }

  if (screen === 'results-recent') {
    return React.createElement(actionViewRecentResults, {
      accountId,
      accountText,
      onBack: () => setScreen('results')
    });
  }

  if (screen === 'results-by-check') {
    return React.createElement(actionViewResultsByCheck, {
      accountId,
      accountText,
      onBack: () => setScreen('results')
    });
  }

  if (screen === 'account-info') {
    return React.createElement(actionAccountInfo, {
      accountId,
      accountText,
      onBack: () => setScreen('account')
    });
  }

  return React.createElement(MenuScreen, {
    title: 'NodePing CLI',
    subtitle: accountText,
    items: [{ label: 'Back to Main', value: 'main' }],
    onSelect: () => setScreen('main'),
    onBack: () => setScreen('main')
  });
}

function printHelp() {
  console.log(`NodePing TUI\n\nUsage:\n  nodeping\n  nodeping tui\n\nKeys:\n  Up/Down   Move selection\n  Enter     Select\n  q / Esc   Back / quit\n  Ctrl+C    Quit\n`);
}

async function runInkTui(args) {
  const argv = Array.isArray(args) ? args : [];
  if (argv.includes('--help') || argv.includes('-h')) {
    printHelp();
    return;
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('Interactive TUI requires a TTY terminal');
  }

  const state = readState();
  const app = render(React.createElement(App, { initialAccountId: state.lastAccountId }));
  await app.waitUntilExit();
}

module.exports = {
  runInkTui,
  listChecks,
  deleteCheck,
  listAccounts,
  getResults,
  actionListAllChecks,
  actionFilterChecks,
  actionViewCheckDetails,
  actionDeleteCheck,
  actionViewRecentResults,
  actionViewResultsByCheck,
  actionAccountInfo,
  selectMenu,
  MenuScreen
};
