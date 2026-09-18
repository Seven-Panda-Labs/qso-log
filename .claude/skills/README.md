# Claude Code skills

Skills are task specific know-how that an agent loads **when it needs it**, so the always-on context stays small.

Split of responsibilities:

| File | Holds | Loaded |
|------|-------|--------|
| [`../../AGENTS.md`](../../AGENTS.md) | Rules: git workflow, what agents must not do, writing style | Always |
| `.claude/skills/<name>/SKILL.md` | Know-how for one kind of task | On demand, when the description matches |
| [`../../docs/`](../../docs/) | Documentation for humans and agents alike | On demand, by link |

Rules live in `AGENTS.md`, never in a skill. Reference material humans also read lives in `docs/`, and the skill links to it rather than copying it.

## Writing a skill

```
.claude/skills/<kebab-case-name>/SKILL.md
```

```markdown
---
name: skill-name
description: What it covers and when to use it. This line is how the agent decides to load it, so name the triggers explicitly.
---

# Skill name

Body: the know-how, concise, with links into docs/ for detail.
```

Guidelines:

- **The description is the trigger.** Write it as "use when …" with the words that would appear in a request.
- **Keep it short.** A skill is a briefing, not a manual. No filler, link to `docs/` for depth.
- **One task per skill.** If the body covers two unrelated jobs, split it.
- **No rules.** Anything an agent must always obey belongs in `AGENTS.md`.
- **Same writing style as the rest of the repo**: English, concise, no em-dashes.

## Current skills

| Skill | Use when |
|-------|----------|
| [`ham-radio-domain`](ham-radio-domain/SKILL.md) | Working with QSO data, bands, modes, callsigns, grid squares, or ADIF |

## Candidates, once the code exists

- `adif-round-trip`: adding or changing ADIF field handling, with the fixture and test checklist
- `add-a-locale`: the concrete steps for a new translation
- `firestore-rules`: writing and testing security rules for log data
