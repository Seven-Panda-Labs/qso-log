# Documentation

All documentation in this project is written in English, including the parts that describe translated features.

| File | Contents | Status |
|------|----------|--------|
| [PRODUCT_BRIEF.md](PRODUCT_BRIEF.md) | Vision, audience, MVP scope, non-goals, roadmap | Written |
| [architecture.md](architecture.md) | How the app is put together: data model, sync, offline, modules | Partial |
| [configuration.md](configuration.md) | Environment variables and infrastructure setup | Written |
| [emulators.md](emulators.md) | Local development with the Firebase emulators | Written |
| [self-hosting.md](self-hosting.md) | Running your own instance, step by step | Written |
| [adif.md](adif.md) | ADIF import and export: supported fields and rules | Draft |
| [i18n.md](i18n.md) | Locales, translation workflow, ham radio terminology | Written |

Documents marked *Draft* record decisions as they are made. A draft that still contains open questions says so at the top.

## Conventions

- **Keep it short.** Minimum necessary, no filler, no section that exists only to have a section.
- **One topic per file.** If a section grows its own audience, split it out and link from here.
- **Decisions, not tutorials.** Record why a choice was made; the reader can read the code for what it does.
- **Keep the table above current.** A doc that is not listed here will not be found.
- **No em-dashes**, concise prose, English. See [AGENTS.md](../AGENTS.md) for the full writing rules.
