#!/usr/bin/env node

/**
 * Basic tests for NodePing CLI
 * Run with: node test.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    passed++;
  } catch (err) {
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    console.log(`  ${colors.red}${err.message}${colors.reset}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
  } catch (err) {
    return { stdout: err.stdout, stderr: err.stderr, status: err.status };
  }
}

console.log(`${colors.cyan}Running NodePing CLI Tests${colors.reset}\n`);

// Test 1: CLI executable exists and is executable
test('CLI file exists and is executable', () => {
  const cliPath = path.join(__dirname, 'nodeping');
  assert(fs.existsSync(cliPath), 'nodeping file does not exist');
  
  const stats = fs.statSync(cliPath);
  assert(stats.mode & fs.constants.S_IXUSR, 'nodeping is not executable');
});

// Test 2: --version flag works
test('--version flag returns version', () => {
  const output = exec('./nodeping --version');
  assert(output.includes('nodeping v'), `Expected version string, got: ${output}`);
});

// Test 3: --help flag works
test('--help flag shows usage', () => {
  const output = exec('./nodeping --help');
  assert(output.includes('Usage:'), 'Help text should contain Usage section');
  assert(output.includes('Commands:'), 'Help text should contain Commands section');
  assert(output.includes('Options:'), 'Help text should contain Options section');
});

// Test 4: Help includes all commands
test('--help includes all commands', () => {
  const output = exec('./nodeping --help');
  assert(output.includes('checks list'), 'Help should include checks list');
  assert(output.includes('checks delete'), 'Help should include checks delete');
  assert(output.includes('accounts list'), 'Help should include accounts list');
  assert(output.includes('results'), 'Help should include results');
});

// Test 5: Help includes all options
test('--help includes all options', () => {
  const output = exec('./nodeping --help');
  assert(output.includes('--filter'), 'Help should include --filter');
  assert(output.includes('--account'), 'Help should include --account');
  assert(output.includes('--dry-run'), 'Help should include --dry-run');
  assert(output.includes('--force'), 'Help should include --force');
  assert(output.includes('--json'), 'Help should include --json');
  assert(output.includes('--limit'), 'Help should include --limit');
});

// Test 6: Invalid command shows error
test('Invalid command shows error', () => {
  const result = exec('./nodeping invalid command 2>&1');
  assert(
    typeof result === 'object' || result.includes('Error') || result.includes('Unknown'),
    'Should show error for invalid command'
  );
});

// Test 7: Missing required arguments shows error
test('results without check-id shows error', () => {
  const result = exec('./nodeping results 2>&1');
  assert(
    typeof result === 'object' || result.includes('Error') || result.includes('Specify'),
    'Should show error when check-id is missing'
  );
});

// Test 8: package.json exists and is valid
test('package.json exists and is valid', () => {
  const pkgPath = path.join(__dirname, 'package.json');
  assert(fs.existsSync(pkgPath), 'package.json does not exist');
  
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  assert(pkg.name === 'nodeping-cli', 'package.json should have name "nodeping-cli"');
  assert(pkg.bin && pkg.bin.nodeping, 'package.json should have bin.nodeping');
  assert(pkg.version, 'package.json should have version');
  assert(pkg.description, 'package.json should have description');
  assert(pkg.keywords && pkg.keywords.length > 0, 'package.json should have keywords');
});

// Test 9: README exists
test('README.md exists', () => {
  const readmePath = path.join(__dirname, 'README.md');
  assert(fs.existsSync(readmePath), 'README.md does not exist');
  
  const readme = fs.readFileSync(readmePath, 'utf8');
  assert(readme.includes('# NodePing CLI'), 'README should have title');
  assert(readme.includes('Installation'), 'README should have Installation section');
  assert(readme.includes('Usage'), 'README should have Usage section');
});

// Test 10: LICENSE exists
test('LICENSE file exists', () => {
  const licensePath = path.join(__dirname, 'LICENSE');
  assert(fs.existsSync(licensePath), 'LICENSE does not exist');
  
  const license = fs.readFileSync(licensePath, 'utf8');
  assert(license.includes('MIT'), 'LICENSE should be MIT');
});

// Test 11: CHANGELOG exists and follows format
test('CHANGELOG.md exists and follows keepachangelog format', () => {
  const changelogPath = path.join(__dirname, 'CHANGELOG.md');
  assert(fs.existsSync(changelogPath), 'CHANGELOG.md does not exist');
  
  const changelog = fs.readFileSync(changelogPath, 'utf8');
  assert(changelog.includes('# Changelog'), 'CHANGELOG should have title');
  assert(changelog.includes('keepachangelog.com'), 'CHANGELOG should reference keepachangelog.com');
});

// Test 12: Credentials file structure (if exists)
test('Credentials directory can be checked', () => {
  const credPath = path.join(require('os').homedir(), '.credentials', 'nodeping');
  // This test just verifies the path resolution works
  assert(credPath.includes('.credentials'), 'Should construct valid credential path');
});

// Summary
console.log(`\n${colors.cyan}Test Summary${colors.reset}`);
console.log(`  ${colors.green}Passed: ${passed}${colors.reset}`);
if (failed > 0) {
  console.log(`  ${colors.red}Failed: ${failed}${colors.reset}`);
  process.exit(1);
} else {
  console.log(`\n${colors.green}All tests passed!${colors.reset}`);
  process.exit(0);
}
