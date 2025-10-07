# Contributing to SOS Academy Platform

First off, thank you for considering contributing to the Shinobi Open-Source Academy Platform! It's people like you that make this community-driven platform a great tool for developers worldwide.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Issue Guidelines](#issue-guidelines)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@shinobi-open-source.academy](mailto:conduct@shinobi-open-source.academy).

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sos-academy-platform.git
   cd sos-academy-platform
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Shinobi-Open-Source-Academy-SOS-Academy/sos-academy-platform.git
   ```
4. **Install dependencies**:
   ```bash
   pnpm install
   ```
5. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```
6. **Start development**:
   ```bash
   pnpm start
   ```

## 🤝 How Can I Contribute?

### Reporting Bugs

**Before creating a bug report**, please check the [existing issues](https://github.com/Shinobi-Open-Source-Academy-SOS-Academy/sos-academy-platform/issues) to avoid duplicates.

**When creating a bug report**, include:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)
- Relevant logs or error messages

### Suggesting Enhancements

**Enhancement suggestions** are tracked as GitHub issues. When creating an enhancement suggestion:
- Use a clear, descriptive title
- Provide a detailed description of the proposed feature
- Explain why this enhancement would be useful
- Include mockups or examples if applicable

### Contributing Code

We actively welcome your pull requests:

1. **Small fixes** (typos, docs, small bugs) can be submitted directly
2. **Larger changes** should have an associated issue for discussion first
3. **New features** require prior discussion and approval from maintainers

## 🔄 Development Workflow

### 1. Create a Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-number-description
```

**Branch naming conventions:**
- `feature/` - New features
- `bugfix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow our [coding standards](#coding-standards)
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

### 3. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add user profile page"
git commit -m "fix: resolve email validation bug"
git commit -m "docs: update API documentation"
```

**Commit types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Test updates
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements

### 4. Keep Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 📥 Pull Request Process

### Before Submitting

- [ ] Code follows our coding standards
- [ ] All tests pass: `pnpm test`
- [ ] Code is properly formatted: `pnpm check`
- [ ] Documentation is updated
- [ ] Commits follow conventional commit format
- [ ] Branch is up to date with main

### PR Title Format

Use the same format as commits:

```
feat: add user authentication
fix: resolve database connection issue
docs: update contribution guidelines
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Fixes #(issue number)

## How Has This Been Tested?
Describe testing done

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated checks** must pass (CI/CD, linting, tests)
2. **At least one maintainer** must approve
3. **All conversations** must be resolved
4. **No merge conflicts** with main branch
5. **Squash and merge** will be used for merging

## 💻 Coding Standards

### General Guidelines

- **Code Quality**: Write clean, maintainable, self-documenting code
- **Comments**: Add comments for complex logic, not obvious code
- **DRY Principle**: Don't repeat yourself - reuse code where possible
- **SOLID Principles**: Follow SOLID design principles
- **Error Handling**: Always handle errors gracefully

### TypeScript/JavaScript

- Use **TypeScript** for type safety
- Use **functional components** in React
- Use **async/await** over promises when possible
- Avoid `any` type - use proper typing
- Use **const** by default, **let** when needed, avoid **var**

### Formatting

We use **Biome** for code formatting and linting:

```bash
# Format code
pnpm format

# Check formatting
pnpm format:check

# Fix linting issues
pnpm lint:fix

# Check everything
pnpm check:fix
```

**Pre-commit hook** automatically formats code before commits.

### File Organization

```
apps/
├── frontend/          # Next.js application
│   ├── app/          # App router pages
│   ├── components/   # React components
│   ├── lib/          # Utilities and hooks
│   └── public/       # Static assets
└── server/           # NestJS application
    ├── src/
    │   ├── modules/  # Feature modules
    │   ├── common/   # Shared utilities
    │   └── main.ts   # Entry point
```

### Naming Conventions

- **Files**: `kebab-case.ts`, `PascalCase.tsx` (React components)
- **Variables/Functions**: `camelCase`
- **Classes/Interfaces**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Components**: `PascalCase`
- **Hooks**: `useCamelCase`

### Testing

- Write tests for new features
- Maintain existing test coverage
- Use descriptive test names
- Test edge cases and error scenarios

```typescript
describe('UserService', () => {
  it('should create a new user successfully', async () => {
    // Test implementation
  });
});
```

## 🐛 Issue Guidelines

### Creating Issues

Use our issue templates:
- **Bug Report**: For reporting bugs
- **Feature Request**: For suggesting enhancements
- **Documentation**: For documentation improvements

### Issue Title Format

- **Bug**: `[BUG] Clear description of the issue`
- **Feature**: `[FEATURE] Clear description of the feature`
- **Docs**: `[DOCS] Clear description of the update`

### Labels

Issues are categorized with labels:
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation updates
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high/medium/low` - Priority levels
- `status: in-progress` - Currently being worked on
- `status: needs-review` - Needs review

### Assignment

- **Don't assign yourself** to issues without discussion
- **Comment on the issue** expressing interest
- **Wait for maintainer approval** before starting work
- **One issue per person** at a time for fairness

## 👥 Community

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: General questions, ideas
- **Discord**: [Join our Discord](https://discord.gg/9Wgx7bCh)
- **Twitter**: [@SOSAcademy_](https://x.com/SOSAcademy_)

### Getting Help

- Check existing [documentation](README.md)
- Search [closed issues](https://github.com/Shinobi-Open-Source-Academy-SOS-Academy/sos-academy-platform/issues?q=is%3Aissue+is%3Aclosed)
- Ask in [GitHub Discussions](https://github.com/Shinobi-Open-Source-Academy-SOS-Academy/sos-academy-platform/discussions)
- Join our [Discord community](https://discord.gg/9Wgx7bCh)

## 🎓 Recognition

Contributors are recognized in several ways:
- Listed in [CONTRIBUTORS.md](CONTRIBUTORS.md)
- Mentioned in release notes
- Featured on our website
- Community appreciation posts

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

## Quick Reference

```bash
# Setup
pnpm install
cp .env.example .env

# Development
pnpm start              # Start both backend and frontend
pnpm start:backend      # Backend only
pnpm start:frontend     # Frontend only

# Code Quality
pnpm format            # Format code
pnpm lint:fix          # Fix linting issues
pnpm check:fix         # Format + lint

# Testing
pnpm test              # Run tests
pnpm test:watch        # Watch mode

# Build
pnpm build             # Build for production
```

---

**Thank you for contributing to SOS Academy! Together, we're building something amazing! 🚀**

