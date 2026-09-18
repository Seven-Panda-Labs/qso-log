# Security Policy

We appreciate responsible disclosure of security issues.

## Reporting a vulnerability

**Do not open a public issue** for a security problem.

Email **[security@sevenpanda.eu](mailto:security@sevenpanda.eu)**.

Include when possible:

- Description of the issue and its impact
- Steps to reproduce
- Affected version (commit, tag, or `package.json`)
- Proof of concept or relevant logs, with no real user data

## What to expect

- Acknowledgement within **72 hours** (business days)
- A status update as soon as we have investigated
- Coordination with you before public disclosure, when applicable

## Scope

In scope:

- Authentication and authorization (Firestore rules, any server side function)
- Cross user data exposure, for example one operator reading another's log
- Injection, XSS, or CSRF in the web app
- ADIF import handling (malicious or malformed files)
- Documented insecure configuration that affects self-hosted deployments

Typically out of scope: missing rate limits without a demonstrated exploit, issues requiring physical access to the victim's unlocked device, and reports against third party services we do not operate.

## Supported versions

Security fixes land on `main`. Older releases may not receive backports.

## Secret detection

**CI:** every PR and push to `main` runs [Gitleaks](https://github.com/gitleaks/gitleaks) via [`.github/workflows/secret-scan.yml`](.github/workflows/secret-scan.yml), configured in [`.gitleaks.toml`](.gitleaks.toml). Organization repositories need a free license from [gitleaks.io](https://gitleaks.io) in the `GITLEAKS_LICENSE` repository secret.

**GitHub native:** under **Settings → Code security and analysis**, enable **Secret scanning** and **Push protection**. Both are free on public repositories.

Never commit `.env.local`, `.firebaserc`, `*-service-account*.json`, or real API keys.

## Responsible disclosure

Please do not publish details until we have had a chance to fix the issue and notify users, unless we agree otherwise.
