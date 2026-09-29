# Overmind → Zustand migration: arena / competitions / inventory / lore

Phase 1 (modal state, commit `ef8613f` on `feature/modal-store-zustand-migration`) ported the
self-contained `modal` Overmind namespace to `useModalStore`. This doc scopes phase 2: moving the
remaining action/store state consumed by `arena`, `competitions`, `inventory`, and `lore`.

Read this before starting work on any of the four feature branches below — it's the shared context
a fresh session won't otherwise have.

## Why this phase is not "repeat phase 1 four times"

Modal was cheap to migrate because it was fully self-contained: one small namespace, no other
namespace touched it, no side effects. None of these four features own a namespace like that.
Only `arena` has a dedicated Overmind namespace at all, and it's nearly empty. The rest of what
these features read lives inside three large, heavily shared namespaces:

| Namespace | Size | Consumer files app-wide (outside `src/store/`) |
|---|---|---|
| `src/store/wax` | 5,267 lines (2,571 in `effects.ts` — real blockchain tx logic) | 137 |
| `src/store/main` | 2,325 lines | 68 |
| `src/store/atomic` | 1,331 lines | 41 |

Those namespaces are also depended on by `mining`, `syndicates`, `profile`, `onboarding`,
`missions`, `leaderboard`, and shared components — not just the four features in scope here. So
the real question per feature isn't "how big is the store" but "is the slice this feature needs
logically isolated, or shared with another feature."

## Per-feature findings

### arena — trivial
- Owns `src/store/arena/` (`state.ts` is `Record<string, never>`, `actions.ts` is one action:
  `showArenaPortalPage`, which forwards to `main.toggleMainDrawer` + `wax.collectEvent`).
- Single call site: [src/features/arena/pages/Arena.tsx](../../src/features/arena/pages/Arena.tsx#L127).
- Effort: ~0.5 day. Just needs the two cross-namespace calls it forwards to be reachable
  (either still-Overmind at the time, or already-migrated equivalents).

### competitions — done (`feature/competitions-store-zustand-migration`)
- Original finding here was wrong: `isDemoUser`/`walletId` were already read from
  `shared/store/sessionStore` (landed in Release 5.3.2, #85). The real Overmind dependency was the
  reward-claim transaction, `wax.tryClaimTournamentReward` (+ `wax.api.claimTournamentReward`
  effect), used only by competitions.
- Ported to `src/features/competitions/store/competitionsStore.ts` (`claimTournamentReward`,
  `isClaimingReward`); the Overmind action and effect are deleted. Competitions now has no imports
  from `store/` or `overmind`.
- Needed two small shared pieces, reusable by later features (see "Shared session & transactions"):
  `sessionStore.currentSession` and `shared/wax/transact`. Toasts moved to `shared/util/toast`.

### lore — moderate, cleanly separable
- No dedicated namespace, but everything lore-specific is *logically* isolated even though it's
  physically colocated in `wax`/`main`. Verified these are used **only** inside
  `src/features/lore/*`, nowhere else in the app:
  - `wax`: `tryLoreVoting`, `trySubmitLore`, `tryStakeVotePowerLore`, `tryClaimLoreReward`,
    `loreFilter` / `setLoreFilter`
  - `main`: `getLorePullRequests`, `getLorePullRequestCommit`
- Also reads a few genuinely global fields it doesn't own: `wax.isDemoUser`, `main.currentWallet`.
  Both already live in `shared/store/sessionStore`.
- Real effort here is porting async blockchain-transaction action logic (staking, voting,
  claiming, submitting) out of `wax/actions.ts` + `wax/effects.ts`, not just moving plain state.
  Follow the competitions pattern: build the actions in a lore Zustand store and sign them with
  `shared/wax/transact`, instead of `effects.wax.api` + `state.wax.lastTransactionError`.
  Needs test coverage matching what's in `wax/effects.ts` today.
- Effort: ~3-5 days.

### inventory — large, not self-contained
- No dedicated namespace. Depends on real slices of `atomic`, `wax`, and `main`:
  - `atomic`: `ownedLandsAssets`, `landAsset`, `ownedLandsAssetsDayBoosts`,
    `filteredAndSortedAssets`, `bagAssets`, `assetsFilter` / `setAssetsFilter`
  - `wax`: `isOnboarded`, `onboarding`, `walletId`, `isDemoUser`, `planetSelectedForMining`
  - `main`: `showInventoryPage`, `setOutPostModalsActive`
- Verified: of the `atomic` fields above, only `ownedLandsAssetsDayBoosts` is inventory-exclusive.
  `landAsset`, `filteredAndSortedAssets`, `bagAssets`, `assetsFilter`/`setAssetsFilter` are core
  state for **mining** (~25 consumer files: `PlanetLand`, `MiningDesktopView`, `BagItemChooser`,
  etc.) plus shared components (`TopBar`, `LandownerView`, `PlanetInfo`, `SortBySelector`,
  `SortBySelectorMobile`).
- Consequence: this slice cannot be finished in isolation. Either migrate the shared `atomic`
  fields together with mining (much bigger, cross-feature effort), or stand up a temporary
  Zustand↔Overmind bridge so inventory reads from a new store while mining still reads Overmind
  (adds complexity, but unblocks inventory without dragging mining in immediately).
- Effort: 1-2+ weeks if done properly; treat as its own initiative rather than folding it into "the
  four features," since its actual boundary is `atomic`/mining, not inventory.

## Shared session & transactions

Features are migrated one at a time; nothing requires moving all of `wax` at once. Two shared
pieces (added on the competitions branch) make that possible for features that send transactions:

- **`sessionStore.currentSession`** — the Wharf session that signs transactions. Login still runs
  in Overmind (`main/actions.ts`: Anchor/Wombat/cloud-wallet login, `setCurrentSession` restore,
  `switchWallet`), which writes the session to both Overmind and `sessionStore`, the same bridge
  already used for `walletId`, `currentWallet` and `isAuthenticating`.
- **`shared/wax/transact(actions)`** — signs with the `sessionStore` session and throws on failure.
  Replaces the Overmind path (`effects.wax.api.executeTransactWharf`, which swallows errors into
  `state.wax.lastTransactionError`) for migrated features. Unmigrated wax actions keep using the
  old path unchanged.

The remaining runtime link is that `sessionStore` is filled by Overmind's login code. That goes
away in the final phase below.

## Recommended sequencing

1. `arena` and `competitions` — quick, nearly independent, do first. (competitions: done.)
2. `lore` — contained but real; needs care around the blockchain-action ports and tests.
3. `inventory` — decide bridge-vs-full-atomic-migration before starting; likely needs its own
   scoping pass with mining in view, not just this doc.
4. **Final: session/auth** — once features no longer read session state from Overmind:
   - Move login / logout / `switchWallet` / session restore out of `main/actions.ts` into Zustand,
     writing `sessionStore` directly.
   - Point the wax API's `getCurrentSession` at `sessionStore`, or move the remaining transactions
     onto `shared/wax/transact`.
   - Delete `main.currentSession` and the Overmind → `sessionStore` mirroring.

## Branch naming

Following the existing convention (see `feature/modal-store-zustand-migration`, and the prior,
now-merged `feature/<name>-testing-tailwind-store-refactor` branches from PR #67/#69/#71):

- `feature/arena-store-zustand-migration`
- `feature/competitions-store-zustand-migration`
- `feature/lore-store-zustand-migration`
- `feature/inventory-store-zustand-migration`

Note: `feature/arena-testing-tailwind-store-refactor` and `feature/profile-testing-tailwind-store-refactor`
are stale — their content already merged into `main` via PR #67 (Release 5.2.7) under different
commit hashes (squash merge). `feature/inventory-testing-tailwind-store-refactor` and
`feature/lore-testing-tailwind-store-refactor` are likewise merged (PR #69, #71) but only cover the
small local-UI Zustand stores (`inventoryStore.ts`, `loreStore.ts`), not the `wax`/`main`/`atomic`
slices this doc covers. None of the four are a useful base for this phase — cut new branches from
current `main` instead.
