# Configuration

> **Draft.** Variables land as the scaffold does.

Local configuration lives in `.env.local`, which is never committed. `.env.example` holds the same keys with placeholder values and is the reference.

```bash
cp .env.example .env.local
```

## Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_FIREBASE_API_KEY` | yes | Firebase Web App configuration |
| `VITE_FIREBASE_AUTH_DOMAIN` | yes | Firebase Web App configuration |
| `VITE_FIREBASE_PROJECT_ID` | yes | Firebase Web App configuration |
| `VITE_FIREBASE_APP_ID` | yes | Firebase Web App configuration |

The table is provisional and grows with the app. Anything prefixed `VITE_` is embedded in the client bundle and is therefore **public**: never put a secret behind that prefix.

## Firebase project

The free Spark plan is enough for development and for a single operator's instance. Add `localhost` to the authorized domains in Firebase Authentication before signing in locally.

## Emulators

*Open.* The intent is that contributors can run the app with the Firebase Emulator Suite and no cloud project at all. Documented here once it works.
