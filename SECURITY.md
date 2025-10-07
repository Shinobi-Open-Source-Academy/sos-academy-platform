# Security Policy

## 🔒 Reporting a Vulnerability

The SOS Academy team takes security seriously. We appreciate your efforts to responsibly disclose your findings and will make every effort to acknowledge your contributions.

### How to Report a Security Vulnerability

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisories** (Preferred)
   - Go to the [Security tab](https://github.com/Shinobi-Open-Source-Academy-SOS-Academy/sos-academy-platform/security/advisories/new)
   - Click "Report a vulnerability"
   - Fill out the form with detailed information

2. **Email**
   - Send details to: **security@shinobi-open-source.academy**
   - Use subject line: `[SECURITY] Brief description`
   - Include detailed information (see below)

### What to Include in Your Report

To help us better understand and resolve the issue, please include as much of the following information as possible:

- **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass)
- **Full paths** of source file(s) related to the vulnerability
- **Location** of the affected source code (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact** of the vulnerability
- **Potential fix** or mitigation (if you have suggestions)

### What to Expect

After you submit a report, here's what will happen:

1. **Acknowledgment**: We'll acknowledge receipt of your vulnerability report within **48 hours**
2. **Investigation**: We'll investigate and validate the issue within **7 days**
3. **Updates**: We'll keep you informed about our progress every **7-14 days**
4. **Resolution**: We'll work on a fix and coordinate a release
5. **Disclosure**: We'll coordinate the public disclosure with you
6. **Credit**: We'll publicly acknowledge your responsible disclosure (unless you prefer to remain anonymous)

### Disclosure Policy

- **Private Disclosure Period**: We ask that you give us a reasonable amount of time to fix the vulnerability before any public disclosure
- **Coordinated Disclosure**: We believe in coordinated disclosure and will work with you to determine an appropriate disclosure timeline
- **Public Disclosure**: Once a fix is released, we'll publish a security advisory
- **CVE Assignment**: For significant vulnerabilities, we'll request a CVE ID

## 🛡️ Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| main    | ✅ Yes             |
| < 1.0   | ❌ No              |

**Note**: As we're in active development (pre-1.0), we only support the latest version on the `main` branch.

## 🔐 Security Best Practices

### For Contributors

When contributing code, please:

- **Never commit sensitive data** (API keys, passwords, tokens, etc.)
- **Use environment variables** for all secrets and configuration
- **Validate all inputs** to prevent injection attacks
- **Follow secure coding guidelines** for the technology stack
- **Run security linters** before submitting PRs
- **Keep dependencies updated** and check for known vulnerabilities
- **Review the code** for potential security issues before submitting

### For Users/Deployers

When deploying this application:

- **Use strong secrets**: Generate secure random values for `JWT_SECRET` and other secrets
- **Enable HTTPS**: Always use HTTPS in production
- **Secure your database**: Use strong MongoDB credentials and network isolation
- **Environment variables**: Never commit `.env` files to version control
- **Regular updates**: Keep your deployment updated with the latest security patches
- **Principle of least privilege**: Run services with minimal required permissions
- **Monitor logs**: Set up logging and monitoring for suspicious activities
- **Rate limiting**: Implement rate limiting to prevent abuse
- **CORS configuration**: Properly configure CORS for your domain

## 🔍 Security Features

### Current Security Measures

- **Input Validation**: Class-validator for request validation
- **Environment Variables**: Sensitive data stored in environment variables
- **Password Security**: Bcrypt hashing for passwords (when implemented)
- **CORS**: Configurable CORS settings
- **Helmet**: Security headers (planned)
- **Rate Limiting**: API rate limiting (planned)
- **SQL Injection Protection**: MongoDB's built-in protections
- **XSS Protection**: React's built-in XSS protections

### Planned Security Enhancements

- [ ] OAuth2/OIDC authentication
- [ ] API key rotation system
- [ ] Security audit logging
- [ ] Automated dependency vulnerability scanning
- [ ] Content Security Policy (CSP)
- [ ] CSRF protection
- [ ] Advanced rate limiting
- [ ] Security headers with Helmet.js
- [ ] Regular security audits

## 🏆 Security Hall of Fame

We recognize and thank security researchers who help keep SOS Academy safe:

<!-- Contributors who report valid security issues will be listed here -->

_No vulnerabilities reported yet. Be the first to help secure SOS Academy!_

## 📚 Security Resources

### Secure Development Guidelines

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

### Tools and Scanning

We use the following tools to maintain security:

- **Dependabot**: Automated dependency updates
- **npm audit**: Dependency vulnerability scanning
- **Biome**: Code quality and linting
- **GitHub Secret Scanning**: Prevent secret commits

### Regular Security Checks

```bash
# Check for dependency vulnerabilities
pnpm audit

# Fix automatically if possible
pnpm audit --fix

# Check for outdated dependencies
pnpm outdated
```

## ⚖️ Bug Bounty Program

We currently **do not have a bug bounty program**, but we deeply appreciate security research and will publicly acknowledge your contributions.

## 📞 Contact

For security-related questions or concerns:

- **Security Email**: security@shinobi-open-source.academy
- **General Email**: contact@shinobi-open-source.academy
- **Discord**: [Join our Discord](https://discord.gg/9Wgx7bCh) (for non-sensitive discussions)

---

**Thank you for helping keep SOS Academy and our community safe!** 🙏

_Last Updated: October 2025_
