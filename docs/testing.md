# Testing

Three suites, each answering a different question.

| Suite | Command | Answers |
|-------|---------|---------|
| Unit | `npm run test` | Do the rules and the components behave? |
| Emulator | `npm run test:emulator` | Do the security rules and the cloud store behave against real Firestore? |
| End to end | `npm run test:e2e` | Does the built app work in a browser? |

`npm run check` runs the first two, which is what CI gates on for correctness and what you should run before a PR. End to end runs as its own CI job, and locally once you have a browser:

```bash
npx playwright install chromium
npm run test:e2e
```

## What belongs where

**Unit** is the default. Domain rules, hooks, components. Fast, and specific about what broke.

**Emulator** is for anything the rules enforce. One operator must never read another's log: that is a rules test, because a store cannot enforce it and should not pretend to. These files share one emulator and one dataset, so they run one at a time.

**End to end** is for what the other two structurally cannot see. jsdom has no layout, no paint, no service worker, and a forgiving DOM. So:

- Colours, contrast, and the theme, read back from what the browser actually paints
- The service worker, offline reloads, and the manifest
- What the network actually fetches, such as the Firebase SDK not arriving for a guest
- Real input behaviour. A controlled numeric field once swallowed the decimal point and jsdom was happy; that bug has a test here now

They run against a production build on the preview server, because the service worker and the split chunks only exist there.

## What the end to end tests do not cover

Signing in. It needs a Google popup and a real project, so the build under test has no Firebase configured and the app runs as a guest. Auth is covered by unit tests, and the cloud store by emulator tests.
