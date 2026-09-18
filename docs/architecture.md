# Architecture

> **Draft.** The application scaffold is not committed yet. This file records decisions as they are made; open questions are marked *Open*.

## Overview

QSO Log is a client heavy progressive web app. The browser holds a full copy of the operator's log and works without connectivity; the backend provides identity, storage, and synchronization.

```
Browser (PWA)
  UI (React)
  domain logic (pure functions: ADIF, bands, grids, callsigns)
  local persistence  <-- source of truth while offline
        |
        | sync
        v
Firebase (Auth, Firestore, Hosting)
```

## Principles

1. **Offline is the normal case.** Every core action (add, edit, delete, search a QSO) completes with no network. Sync is a background concern.
2. **Domain logic is pure.** ADIF parsing, band and mode validation, grid square math, and callsign parsing are pure functions with unit tests, independent of React and of Firebase.
3. **The log is the user's data.** Full ADIF export is always available. Nothing in the format is lossy on round trip.
4. **Small surface.** Features outside the product brief's MVP scope stay out until the core is solid.

## Layers

| Layer | Responsibility | Depends on |
|-------|----------------|------------|
| UI components | Rendering and interaction | Domain, state |
| State | Loading, mutation, sync status | Domain, data access |
| Domain | Rules with no side effects: ADIF, bands, grids, time | Nothing |
| Data access | Firestore reads and writes, local persistence | Firebase SDK |

Dependencies point downward only. The domain layer never imports Firebase or React.

## Data model

*Open.* The QSO record follows ADIF field names where they exist, so import and export are close to a direct mapping. To be settled: collection layout per user, indexes needed for the table view filters, and how unknown ADIF fields are preserved.

## Sync and offline

*Open.* Baseline: Firestore offline persistence, with the UI reflecting pending writes. To be settled: conflict handling on multi-device edits, and the size at which a full log stops fitting the local cache comfortably.

## Time handling

QSO date and time are stored in **UTC**. Local time is a presentation concern, converted at the edge. Operators log across midnight UTC routinely, so the rollover is a first class test case.

## Testing

| Kind | Scope |
|------|-------|
| Unit | Domain functions, especially ADIF round trips and time conversion |
| Component | Log entry form, logbook table filters |
| Rules | Firestore security rules, one operator must never read another's log |

## Open questions

- UI component library: Mantine or an alternative (see the product brief)
- Authentication: which providers at launch, and whether a guest mode ships in the MVP
- Whether any server side code is needed for the MVP, or client plus rules is enough
