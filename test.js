#!/usr/bin/env node

/**
 * NodePing CLI Test Suite
 * Tests CLI argument parsing, help output, error handling, and utility functions.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CLI = path.join(__dirname, 'nodeping');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    console.log(`${colors.green}✓${colors.reset} ${message}`);
    passed++;
  } else {
    console.log(`${colors.red}✗${colors.reset} ${message}`);
    failed++;
    failures.push(message);
  }
}

function run(args, expectFail = false) {
  try {
    const output = execSync(`${CLI} ${args}`, {
      encoding: 'utf8',
      timeout: 15000,
      env: { ...process.env, NO_COLOR: '1' }
    });
    return { output: output.trim(), exitCode: 0 };
  } catch (err) {
    if (expectFail) {
      return { output: (err.stderr || err.stdout || '').trim(), exitCode: err.status };
    }
    throw err;
  }
}

console.log(`${colors.cyan}Running NodePing CLI Tests${colors.reset}\n`);

// ──── File Structure ────

assert(fs.existsSync(CLI), 'CLI file exists');
assert((fs.statSync(CLI).mode & 0o111) !== 0, 'CLI file is executable');
assert(fs.existsSync(path.join(__dirname, 'README.md')), 'README.md exists');
assert(fs.existsSync(path.join(__dirname, 'QUICKSTART.md')), 'QUICKSTART.md exists');
assert(fs.existsSync(path.join(__dirname, 'CHANGELOG.md')), 'CHANGELOG.md exists');
assert(fs.existsSync(path.join(__dirname, 'LICENSE')), 'LICENSE file exists');
assert(fs.existsSync(path.join(__dirname, 'CONTRIBUTING.md')), 'CONTRIBUTING.md exists');
assert(fs.existsSync(path.join(__dirname, 'API_COVERAGE.md')), 'API_COVERAGE.md exists');

// ──── Package.json ────

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
assert(pkg.name === 'nodeping-cli', 'package.json name is correct');
assert(pkg.version === '2.0.0', 'package.json version is 2.0.0');
assert(pkg.license === 'MIT', 'package.json license is MIT');
assert(pkg.bin && pkg.bin.nodeping === './nodeping', 'package.json bin entry is correct');
assert(pkg.engines && pkg.engines.node, 'package.json has engines.node');
assert(pkg.repository && pkg.repository.url, 'package.json has repository URL');
assert(pkg.bugs && pkg.bugs.url, 'package.json has bugs URL');
assert(pkg.homepage, 'package.json has homepage');
assert(pkg.keywords && pkg.keywords.length >= 5, 'package.json has keywords');
assert(pkg.files && pkg.files.includes('nodeping'), 'package.json files includes CLI');
assert(pkg.files && pkg.files.includes('README.md'), 'package.json files includes README');

// ──── Version ────

const { output: versionOutput } = run('--version');
assert(versionOutput.includes('2.0.0'), '--version shows 2.0.0');

const { output: versionShort } = run('-v');
assert(versionShort.includes('2.0.0'), '-v shows 2.0.0');

// ──── Help ────

const { output: helpOutput } = run('--help');
assert(helpOutput.includes('NodePing CLI'), '--help shows title');
assert(helpOutput.includes('checks'), '--help includes checks command');
assert(helpOutput.includes('contacts'), '--help includes contacts command');
assert(helpOutput.includes('schedules'), '--help includes schedules command');
assert(helpOutput.includes('accounts'), '--help includes accounts command');
assert(helpOutput.includes('results'), '--help includes results command');
assert(helpOutput.includes('info'), '--help includes info command');
assert(helpOutput.includes('sync'), '--help includes sync command');
assert(helpOutput.includes('tui'), '--help includes tui command');
assert(helpOutput.includes('--account'), '--help includes --account option');
assert(helpOutput.includes('--json'), '--help includes --json option');
assert(helpOutput.includes('--force'), '--help includes --force option');
assert(helpOutput.includes('--dry-run'), '--help includes --dry-run option');
assert(helpOutput.includes('--filter'), '--help includes --filter option');
assert(helpOutput.includes('--contact'), '--help includes --contact option');
assert(helpOutput.includes('--location'), '--help includes --location option');
assert(helpOutput.includes('PING'), '--help includes PING check type');
assert(helpOutput.includes('DNS'), '--help includes DNS check type');
assert(helpOutput.includes('SSL'), '--help includes SSL check type');
assert(helpOutput.includes('PORT'), '--help includes PORT check type');
assert(helpOutput.includes('api_token'), '--help includes token path');
assert(helpOutput.includes('Examples'), '--help includes examples section');

// ──── TUI Help ────

const { output: tuiHelp } = run('tui --help');
assert(tuiHelp.includes('TUI'), 'tui --help shows TUI info');
assert(tuiHelp.includes('Enter'), 'tui --help mentions Enter key');

// ──── Error Handling ────

const { output: unknownCmd } = run('foobar', true);
assert(unknownCmd.includes('Unknown command'), 'Unknown command shows error');

const { output: noCheckId } = run('results', true);
assert(noCheckId.includes('Specify a check ID'), 'results without ID shows error');

const { output: noDeleteId } = run('checks delete', true);
assert(noDeleteId.includes('Specify a check ID'), 'checks delete without ID shows error');

const { output: noUpdateId } = run('checks update', true);
assert(noUpdateId.includes('Specify a check ID'), 'checks update without ID shows error');

const { output: noContactId } = run('contacts get', true);
assert(noContactId.includes('Specify a contact ID'), 'contacts get without ID shows error');

const { output: noScheduleId } = run('schedules get', true);
assert(noScheduleId.includes('Specify a schedule'), 'schedules get without ID shows error');

const { output: noCreateName } = run('contacts create --force', true);
assert(noCreateName.includes('Missing required --name'), 'contacts create without --name shows error');

// ──── Unknown Options ────

const { output: unknownOpt } = run('checks list --foobar', true);
assert(unknownOpt.includes('Unknown option'), 'Unknown option shows error');

// ──── Utility Functions ────

const cli = require('./nodeping');

// normalizeTarget tests
assert(cli.normalizeTarget('https://example.com') === 'https://example.com', 'normalizeTarget: simple URL unchanged');
assert(cli.normalizeTarget('https://example.com/') === 'https://example.com', 'normalizeTarget: trailing slash removed');
assert(cli.normalizeTarget('https://edge.example.com/stream') === 'https://origin.example.com/stream', 'normalizeTarget: edge → origin');
assert(cli.normalizeTarget('https://example.com/stream-mp3') === 'https://example.com/stream', 'normalizeTarget: -mp3 suffix removed');
assert(cli.normalizeTarget('https://example.com/stream-icy') === 'https://example.com/stream', 'normalizeTarget: -icy suffix removed');
assert(cli.normalizeTarget('https://example.com/stream/playlist.m3u8') === 'https://example.com/stream', 'normalizeTarget: playlist.m3u8 removed');
assert(cli.normalizeTarget('https://example.com:443/path') === 'https://example.com/path', 'normalizeTarget: default port 443 removed');
assert(cli.normalizeTarget('http://example.com:80/path') === 'http://example.com/path', 'normalizeTarget: default port 80 removed');

// normalizeHostname tests
assert(cli.normalizeHostname('EXAMPLE.COM') === 'example.com', 'normalizeHostname: lowercased');
assert(cli.normalizeHostname('edge.example.com') === 'origin.example.com', 'normalizeHostname: edge prefix replaced');

// buildCheckKey tests
const testCheck = { label: 'Test', type: 'HTTP', parameters: { target: 'https://example.com' } };
const key = cli.buildCheckKey(testCheck, false);
assert(key === 'HTTP::test::https://example.com', 'buildCheckKey: produces correct key');

const keyNorm = cli.buildCheckKey(testCheck, true);
assert(keyNorm.includes('HTTP::test::'), 'buildCheckKey: normalized produces key');

// normalizeComparableCheck tests
const comparable = cli.normalizeComparableCheck({ label: '  Test  ', type: 'http', enable: 'active' }, false);
assert(comparable.label === 'Test', 'normalizeComparableCheck: trims label');
assert(comparable.type === 'HTTP', 'normalizeComparableCheck: uppercases type');
assert(comparable.enable === 'active', 'normalizeComparableCheck: preserves enable');

// ──── Changelog Format ────

const changelog = fs.readFileSync(path.join(__dirname, 'CHANGELOG.md'), 'utf8');
assert(changelog.includes('## [2.0.0]'), 'CHANGELOG has 2.0.0 entry');
assert(changelog.includes('### Added'), 'CHANGELOG follows keepachangelog format');
assert(changelog.includes('Keep a Changelog'), 'CHANGELOG references keepachangelog.com');

// ──── PII Check ────

const readme = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
assert(!readme.includes('/Users/chrisfonte'), 'README has no hardcoded user paths');
assert(!readme.includes('fontasticllc'), 'README has no PII (fontasticllc)');
assert(!readme.includes('rfcmedia'), 'README has no PII (rfcmedia)');

const quickstart = fs.readFileSync(path.join(__dirname, 'QUICKSTART.md'), 'utf8');
assert(!quickstart.includes('/Users/chrisfonte'), 'QUICKSTART has no hardcoded user paths');

// ──── License ────

const license = fs.readFileSync(path.join(__dirname, 'LICENSE'), 'utf8');
assert(license.includes('MIT'), 'LICENSE is MIT');

// ──── Sync Plan Test ────

const desiredFile = path.join(__dirname, 'examples', 'desired-checks.example.json');
if (fs.existsSync(desiredFile)) {
  const desired = JSON.parse(fs.readFileSync(desiredFile, 'utf8'));
  assert(Array.isArray(desired) || (typeof desired === 'object' && desired !== null), 'Example desired-checks file is valid JSON');
}

// ──── Summary ────

console.log(`\n${colors.cyan}Test Summary${colors.reset}`);
console.log(`  ${colors.green}Passed: ${passed}${colors.reset}`);
if (failed > 0) {
  console.log(`  ${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`\n${colors.red}Failures:${colors.reset}`);
  failures.forEach(f => console.log(`  ${colors.red}✗${colors.reset} ${f}`));
  process.exit(1);
} else {
  console.log(`\n${colors.green}All tests passed!${colors.reset}`);
}
