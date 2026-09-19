# Changelog

All notable changes to this project are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-09-18

### Added

- Project foundations: README, contributing guide, code of conduct, security policy, agent instructions, issue and PR templates, CI and secret scanning.
- Application scaffold: React, TypeScript, Vite, Tailwind, router, i18n, PWA, Vitest, and the Firebase Emulator Suite for local development.
- Interface in English, Spanish, French, and Portuguese, following the browser language, with a language picker.
- Domain rules for bands, modes, callsigns, grid squares, and UTC log times.
- Google sign-in, with guest mode for logging without an account.
- Log storage: on the device for guests, synced to the account once signed in.
- Logging contacts: add, edit, and delete, with the band filled in from the frequency and the signal report matched to the mode.
- Logbook with search, band and mode filters, and sortable columns.
- ADIF import and export.
- Statistics: contacts, stations, days on air, and a breakdown by band and mode.
- Light and dark themes, following the system by default.

### Changed

- Faster first load: the app no longer downloads the backend until you sign in.
