# Configuration

Local configuration lives in `.env.local`, which is never committed. Two templates:

| Template | For |
|----------|-----|
| [`.env.emulator.example`](../.env.emulator.example) | Local development against the emulators, no cloud project, recommended |
| [`.env.example`](../.env.example) | Your own Firebase project |

```bash
cp .env.emulator.example .env.local   # or .env.example
```

## Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_FIREBASE_API_KEY` | yes | Firebase Web App config |
| `VITE_FIREBASE_AUTH_DOMAIN` | yes | Firebase Web App config |
| `VITE_FIREBASE_PROJECT_ID` | yes | Firebase Web App config |
| `VITE_FIREBASE_STORAGE_BUCKET` | yes | Firebase Web App config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | yes | Firebase Web App config |
| `VITE_FIREBASE_APP_ID` | yes | Firebase Web App config |
| `VITE_USE_FIREBASE_EMULATORS` | no | `true` points the app at the local emulators |

Find the values in the Firebase console under **Project settings > General > Your apps > SDK setup and configuration**.

Anything prefixed `VITE_` is embedded in the client bundle and is therefore **public**. Never put a secret behind that prefix. Firebase web config is not secret by design; access control is the job of the security rules in [`firestore.rules`](../firestore.rules).

## Firebase project

The free Spark plan is enough for development and for one operator's instance. Add `localhost` to the authorized domains in Firebase Authentication before signing in locally.

Deploy target and project id come from `.firebaserc`, which is not committed:

```bash
cp .firebaserc.example .firebaserc   # then edit with your project id
```

## Emulators

See [emulators.md](emulators.md). That is the recommended path for contributors: nothing to configure beyond copying the template.
