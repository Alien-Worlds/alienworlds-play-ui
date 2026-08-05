# End-to-end tests

Scaffold only — no specs yet.

Run with `yarn e2e` (starts the app via `start:local` and runs Playwright against it).

## Recommended first target

`onboarding` (login / wallet-connect: `LoginModal`, `SignUpModal`, `WalletButtons`) is the
best candidate for the first real e2e test. It gates access to every other feature, so
covering it first gives the most leverage before expanding to gameplay flows like
`mining` or `missions`.
