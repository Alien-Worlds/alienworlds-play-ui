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

### arena — done (`feature/arena-store-zustand-migration`)
- Owns `src/store/arena/` (`state.ts` is `Record<string, never>`, `actions.ts` is one action:
  `showArenaPortalPage`, which forwards to `main.toggleMainDrawer` + `wax.collectEvent`).
- Single call site: [src/features/arena/pages/Arena.tsx](../../src/features/arena/pages/Arena.tsx#L127).
- Effort: ~0.5 day. Just needs the two cross-namespace calls it forwards to be reachable
  (either still-Overmind at the time, or already-migrated equivalents).
- Done: the `arena` namespace is deleted; `Arena.tsx` calls `modalStore.toggleMainDrawer` and
  `collectEvent` directly. Since the analytics step (below) arena has no Overmind imports.

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

### lore — done (`feature/lore-store-zustand-migration`)
- Ported into `src/features/lore/store/loreStore.ts` (the existing local-UI store, extended):
  - transactions `stakeLore`, `unstakeLore`, `claimLoreReward`, `voteLore`, `submitLore` +
    `isTransacting`, signed with `shared/wax/transact`; action payloads live in
    `utils/loreActions.ts` and are asserted field-for-field in `store/loreStore.test.ts`.
  - `loreFilter` / `setLoreFilter`.
  - the-lore GitHub reads (`lorePullRequests`, `loreReadMe`, `getLorePullRequestCommit`) in
    `utils/github.ts`, now plain `fetch` instead of `octokit` (ESM-only, breaks Jest).
- Deleted from Overmind: `wax.{tryStakeVotePowerLore, trySubmitLore, tryUnStakeLore,
  tryClaimLoreReward, tryLoreVoting, setLoreFilter, loreFilter, triggerFilterAndSortLore}`, the
  matching `wax.api` effects, `main.{getLorePullRequests, getLoreReadMe, getLorePullRequestCommit,
  lorePullRequests, loreReadMe, loreDescription}` + effects, and the GitHub `PullRequest` types.
  (The original finding missed `tryUnStakeLore` and the `loreReadMe`/`lorePullRequests` state.)
- Behaviour changes worth knowing:
  - The README/PR list used to be fetched inside `atomic.initializeOrReloadAssets` (the logged-in
    asset poll). Now the README loads when the Lore page mounts (also for logged-out/demo users),
    and PRs load when "Submit Lore" is clicked (as before).
  - Dropped `executeAfter(state.main.syncAi.tlmBalance, …)` after lore transactions: nothing reads
    `syncAi.tlmBalance`. Balances refresh through the Apollo refetches the components already do.
  - Lore transactions no longer set `wax.actionProgressState` (no lore consumer read it).
- Remaining `store/` import: `utils/utils.ts` uses `store/atomic` helpers for `filterAssets`, which
  belongs to mining (see inventory below), not lore.
- `octokit` is now unused in `src/`; it can be removed from `package.json` separately.

### inventory + mining (`atomic`) — done (`feature/mining-store-zustand-migration`)
- Inventory had no namespace of its own; its real boundary was Overmind's `atomic` state, shared
  with mining, so the two were migrated together. Mining got characterisation tests first
  (`feature/mining-testing`) so the move could be checked against them.
- `atomic` state is split by who uses it, so removing a feature doesn't touch the others:
  - **Shared** — `src/shared/store/assetsStore.ts` (`useAssetsStore`): `assets`, `bagAssets`,
    `landAsset`, `avatarAsset`, `ownedLandsAssets`, `assetsFilter` + `filteredAndSortedAssets`
    (the filter/sort is `filterAndSortAssetList`). Read by mining, inventory, syndicates and
    shared UI (`TopBar`, `LandownerView`, `PlanetInfo`, `SortBySelector*`). Imports nothing from
    `features/`.
  - **Mining only** — `src/features/mining/store/miningStore.ts` (`useMiningStore`):
    `landAssetsFilter`, `filterByToolType`, `ownedLandBoostsAssets`.
  - **Inventory only** — `src/features/inventory/store/inventoryStore.ts`:
    `ownedLandsAssetsDayBoosts`, next to the page's pagination state.
  - Neither feature imports the other's store. The one coupling left is the Overmind loader,
    which writes the two feature-only fields; it goes when the loaders move.
- Still in Overmind (`store/atomic/actions.ts`): the loaders (`initializeOrReloadAssets`, `…Bag`,
  `…MiningLand`, `…TagAndAvatar`) and the `atomic` API effects. They run on `main.updateWorld`'s
  1s tick and need `wax`/`main` state, so they move with that; meanwhile they write to the store
  through its setters. `atomic.filterAndSortAssets` is a one-line wrapper passing `wax.isLoggedIn`.
  The avatar loader's `waitUntil(state.atomic.assets)` became a store subscription
  (`assetsLoaded`), which still holds the rest of `updateWorld` until assets exist.
- The land list filter moved from lore (`filterAssets`) to `features/mining/utils/landFilter.ts`
  (`filterAndSortLands`). Overmind's own `filterLandAssets` was deleted: it filled
  `landAssetsFilter.filteredLands`, which nothing displayed.
- Behaviour kept on purpose:
  - Default land ranges still filter. They used to be skipped by identity against the `DEFAULT_*`
    constants, which never matched through Overmind's proxies; with plain objects it would have,
    so the range checks now always apply.
  - An unchanged asset poll still clears `assets` so the next poll (3s) reloads them.
- Tests: `features/mining/testUtils/mockStore` seeds `useAssetsStore` and `useMiningStore` from
  `state.atomic` / `actions.atomic` (each store gets the fields it owns), so the mining tests ran
  unchanged. Inventory tests mock `shared/store/assetsStore` like they mock `sessionStore`.
- **Mining's `wax`/`main` state and transactions** followed on the same branch, so the mining and
  inventory files are only touched (and smoke-tested) once:
  - `src/shared/store/minerStore.ts` (`useMinerStore`, shared): `miner`, `planetSelectedForMining`,
    `whereToMineIntent`, and `whereToMine` / `isOnboarded` kept as fields (recomputed on change;
    `isOnboarded` follows `sessionStore.isLoggedIn`). Read by the layouts, top bar and onboarding.
  - `useAssetsStore` adds the raw `bag` and the `setBag` / `setLand` / `setAvatar` transactions
    (builders in `shared/wax/assetActions.ts`).
  - `useMiningStore` adds land management (`managingLand*`, boost slots, `nftLandCardProperties`),
    shining (`isShining`, `shiningUrl`) and their transactions: `tryShine`, `trySetCommission`,
    `boostSlot`, `unlockSlot`, `applyMainBoost`, `setMinBoost`, `loadManagingLandDetailsAndBoosts`
    (builders in `features/mining/utils/miningActions.ts`).
  - Chain reads: `shared/wax/tables.ts` (`getTableRows`), `features/mining/utils/chainReads.ts`
    (shine info, rarity pools), `features/mining/utils/landBoosts.ts`; NFT reads in
    `shared/util/atomicassets.ts`.
  - `isOutPostModalsActive` moved to `modalStore`. The `main.show*Page` actions became
    `shared/hooks/usePageVisit` (drawer, asset-filter preset, analytics).
  - Transactions still ask Overmind's sync loop for early reloads through
    `shared/store/syncScheduler.ts`, which `store/main` registers on start-up.
- Still Overmind in mining/inventory: the onboarding flow (`onboarding`, `setOnboarding`,
  `executeOnboarding`) used by inventory's land cards. (`wax.collectEvent` moved in the analytics
  step below; mining's components and pages no longer import Overmind.) Overmind
  itself still runs the loaders (assets, bag, mining land, avatar) and login, which write `miner`,
  `bag` etc. into the stores.
- Behaviour changes in this step:
  - A rejected shine no longer leaves the Shining page locked (`isShining` stayed true).
  - `unlockSlot` / `setMinBoost` failures now show the chain error; before they failed silently
    and left the error to appear on the next transaction.
  - Dead state removed: `wax.selectedPlanetName`, `wax.planetLandsAssets` / `main.bindLandsMap`.

### analytics (`wax.collectEvent`) — done (`feature/analytics-zustand-migration`)
- `wax.collectEvent` was called from 15 component/hook files across almost every feature and ~35
  places inside Overmind (`main`, `missions`, `web3`, `wax`). It is now a plain function,
  `collectEvent({ name, fields })` in `shared/util/analytics.ts`, used by both. It isn't a store:
  it has no state, and nothing waits on its result. It never throws (errors are logged), like the
  Overmind `catchError` it replaces.
- It reads its context from the stores: `walletId` and `player` from `sessionStore`, `bag` from
  `useAssetsStore`, `miner.last_mine` from `useMinerStore`, NFT points from the React Query cache.
- `wax.player` (the players-table row: tag, avatar) moved to `sessionStore.player` / `setPlayer`.
  The avatar loader (`atomic.initializeOrReloadTagAndAvatar`) still fetches it and writes it there.
  Readers: `collectEvent`, `topbar/Tag.tsx`, `syndicates/pages/ManageCandidacy.tsx`.
- `queryClient` moved from `index.tsx` to `shared/util/queryClient.ts`, and the user-points key
  to `shared/hooks/queries/wax/queryKeys.ts`, so analytics doesn't import the app entry point or
  Overmind (which kept it out of tests).
- Tests mock `shared/util/analytics` instead of `useActions().wax.collectEvent`; the mining
  `mockStore` no longer defaults it.

### profile — done (`feature/profile-store-zustand-migration`, release 5.3.7)
- The four TLM claims (`wax.tryClaimMiningRewards`, `tryClaimLandownerCommissions`,
  `tryClaimLandownerAllowance`, `tryClaimUnstake`) are plain functions in `shared/wax/claims.ts`
  (`claimMiningRewards`, …, `claimUnstake(symbol)`), signed with `shared/wax/transact`. They're
  shared because syndicates calls the same claims (`PlanetaryActions`, `SyndicatesSidebar`); those
  call sites moved too. No store: callers already track their own "claiming" state
  (`profileStore.claimingStates`, local `useState` in syndicates). Payloads are asserted
  field-for-field in `shared/wax/claims.test.ts`.
- `main.showProfileInfoPage` became `usePageVisit(PagePath.ProfileInfo)`.
- Deleted from Overmind: the four `try*` actions, their `wax.api` effects
  (`claimUnstake`, `claimMiningRewards`, `claimLandownerAllowance`, `claimLandownerComissions`) and
  `main.showProfileInfoPage`.
- Behaviour changes:
  - Dropped `executeAfter(syncAi.tlmBalance | rewardsClaims | planets, …)` after the claims: no
    loader checks those slots with `shouldExecute`, so they never triggered anything.
  - With no wallet, a claim now resolves `false` without sending. Before, the effect returned
    early and the action reported success.
- Left on purpose: `PlanetaryTokens` still reads `wax.selectedDacId`. It's the syndicates planet
  selection (~250 references across syndicates and `main`), so it moves with syndicates.

### leaderboard + compact sidebar — done (`feature/leaderboard-store-zustand-migration`, release 5.3.7)
- `Leaderboard.tsx` reads players through `shared/wax/players.ts` (`getPlayer`, on the shared
  `getTableRows`) and avatars through `shared/util/atomicassets` `getAssetById`. Overmind's
  `wax.api.getPlayer` / `atomic.api.getAssetById` effects stay: its own loaders still use them.
- `main.isCompactSidebar` / `toggleCompactSidebar` moved to `useModalStore`, next to
  `isMainDrawerOpen` / `toggleMainDrawer`, with every reader (sidebar, layouts, top bar,
  `shared/util/hooks`).
- Deleted `useLeaderboardData`, `useLeaderboardState` and `LeaderboardService`: unused since the
  initial commit (the page has its own copy of that logic).
- Leaderboard had no tests; `pages/Leaderboard.test.tsx` and `utils/leaderboardQueries.test.tsx`
  now cover the list/search/paging flow and the API requests.
- Behaviour changes:
  - Logged-out and demo users now see avatars and tags: Overmind's `getPlayer` needed a wallet.
  - Fixed (#110): one failed player/avatar lookup no longer leaves the table on "Loading...";
    that row just has no tag/avatar. Lookups for results that changed meanwhile (paging again)
    are dropped, so an earlier page can't replace the current one.

### outpost — done (`feature/outpost-store-zustand-migration`, release 5.3.8)
- The three redemptions are plain functions in `features/outpost/utils/redeemOffers.ts`
  (`redeemAWNftOffer`, `redeemCommunityNftOffer`, `redeemLevelOffer`), signed with
  `shared/wax/transact`, used as the `mutationFn` of the existing React Query hooks.
- Community offers load through `features/outpost/utils/premintOffers.ts` (`loadPremintOffers`,
  for `useWaxPagination`), on two new shared readers: `shared/wax/tables` `getTablePage` (keeps
  `more` / `next_key`) and `shared/util/atomicassets` `getTemplatesByIds`.
- Deleted from Overmind: `wax.loadPremintOffersAction`, `wax.resetLastTransactionError`, and the
  `wax.api` effects `redeemAWNftOffer`, `redeemCommunityNftOffer`, `redeemLevelOffer`,
  `getPremintOffers`.
- Outpost had no tests; the redeem functions, premint loader, the three mutation hooks and
  `CommunityNftOffers` are now covered.
- Behaviour changes (bug fixes):
  - Overmind's `executeTransactWharf` swallows transaction errors, so a failed or rejected fuse
    resolved the mutation: it showed "Fuse success" and subtracted the shards. Now `onError` runs:
    "Not enough shards" / "Fuse failed" (and the level-reward failure toast) actually show.
  - The swallowed error also stayed in `wax.lastTransactionError`, so the next Overmind
    transaction elsewhere (staking, voting…) reported it as its own failure. Outpost no longer
    writes it.
  - Logged out, `loadPremintOffers` returns an empty last page; Overmind returned `null`, which
    crashed inside `useWaxPagination` and left the Community tab's spinner up.
- Still Overmind, indirectly: outpost's AW offers, level offers and templates come through the
  shared query hooks in `shared/hooks/queries` (see step 6b).

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

1. `arena` and `competitions` — quick, nearly independent, do first. (done)
2. `lore` — contained but real; needs care around the blockchain-action ports and tests. (done)
3. `inventory` + mining's `atomic` state — split into a shared `useAssetsStore` plus mining and
   inventory stores. (done)
4. Mining transactions and mining `wax` state — onto `shared/wax/transact`, like lore. (done)
5. Analytics: `wax.collectEvent` → `shared/util/analytics`, `wax.player` → `sessionStore`. (done)
6. Small leftovers, one branch each. (done)
   - profile: claim transactions, `showProfileInfoPage`. (5.3.7; `selectedDacId` moves with
     syndicates)
   - leaderboard: `wax.api.getPlayer`, `atomic.api.getAssetById`, `main.isCompactSidebar` →
     `useModalStore`. (5.3.7)
   - outpost: `loadPremintOffersAction`, `resetLastTransactionError`, redeem effects. (5.3.8)
   - 6b. Shared read hooks in `shared/hooks/queries`, still on Overmind effects:
     `wax.api.getPointsOffers` (AW offers), `getLevelOffers`, `getUserPoints`,
     `getPlanetMemberTermsText` (syndicates) and `atomic.api.getTemplatesByIds`. Read-only, so
     they move onto `shared/wax/tables` / `shared/util/atomicassets` like leaderboard's reads.
7. `missions` (own namespace), then `syndicates` (largest). Neither has tests yet; add
   characterisation tests first, as for mining.
8. **Final: session/auth** — once features no longer read session state from Overmind:
   - Move login / logout / `switchWallet` / session restore out of `main/actions.ts` into Zustand,
     writing `sessionStore` directly.
   - Point the wax API's `getCurrentSession` at `sessionStore`, or move the remaining transactions
     onto `shared/wax/transact`.
   - Delete `main.currentSession` and the Overmind → `sessionStore` mirroring.
   - Move with it everything that runs on `main.updateWorld`, which the steps above don't cover:
     - the mining loop (`main.mine`, `claimMine`, `mineDelay`, `miningGameState`, read by the
       top bar's mining counter);
     - the loaders (`atomic.initializeOrReloadAssets`, `…Bag`, `…MiningLand`, `…TagAndAvatar`,
       `wax.initializeOrReloadResources`);
     - the onboarding flow (`wax.onboarding`, `setOnboarding`, `executeOnboarding`; used by
       inventory, missions and onboarding).
   - Shared UI state still in `wax`: `selectedDrawerView`, `isSyndicatesSidebarOpen`, `resources`,
     `setTag` / `isSettingTag`. Move each with its main consumer (syndicates sidebar, top bar).

## Branch naming

Following the existing convention (see `feature/modal-store-zustand-migration`, and the prior,
now-merged `feature/<name>-testing-tailwind-store-refactor` branches from PR #67/#69/#71):

- `feature/arena-store-zustand-migration`
- `feature/competitions-store-zustand-migration`
- `feature/lore-store-zustand-migration`
- `feature/inventory-store-zustand-migration`
- `feature/analytics-zustand-migration`
- `feature/profile-store-zustand-migration`, `feature/leaderboard-store-zustand-migration`,
  `feature/outpost-store-zustand-migration`

Release flow: cut `release/x.y.z` from `main` with a "Bump version" commit (`package.json` and
the sidebar footer), open one PR per feature into it, then one `Release/x.y.z` PR into `main`.
PRs are squash-merged and head branches aren't deleted on merge, so don't stack a PR on a
feature branch: once the branch below merges, the stacked PR still targets it and its change
never reaches the release (this happened with #109; #110 brought it in). Base follow-ups on the
release branch instead.

Note: `feature/arena-testing-tailwind-store-refactor` and `feature/profile-testing-tailwind-store-refactor`
are stale — their content already merged into `main` via PR #67 (Release 5.2.7) under different
commit hashes (squash merge). `feature/inventory-testing-tailwind-store-refactor` and
`feature/lore-testing-tailwind-store-refactor` are likewise merged (PR #69, #71) but only cover the
small local-UI Zustand stores (`inventoryStore.ts`, `loreStore.ts`), not the `wax`/`main`/`atomic`
slices this doc covers. None of the four are a useful base for this phase — cut new branches from
current `main` instead.
