# Contributing to QSO Log

Thank you for your interest. This project is [AGPL-3.0](LICENSE) and follows the [Code of Conduct](CODE_OF_CONDUCT.md).

The project is in early development: the app is a working shell with no logging features yet.

## Before you start

- Read the [README](README.md) and the [product brief](docs/PRODUCT_BRIEF.md) to understand the scope. The brief lists explicit non-goals; features outside it are unlikely to be merged.
- Check [open issues](https://github.com/Seven-Panda-Labs/qso-log/issues), or open one with the [issue forms](.github/ISSUE_TEMPLATE/) to discuss larger changes before implementing them.

## Local setup

**Requirements:** Node.js 24, Java 21+ (for the Firebase emulators)

The emulators mean you need no Firebase project and no credentials to contribute:

```bash
git clone https://github.com/Seven-Panda-Labs/qso-log.git
cd qso-log
npm install
cp .env.emulator.example .env.local
npm run setup:githooks         # once per clone
npm run emulators              # terminal 1
npm run dev                    # terminal 2, http://localhost:5173
```

See [`docs/emulators.md`](docs/emulators.md). To work against your own Firebase project instead, copy `.env.example` and `.firebaserc.example` and fill them in.

The git hooks are worth enabling: `pre-commit` blocks a `package.json` version bump without a changelog entry, `pre-push` blocks pushes to `main`.

Environment variables: [`docs/configuration.md`](docs/configuration.md).

## Required checks

Before opening a PR, run the same command CI runs:

```bash
npm run check
```

It covers:

| Command | What |
|---------|------|
| `npm run typecheck` | TypeScript |
| `npm run lint` | Linter |
| `npm run test` | Vitest unit tests |
| `npm run test:rules` | Firestore rules against the emulator (needs Java) |
| `npm run check:changelog` | `package.json` version matches `change-log.md` |

CI also runs [Gitleaks](https://github.com/gitleaks/gitleaks) on every PR, see [`.github/workflows/secret-scan.yml`](.github/workflows/secret-scan.yml).

## Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), one file, [`change-log.md`](change-log.md), in English. It is user facing: describe what changed in the app, not implementation details.

**When you bump the version** in `package.json`:

1. Add a `## [X.Y.Z] - YYYY-MM-DD` section at the top
2. Group entries under `### Added`, `### Changed`, `### Fixed`, `### Removed`
3. Commit both files together

PRs without a version bump (docs, tests, small refactors) do not need a changelog entry; the maintainer bumps on release.

## Code style

**Keep it simple. No slop.** Code, comments, commits, PR descriptions, and docs are the minimum that does the job, and only if useful at all. Say it once, cut what adds nothing, skip the preamble.

- **Simplicity first**: minimal diff, no drive-by refactors, no speculative abstraction.
- **Match the file**: naming, imports, and patterns of the module you edit.
- **Testable logic**: pure functions for anything with rules (ADIF parsing, band plans, grid squares, callsign parsing). Do not bury domain logic in UI lifecycle.
- **English everywhere**: code, comments, commits, PRs, and docs. UI strings are the exception, they go through i18n, see [`docs/i18n.md`](docs/i18n.md).
- **Comments explain why**, not what, and only where the code is not self-evident. A comment restating the line below it is noise.
- **No em-dashes** in anything you write. Use a comma, a colon, or a full stop.
- **No secrets**: never commit `.env.local`, `.firebaserc`, or service account JSON.
- **Nothing instance-specific**: no Firebase project ids, app ids, hosting URLs, or console links in code, docs, commits, or PRs. They belong in local config. Use placeholders such as `<project-id>` in documentation.
- **No real personal data**: log fixtures use fictional callsigns from the reserved blocks, for example `2E0XXX`, or documentation calls such as `W1AW` where a real one is unavoidable. No real operator names, addresses, or emails.

## Pull requests

1. **Branch** from `main` with a descriptive name: `feat/adif-import`, `fix/utc-rollover`.
2. **Title** in English, imperative, around 50 characters: `Add ADIF export for filtered logs`.
3. **Description**: GitHub pre-fills [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md). Keep the Summary and Test plan sections.
4. **Scope**: one topic per PR. Avoid mixing feature, refactor, and formatting.
5. **Screenshots** for UI changes.
6. **Issues**: reference `Fixes #NNN` or `Refs #NNN`.

All code enters through a PR. Direct pushes to `main` are not accepted.

## Translations

New locales and corrections are welcome and do not require any radio knowledge, only care with ham radio terminology, which is often left untranslated by convention (QSO, RST, QTH). See [`docs/i18n.md`](docs/i18n.md).

## License

By contributing, you agree to license your work under [AGPL-3.0](LICENSE).
