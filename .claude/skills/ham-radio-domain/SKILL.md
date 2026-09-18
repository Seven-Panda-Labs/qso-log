---
name: ham-radio-domain
description: Ham radio domain reference for QSO Log. Use when working with QSO records, callsigns, bands, frequencies, modes, signal reports, Maidenhead grid squares, UTC log times, or ADIF fields, and when naming things or writing UI copy in those areas.
---

# Ham radio domain

Vocabulary and rules needed to write correct code and credible copy. Operators notice when software gets this wrong.

## The QSO

A **QSO** is one two-way contact between two stations. A logbook is a list of QSOs. A minimal record answers: who, when, on what frequency, in what mode, how well each side heard the other.

| Concept | Field | Notes |
|---------|-------|-------|
| Who | callsign | The station worked, for example `W1AW` |
| When | date and time | **UTC always**, ADIF `QSO_DATE` and `TIME_ON` |
| Where in the spectrum | band and frequency | `20m` and `14.074` MHz describe the same contact |
| How | mode | `SSB`, `CW`, `FT8`, `RTTY` |
| How well | RST sent and received | Two separate values, they differ |
| Where on earth | Maidenhead locator | `IN51` or `IN51oj`, optional |

## Rules that bite

**UTC, not local.** Logs are kept in UTC by universal convention, and contest and award rules depend on it. Storage and comparison are UTC; local time is display only. The midnight UTC rollover is a real scenario, not an edge case: an evening contact in Europe is already the next day in the log.

**Band and frequency are related, not interchangeable.** The band is derivable from the frequency via the band plan, and the band plan differs by ITU region. Store what the operator entered, derive the other, and never overwrite a logged frequency with a band midpoint.

**RST is two values.** `RST_SENT` is what you gave, `RST_RCVD` is what you got. They are not symmetric, and a form that collects one is wrong. Format is readability, strength, tone: `59` on voice, `599` on CW. `59` and `599` are the everyday values; do not validate them as numbers with ranges without checking the actual RST rules first.

**Callsigns are structured but messy.** A callsign has a prefix that indicates the issuing country, but portable and special operation adds slashes: `W1AW/4` (operating in a different US district), `F/W1AW` (a US operator in France). Parsing is a genuine domain problem, keep it in a pure, tested function, and never reject an unusual callsign the operator insists on.

**Grid squares are case conventional.** Maidenhead locators are written with the field in uppercase, the square in digits, and the subsquare in lowercase: `IN51oj`. Compare case insensitively, display in the conventional casing.

**Duplicates are normal.** Working the same station again on another band, mode, or day is a valid, separate QSO. Duplicate detection means same station, same band, same mode, within a short window, and even then it is a warning, never an automatic refusal.

## Vocabulary

| Term | Meaning |
|------|---------|
| QSO | A contact |
| QSL | Confirmation of a contact |
| QTH | Location |
| DX | A distant station or long distance contact |
| SOTA | Summits on the Air, operating from a summit |
| POTA | Parks on the Air, operating from a park |
| Rig | The radio |
| 73 | Best regards, how operators sign off |

These terms stay untranslated in every locale, see [`docs/i18n.md`](../../../docs/i18n.md).

## Who is using the app

Often outdoors, on a phone, one handed, in a hurry between contacts. Fewer fields, larger targets, no dialog that blocks logging the next QSO. The portable operator is the hardest case and the one the design targets.

## Test data

Never use a real operator's log or personal data. Use `W1AW` (the ARRL headquarters station, the standard documentation call) or the reserved example blocks such as `2E0XXX`.

## Further reading

- [`docs/adif.md`](../../../docs/adif.md): the interchange format and its rules
- [`docs/architecture.md`](../../../docs/architecture.md): where domain logic lives
- [`docs/PRODUCT_BRIEF.md`](../../../docs/PRODUCT_BRIEF.md): scope and non-goals
