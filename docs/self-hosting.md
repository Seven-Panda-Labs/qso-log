# Self-hosting

QSO Log is AGPL-3.0: you may run your own instance, and if you modify it and offer it to others over a network, you must offer them the modified source.

**Requirements:** Node.js 24, a Google account, the Firebase CLI (`npx firebase`, already a dev dependency)

## 1. Create a Firebase project

In the [Firebase console](https://console.firebase.google.com/), create a project. The free Spark plan is enough for a personal logbook.

```bash
npx firebase login
npx firebase projects:list        # confirm your project id
```

## 2. Create the Firestore database

```bash
npx firebase firestore:databases:create "(default)" --location <region> --project <project-id>
```

`npx firebase firestore:locations` lists the regions. **The location is permanent**, so pick one near you or near your users. A single region (`europe-west1`, `us-central1`) is cheaper; a multi-region (`eur3`, `nam5`) has a higher availability guarantee.

## 3. Register a web app

```bash
npx firebase apps:create WEB "QSO Log" --project <project-id>
npx firebase apps:sdkconfig WEB <app-id> --project <project-id>
```

Copy the values into `.env.local`:

```bash
cp .env.example .env.local        # then fill in from the sdkconfig output
```

The keys are listed in [configuration.md](configuration.md). Firebase web config is public by design; access control is the job of [`firestore.rules`](../firestore.rules).

## 4. Point the deploy at your project

```bash
cp .firebaserc.example .firebaserc   # then set your project id
```

`.firebaserc` and `.env.local` are both gitignored. They are yours, not the repo's.

## 5. Enable sign-in

In the console, under **Authentication > Sign-in method**, enable the providers you want. Add your hosting domain and `localhost` under **Authentication > Settings > Authorized domains**.

## 6. Deploy

```bash
npm run deploy
```

That builds and deploys hosting, the Firestore rules, and the indexes. To deploy one part:

```bash
npx firebase deploy --only hosting
npx firebase deploy --only firestore:rules
```

Your instance is at `https://<project-id>.web.app`.

## Caching

[`firebase.json`](../firebase.json) sets `no-cache` on everything and then `immutable` on `/assets/**`, which Vite content-hashes. The order matters: **the last matching rule wins**, so the specific rule goes after the catch-all. An `index.html` or `sw.js` served from cache pins visitors to an old build, which is why the default is `no-cache` rather than a max-age.

## If other people use your instance

You are handling their data: callsigns, contacts, locations. Publish what you store and how to request deletion. Under GDPR, running an instance for others makes you the controller of that data.
