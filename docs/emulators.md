# Local development with emulators

The Firebase Emulator Suite runs Auth and Firestore on your machine. No cloud project, no credentials, no billing, and nothing you do locally touches real data.

**Requirements:** Node.js 24, Java 21+ (the Firestore emulator is a Java process)

```bash
npm install
cp .env.emulator.example .env.local
npm run emulators    # terminal 1
npm run dev          # terminal 2
```

| Service | Port |
|---------|------|
| App (Vite) | 5173 |
| Emulator UI | 4000 |
| Firestore | 8080 |
| Auth | 9099 |

The app connects to the emulators when `VITE_USE_FIREBASE_EMULATORS=true`, which `.env.emulator.example` sets. The project id is `demo-qso-log`: the `demo-` prefix tells the Firebase tooling this project does not exist in the cloud, so a misconfigured client fails loudly instead of writing somewhere real.

## What you get

- **Emulator UI** at [localhost:4000](http://localhost:4000): browse Firestore documents, create test users, read the rules evaluation log
- **Test users** without Google sign-in: the Auth emulator accepts any email and password
- **A clean slate**: emulator data lives in memory and is gone when you stop it

## Rules tests

The security rules are tested against the same emulator:

```bash
npm run test:rules
```

This starts Firestore, runs [`firestore.rules.test.ts`](../firestore.rules.test.ts), and shuts down. It is part of `npm run check`, which is why `check` needs Java.

## Limitations

- Google sign-in is emulated, not real. Testing the actual OAuth flow needs a Firebase project.
- Emulator data does not persist between runs unless you export it (`firebase emulators:export`).
