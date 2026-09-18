<p align="center">
  <a href="https://github.com/Seven-Panda-Labs/qso-log/actions/workflows/ci.yml"><img src="https://github.com/Seven-Panda-Labs/qso-log/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/Seven-Panda-Labs/qso-log" alt="license"></a>
</p>

# QSO Log

A simple, open source, cross platform logbook for ham radio operators. Works offline, syncs when online, runs on any device with a browser.

> **Status: early development.** The MVP works: log contacts, search and sort them, import and export ADIF, and see basic statistics. Not yet polished, and not yet tested by many operators. See the [roadmap](docs/PRODUCT_BRIEF.md#-roadmap).

## Why

Most logging software is Windows only, complex, or locked to a single vendor. QSO Log aims for the opposite: log a contact in seconds, on a phone in the field or a desktop at home, with your data in an open format you can export at any time.

- **Simple by default**: log a QSO without reading a manual
- **No account needed**: log as a guest on the device, sign in when you want sync
- **Offline first**: full function with no connectivity, sync on reconnect
- **Cross platform**: installable PWA on desktop, tablet, and phone
- **Open data**: ADIF import and export, no lock-in
- **Open source**: AGPL-3.0, community driven

Full scope, target audience, and roadmap: [`docs/PRODUCT_BRIEF.md`](docs/PRODUCT_BRIEF.md).

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · Firebase (Auth, Firestore, Hosting) · PWA (Workbox) · i18next · Vitest

Details and the reasoning behind each choice: [`docs/architecture.md`](docs/architecture.md).

## Local development

**Requirements:** Node.js 24, Java 21+ (for the Firebase emulators)

No Firebase project needed. The emulators give you a working backend locally:

```bash
git clone https://github.com/Seven-Panda-Labs/qso-log.git
cd qso-log
npm install
cp .env.emulator.example .env.local
npm run setup:githooks         # enable the git hooks, once per clone
npm run emulators              # terminal 1
npm run dev                    # terminal 2, http://localhost:5173
```

With your own Firebase project instead: `cp .env.example .env.local` and fill it in, then `cp .firebaserc.example .firebaserc`.

Details: [`docs/emulators.md`](docs/emulators.md), [`docs/configuration.md`](docs/configuration.md), [`docs/self-hosting.md`](docs/self-hosting.md).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run emulators` | Firebase Emulator Suite (Auth, Firestore), UI on :4000 |
| `npm run build` | Production build |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:emulator` | Tests that need the Firestore emulator: rules and the cloud log store (needs Java) |
| `npm run check` | Typecheck + lint + tests + emulator tests + changelog, the same command CI runs |
| `npm run setup:githooks` | Enable the git hooks: pre-commit + pre-push, once per clone |
| `npm run deploy` | Build and deploy hosting, rules, and indexes (maintainers) |

## Documentation

| File | Contents |
|------|----------|
| [`AGENTS.md`](AGENTS.md) | Instructions for AI agents (branches, PRs, CI, writing style) |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How to contribute (setup, checks, changelog, PRs) |
| [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) | Community code of conduct (Contributor Covenant 2.1) |
| [`SECURITY.md`](SECURITY.md) | Reporting security vulnerabilities |
| [`docs/`](docs/) | Product brief, architecture, configuration, emulators, self-hosting, ADIF, i18n |

Release history: [`change-log.md`](change-log.md).

## Language

The interface ships in English, Spanish, French, and Portuguese, and follows the browser language unless the operator picks one. Everything else, code, comments, commits, issues, PRs, and documentation, is in **English**. Adding a locale: [`docs/i18n.md`](docs/i18n.md).

## License

[GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0).

## Contributing

Issues and pull requests are welcome. Start with [`CONTRIBUTING.md`](CONTRIBUTING.md). AI agents: [`AGENTS.md`](AGENTS.md).

73!
