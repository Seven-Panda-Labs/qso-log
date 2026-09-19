# ADIF

[ADIF](https://adif.org/) (Amateur Data Interchange Format) is how logs move between programs. It is the project's interchange contract: the exit door is always open.

## Rules

1. **Lossless round trip.** A log exported and reimported must be identical. Fields the app does not understand are preserved, not dropped.
2. **Import never silently alters data.** Malformed or ambiguous records are reported to the operator, not guessed at and written.
3. **Export what was logged.** No derived or invented fields in an export unless ADIF defines them.
4. **Time in UTC**, matching `QSO_DATE` and `TIME_ON` semantics.

## Core fields

The MVP covers the fields an operator fills in for an ordinary contact:

| ADIF field | Meaning |
|------------|---------|
| `CALL` | Callsign of the station worked |
| `QSO_DATE` | Date in UTC, `YYYYMMDD` |
| `TIME_ON` | Time in UTC, `HHMM` or `HHMMSS` |
| `BAND` | Band, for example `20m` |
| `FREQ` | Frequency in MHz |
| `MODE` | Mode, for example `SSB`, `CW`, `FT8` |
| `RST_SENT` | Signal report sent |
| `RST_RCVD` | Signal report received |
| `GRIDSQUARE` | Maidenhead locator of the station worked |
| `COMMENT` | Free text note |

## Compatibility targets

Imports are tested against exports from widely used logging software: header variations, non-ASCII comments, missing optional fields, `.adi` versus `.adx`.

## Implementation

[`src/domain/adif.ts`](../src/domain/adif.ts), no dependency. The format is small enough that a parser is shorter than the code to adapt a library, and unknown field preservation is the one behaviour that had to be exact.

The one rule that catches naive parsers: **a field's declared length is the contract**, so a value may contain anything, including `<`. A parser that scans for the next `<` instead of counting characters corrupts exactly the records that needed care, such as a comment quoting a frequency split.

Imported contacts get new ids. An ADIF file is another program's record of the same contacts, and reusing its ids would overwrite the operator's own entries.

## Open questions

- Whether to support ADX (XML), or only `.adi`
