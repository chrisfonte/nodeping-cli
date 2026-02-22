# Contributing to NodePing CLI

Thank you for your interest in contributing to the NodePing CLI! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and collaborative environment for all contributors.

## Getting Started

### Prerequisites

- Node.js v14.0.0 or higher
- A NodePing account with API access (for testing)
- Git for version control

### Setting Up Development Environment

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/yourusername/nodeping-cli.git
   cd nodeping-cli
   ```

2. **Make the CLI executable**:
   ```bash
   chmod +x nodeping
   ```

3. **Set up API credentials** (for testing):
   ```bash
   mkdir -p ~/.credentials/nodeping
   echo "YOUR_API_TOKEN" > ~/.credentials/nodeping/api_token
   ```

4. **Run tests to verify setup**:
   ```bash
   node test.js
   ```

## Development Workflow

### Branch Strategy

- `main` - Stable, production-ready code
- Feature branches - `feature/your-feature-name`
- Bug fixes - `fix/bug-description`

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation as needed

3. **Test your changes**:
   ```bash
   # Run the test suite
   node test.js
   
   # Test manually with the CLI
   ./nodeping --help
   ./nodeping checks list
   ```

4. **Update documentation**:
   - Update `README.md` if adding new features
   - Update `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/) format
   - Add inline code comments for complex logic

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   Use conventional commit messages:
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `test:` - Test additions or changes
   - `refactor:` - Code refactoring
   - `chore:` - Maintenance tasks

6. **Push and create a pull request**:
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style Guidelines

### JavaScript Style

- **No external dependencies** - This project uses only Node.js stdlib
- **Use modern JavaScript** - ES6+ syntax is preferred
- **Async/await** - Use for asynchronous operations
- **Error handling** - Always handle errors gracefully with clear messages
- **Comments** - Add JSDoc comments for functions

### CLI Output Style

- **Colors** - Use ANSI colors for better UX (already defined in `colors` object)
- **Clear messages** - Error messages should be actionable
- **Consistent formatting** - Follow existing output patterns

### Example Function Structure

```javascript
/**
 * Brief description of what this function does
 * @param {string} param1 - Description
 * @param {Object} options - Options object
 * @returns {Promise<Object>} Description of return value
 */
async function myFunction(param1, options = {}) {
  try {
    // Implementation
    const result = await apiRequest('GET', '/endpoint');
    return result;
  } catch (err) {
    console.error(`${colors.red}Error:${colors.reset} ${err.message}`);
    process.exit(1);
  }
}
```

## Testing

### Running Tests

```bash
node test.js
```

### Adding Tests

When adding new features, include tests in `test.js`:

```javascript
test('Description of what is being tested', () => {
  // Test implementation
  const result = exec('./nodeping your-command');
  assert(result.includes('expected output'), 'Should produce expected output');
});
```

### Manual Testing Checklist

Before submitting a PR, manually test:

- [ ] `nodeping --help` shows updated help text
- [ ] `nodeping --version` displays correct version
- [ ] New commands work with `--json` flag
- [ ] Error handling works (try invalid inputs)
- [ ] Works with and without `--account` flag (if applicable)

## Documentation

### README Updates

When adding features, update:
- **Features** section - List new capabilities
- **Usage** section - Add examples
- **Command Reference** - Document new commands/options

### CHANGELOG Updates

Follow [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [Unreleased]

### Added
- New feature description

### Changed
- Changed behavior description

### Fixed
- Bug fix description
```

## Submitting Pull Requests

### Before Submitting

- [ ] All tests pass (`node test.js`)
- [ ] Code follows project style guidelines
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] Commit messages follow conventional format
- [ ] No new dependencies added (unless absolutely necessary and discussed first)

### PR Description

Include in your PR:
1. **What** - What does this PR do?
2. **Why** - Why is this change needed?
3. **How** - How does it work?
4. **Testing** - How was it tested?

### Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged

## Feature Requests and Bug Reports

### Opening Issues

- Use the appropriate issue template (Bug Report or Feature Request)
- Provide clear, detailed information
- Include steps to reproduce for bugs
- For features, explain the use case

### Good Bug Reports Include

1. Clear description of the bug
2. Steps to reproduce
3. Expected vs actual behavior
4. Environment details (OS, Node version, CLI version)
5. Error messages or output

### Good Feature Requests Include

1. Clear description of the feature
2. Use case / problem it solves
3. Proposed solution or API
4. Alternative solutions considered

## Project Architecture

### File Structure

```
nodeping-cli/
├── nodeping           # Main CLI script (single-file architecture)
├── src/               # TUI implementation (Ink)
│   └── tui.js
├── test.js           # Test suite
├── package.json      # NPM package configuration
├── README.md         # User documentation
├── CHANGELOG.md      # Version history
├── CONTRIBUTING.md   # This file
├── LICENSE          # MIT License
├── .github/         # GitHub templates
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
└── examples/        # Example scripts and use cases
```

### Design Principles

1. **Single-file CLI** - Keep the core CLI in one file for easy deployment
2. **Minimal dependencies** - Use stdlib for core CLI, Ink for TUI
3. **Clear error messages** - Always provide actionable feedback
4. **Consistent UX** - Follow established patterns for commands and output

## Questions?

If you have questions:
- Open a GitHub issue
- Check existing issues and PRs
- Review the README and project documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to NodePing CLI! 🎉
