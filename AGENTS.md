# Agent instructions: QSO Log

**Public repository:** [github.com/Seven-Panda-Labs/qso-log](https://github.com/Seven-Panda-Labs/qso-log)

This file defines how AI agents (Claude Code, Cursor, Copilot, CI bots) work in this repo. Humans: see [CONTRIBUTING.md](CONTRIBUTING.md) as well.

It is the **single source of truth**. Tool-specific files only point here, they never restate rules:

| Tool | File |
|------|------|
| Claude Code | `CLAUDE.md` (symlink to this file) |
| Cursor | [`.cursor/rules/public-repo-workflow.mdc`](.cursor/rules/public-repo-workflow.mdc) (pointer) |
| Claude Code skills | [`.claude/skills/`](.claude/skills/README.md) (task specific know-how, not rules) |

## Golden rule

**Nothing lands on `main` without a reviewed PR and green CI.** Never push directly to `main`, unless the user explicitly asks for an emergency hotfix and confirms the normal flow may be bypassed.

This is enforced, not just documented. See [Enforcement](#enforcement).

## Second golden rule: keep it simple

**No slop.** Everything you write, code, comments, commits, PR descriptions, and docs, is the minimum that does the job, and only if it is useful at all.

- Say it once. Do not restate the previous sentence in different words.
- No preamble, no summary of what you are about to say, no closing recap.
- No comment that restates the code. No doc section with nothing in it.
- A PR description is bullets, not an essay. A commit subject is one line.
- If a sentence can be cut without losing information, cut it.

This applies to the diff too: the smallest change that solves the problem, no speculative abstraction, no drive-by refactor.

## Third golden rule: nothing instance-specific

**The repo describes the project, never one deployment of it.** Anything that identifies a particular instance stays in local, gitignored config, and that includes what you write in commits and PR descriptions.

| Instance-specific, keep out | Where it belongs |
|-----------------------------|------------------|
| Firebase project id, app id, API key, sender id, measurement id | `.env.local`, `.firebaserc` |
| Hosting URLs, custom domains, console links | local config, or nowhere |
| Anyone's account names, emails, or personal data | nowhere |

In docs and examples, use placeholders: `<project-id>`, `https://<project-id>.web.app`, `your-project.firebaseapp.com`. A self-hoster's instance is as valid as the maintainers', and the repo should not imply otherwise.

Not instance-specific, and fine to write: the repository URL, the project's contact addresses, and `demo-qso-log`, the emulator project id that exists only on a contributor's machine.

If a deployment detail is needed to do the work, keep it in the local config and out of the diff. Never fix this by deleting history after the fact; keep it out in the first place.

## Mandatory git workflow

1. Update local `main`:
   ```bash
   git fetch origin
   git checkout main
   git pull origin main
   ```
2. Create a **feature branch**:
   ```bash
   git checkout -b feat/short-description
   # or: fix/…, docs/…, chore/…, test/…
   ```
3. Implement with a **minimal diff**, no unsolicited refactors.
4. Run the same checks as CI:
   ```bash
   npm run check
   ```
5. **Commit** only when the user explicitly asks.
6. Push the **branch**, never `main`:
   ```bash
   git push -u origin HEAD
   ```
7. Open a PR when the user asks, or after verified completion:
   ```bash
   gh pr create --base main --title "…" --body "…"
   ```
   Use [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md).

## Before opening a PR

| Check | Command or note |
|-------|-----------------|
| Typecheck, lint, tests, rules, changelog | `npm run check` (needs Java for the emulator) |
| Browser behaviour, when the change is visual, offline, or PWA | `npm run test:e2e`, see [docs/testing.md](docs/testing.md) |
| No secrets | CI runs Gitleaks; never commit `.env.local`, `.firebaserc`, keys, service accounts |
| No real personal data in fixtures | Fictional or documentation callsigns only, see [Test data](#test-data) |
| Changelog (on version bump) | `change-log.md` + `package.json` |
| Scope | One topic per PR |

## What agents must **not** do

- `git push origin main` (unless an explicit hotfix instruction)
- `git push --force` to `main` or `master`
- Commit or push without the user asking
- Deploy without an explicit request
- Change the user's `git config`
- `--no-verify` or skipping hooks without a request
- Put secrets, real personal data, or credentials in code, commits, or PRs
- Large PRs mixing feature, refactor, and formatting
- Padding: filler prose, obvious comments, essay length PR bodies
- Instance-specific details in code, docs, commits, or PRs, see [the third golden rule](#third-golden-rule-nothing-instance-specific)
- Em-dashes anywhere, or non-English text outside i18n locale files

## Writing: UI text, docs, and code comments

Applies to everything an agent writes: UI strings, locales, comments, commit messages, PR bodies, docs.

| Rule | Why |
|------|-----|
| **English everywhere** except i18n locale values | Public repo, mixed language contributors; English is the project's working language |
| **No em-dashes** (`—`). Use a comma, a colon, brackets, or a full stop | House style |
| **Minimum necessary.** Cut every sentence that adds nothing. When in doubt, leave it out | Long copy stops being read, in a doc comment as much as in the UI |
| **Comments only where the code is not self-evident.** Explain *why*, not *what* | A comment restating the line below it is noise that rots |
| **Ham radio terms stay conventional** | Operators expect QSO, RST, QTH, band, mode; do not invent friendlier synonyms |

UI strings are user facing and live in the i18n locales. The rules above apply to every translation, not just English. See [`docs/i18n.md`](docs/i18n.md).

## Domain rules

The logbook is the user's record of real contacts. Correctness beats convenience.

- **Never silently alter logged data.** Imports, migrations, and edits must be lossless and reversible, or must ask.
- **UTC is the storage format** for QSO date and time. Local time is a display concern only.
- **ADIF is the interchange contract.** Follow the spec, preserve unknown fields on round trip rather than dropping them.
- **Offline is the normal case**, not the error case. Anything that fails without connectivity needs an offline path.

Domain reference for agents: [`.claude/skills/ham-radio-domain/SKILL.md`](.claude/skills/ham-radio-domain/SKILL.md).

## Test data

Use fictional callsigns. Safe choices: sequences reserved for examples such as `2E0XXX`, or well known documentation calls such as `W1AW`. Never use a real operator's name, address, email, or log.

## Enforcement

Local git hooks, enabled once per clone with `npm run setup:githooks` (or `git config core.hooksPath .githooks`):

| Hook | Blocks |
|------|--------|
| `.githooks/pre-push` | Any push to `main` or `master`, including force push and delete |
| `.githooks/pre-commit` | A `package.json` version bump without a staged changelog |

The pre-push hook covers every agent and human that shells out to `git`. Emergency hotfix, only on explicit user instruction: `ALLOW_MAIN_PUSH=1 git push origin main`.

## Deploy and production

- Deploy with `npm run deploy`, only when the user asks, and normally from `main` after a merge
- The target comes from the local `.firebaserc` and `.env.local`, which are not in the repo. Do not name a project id or a hosting URL in the diff, the commit, or the PR

## Commits

- **English**, imperative subject: `Add ADIF export for filtered logs`
- Prefer one focused PR over many WIP commits

## Reference docs

| Topic | File |
|-------|------|
| Product scope and roadmap | [docs/PRODUCT_BRIEF.md](docs/PRODUCT_BRIEF.md) |
| Human contributing | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Security and secrets | [SECURITY.md](SECURITY.md) |
| Architecture | [docs/architecture.md](docs/architecture.md) |
| Configuration and env vars | [docs/configuration.md](docs/configuration.md) |
| Local emulators | [docs/emulators.md](docs/emulators.md) |
| Self-hosting | [docs/self-hosting.md](docs/self-hosting.md) |
| ADIF handling | [docs/adif.md](docs/adif.md) |
| Internationalization | [docs/i18n.md](docs/i18n.md) |
| Testing | [docs/testing.md](docs/testing.md) |

## GitHub CI

Every PR and push to `main` runs:

- **CI**: `npm run check`
- **Secret scan**: Gitleaks over the full history

The branch must be green before merge.

## Project state

The MVP is in place: logging, search, sort, ADIF import and export, statistics, guest and signed-in storage. Polish, bundle size, and real operator feedback are what remain. Layout of the code and the decisions behind it: [docs/architecture.md](docs/architecture.md).
