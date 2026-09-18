# Architecture

> **Partial.** The scaffold is committed; features are not. Settled decisions are recorded here, open ones are marked *Open*.

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

## Layout

| Path | Holds |
|------|-------|
| `src/pages/` | One component per route |
| `src/components/` | Shared UI |
| `src/hooks/` | Reusable React state, for example `useOnlineStatus` |
| `src/auth/` | Sign-in state, guest and signed-in |
| `src/storage/` | The log store: local, cloud, and the migration between them |
| `src/config/` | Firebase wiring, environment |
| `src/i18n/` | i18next setup and locale files |
| `src/styles/` | Tailwind entry and theme tokens |
| `scripts/` | Repo tooling run with tsx |

`src/domain/` holds pure functions only: no React, no Firebase, no I/O.

| Module | Covers |
|--------|--------|
| `band.ts` | The ADIF band table, frequency to band |
| `mode.ts` | Modes, ADIF primary mode for a submode, which report style a mode uses |
| `callsign.ts` | Callsign structure: base call, prefix, suffix, portable |
| `grid.ts` | Maidenhead locators, distance and bearing |
| `time.ts` | ADIF dates and times, all UTC |
| `qso.ts` | The contact record, validation, duplicate detection |

Three rules run through it:

- **Nothing is rejected.** `validateQso` and `parseCallsign` report what looks wrong and leave the decision to the operator. An unusual callsign on an unusual frequency is still a real contact.
- **Nothing derived overwrites what was logged.** The band follows from the frequency, never the reverse: a band midpoint is not where the QSO happened.
- **One global band table, not per ITU region.** Regional allocations differ, but ADIF names a band by its widest range, and the log has to round trip through ADIF unchanged.

## Stack decisions

| Choice | Why |
|--------|-----|
| **Vite + React 19 + TypeScript** | Fast builds, the PWA plugin ecosystem, types on domain rules that are easy to get subtly wrong |
| **Tailwind v4, no component library** | The log table and entry form are dense and custom; a component library's theme would be fought more than used. Also keeps the bundle small, which matters on a phone in the field |
| **Firebase Auth + Firestore** | Offline persistence and sync out of the box, free tier covers a personal logbook, no server to operate |
| **i18next** | Standard, framework agnostic, plural and interpolation support the UI needs |
| **Vitest + Testing Library** | Shares the Vite config, so no second build pipeline |
| **oxlint** | Fast enough to run on every commit without thinking about it |

Firebase services are created by `createFirebase()` in `src/config/firebase.ts` and exposed lazily through `firebase()`. Importing the module connects to nothing, which keeps tests and non-Firebase code paths free of it.

## Layers

| Layer | Responsibility | Depends on |
|-------|----------------|------------|
| UI components | Rendering and interaction | Domain, state |
| State | Loading, mutation, sync status | Domain, data access |
| Domain | Rules with no side effects: ADIF, bands, grids, time | Nothing |
| Data access | Firestore reads and writes, local persistence | Firebase SDK |

Dependencies point downward only. The domain layer never imports Firebase or React.

## Data model

The QSO record is `Qso` in `src/domain/qso.ts`, with ADIF field names where they exist, so import and export stay close to a direct mapping. Unknown ADIF fields live in `extra`, because dropping them would make a round trip lossy.

*Open:* the Firestore collection layout under each user, and the indexes the logbook table filters will need.

## Sync and offline

*Open.* Baseline: Firestore offline persistence, with the UI reflecting pending writes. To be settled: conflict handling on multi-device edits, and the size at which a full log stops fitting the local cache comfortably.

## Time handling

QSO date and time are stored in **UTC**. Local time is a presentation concern, converted at the edge. Operators log across midnight UTC routinely, so the rollover is a first class test case.

## Testing

| Kind | Command | Scope |
|------|---------|-------|
| Unit | `npm run test` | Domain functions, stores, hooks, components |
| Emulator | `npm run test:emulator` | Security rules, and the cloud store against them |

One operator must never read another's log. That is a rules test, not a store test: the store cannot enforce it and should not pretend to.

## Accounts and storage

Two states, decided:

| State | Where the log lives |
|-------|---------------------|
| **Guest** | Locally on the device only. No account, no cloud, nothing leaves the browser |
| **Signed in** | Firestore under `users/{uid}`, synced across the operator's devices |

Guest is a first class state, not a degraded one: an operator can log a full activation without ever creating an account. Signing in is how you get sync, not how you get to log.

Sign-in is Google, by popup. `AuthProvider` reports `unavailable` rather than failing when no Firebase project is configured, so the app still runs for a contributor who has not copied an env template, and for a self-hoster who wants a local-only build.

Both sides implement one `LogStore` interface, so nothing above it knows which log it is reading. Local is IndexedDB; cloud is a Firestore collection per operator, with the offline cache doing the syncing.

`migrateLog` moves a guest's log into their account on first sign-in. It keeps contact ids, so it is idempotent; it writes and reads back every contact before clearing the local log, so a failed upload leaves the operator with everything; and it never overwrites a contact the account already has. The operator is asked first, since a migration that helps itself to the log on a borrowed device is exactly the failure to avoid.

## Open questions

- Whether any server side code is needed for the MVP, or client plus rules is enough
