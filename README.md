<p align="center">
  <a href="https://github.com/Seven-Panda-Labs/qso-log/actions/workflows/ci.yml"><img src="https://github.com/Seven-Panda-Labs/qso-log/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/Seven-Panda-Labs/qso-log" alt="license"></a>
</p>

# QSO Log

A simple, open source, cross platform logbook for ham radio operators. Works offline, syncs when online, runs on any device with a browser.

> **Status: early development.** The product brief and the project foundations are in place; the application scaffold is not committed yet. Commands marked *(planned)* below do not exist until the scaffold lands.

## Why

Most logging software is Windows only, complex, or locked to a single vendor. QSO Log aims for the opposite: log a contact in seconds, on a phone in the field or a desktop at home, with your data in an open format you can export at any time.

- **Simple by default**: log a QSO without reading a manual
- **Offline first**: full function with no connectivity, sync on reconnect
- **Cross platform**: installable PWA on desktop, tablet, and phone
- **Open data**: ADIF import and export, no lock-in
- **Open source**: AGPL-3.0, community driven

Full scope, target audience, and roadmap: [`docs/PRODUCT_BRIEF.md`](docs/PRODUCT_BRIEF.md).

## Stack

React · TypeScript · Vite · Firebase (Auth, Firestore, Hosting) · PWA (Workbox) · Vitest

Details and the reasoning behind each choice: [`docs/architecture.md`](docs/architecture.md).

## Local development

**Requirements:** Node.js 24 (Java 21+ if you run the Firebase emulators)

```bash
git clone https://github.com/Seven-Panda-Labs/qso-log.git
cd qso-log
npm install                    # (planned)
cp .env.example .env.local     # (planned)
npm run setup:githooks         # enable the pre-commit / pre-push hooks, once per clone
npm run dev                    # (planned) http://localhost:5173
```

Environment variables: [`docs/configuration.md`](docs/configuration.md). Running your own instance: [`docs/self-hosting.md`](docs/self-hosting.md).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server *(planned)* |
| `npm run build` | Production build *(planned)* |
| `npm run test` | Tests (Vitest) *(planned)* |
| `npm run check` | Typecheck + lint + tests + changelog check *(planned)*, the same command CI runs |
| `npm run setup:githooks` | Enable the git hooks: pre-commit + pre-push *(planned)* |

## Documentation

| File | Contents |
|------|----------|
| [`AGENTS.md`](AGENTS.md) | Instructions for AI agents (branches, PRs, CI, writing style) |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How to contribute (setup, checks, changelog, PRs) |
| [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) | Community code of conduct (Contributor Covenant 2.1) |
| [`SECURITY.md`](SECURITY.md) | Reporting security vulnerabilities |
| [`docs/`](docs/) | Product brief, architecture, configuration, self-hosting, ADIF, i18n |

Release history: [`change-log.md`](change-log.md).

## Language

The application supports internationalization; the interface is translated. Everything else, code, comments, commits, issues, PRs, and documentation, is in **English**.

## License

[GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0).

## Contributing

Issues and pull requests are welcome. Start with [`CONTRIBUTING.md`](CONTRIBUTING.md). AI agents: [`AGENTS.md`](AGENTS.md).

73!
