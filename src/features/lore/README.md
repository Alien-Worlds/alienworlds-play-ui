# Lore Feature

## Overview
- Coordinates the lore browsing, voting, and staking experience.
- Centralises lore data fetching through `LoreDataProvider` to avoid duplicate network calls and make derived hooks available.
- Splits user interactions into composable components (`Dashboard`, `StakeLore`, drawers/modals) to simplify maintenance.

## Structure

```
src/features/lore/
├── components/
│   ├── Dashboard/       # Lore proposal table (Tailwind), sortable, opens LoreDrawer on row select
│   ├── LoreDrawer/       # Vote drawer (Tailwind + Headless UI Dialog), Formik vote form
│   ├── LoreSelect/       # Mobile tab dropdown (react-select, unchanged from before)
│   └── StakeLore/        # Stake/unstake actions, metrics, rewards explainer (all Tailwind)
├── modals/
│   ├── SubmitLoreModal/  # Lore submission form (Tailwind + Headless UI Dialog)
│   └── UnstakeLoreModal/ # Unstake confirmation (Tailwind + Headless UI Dialog)
├── data/
│   └── LoreDataProvider.tsx  # GraphQL context: proposals, globals, wallet details
├── hooks/
│   ├── useLoreDashboard.ts   # Table sorting/selection logic
│   ├── useStakeLore.ts       # Stake/unstake/claim business logic
│   └── useLiveVotePower.ts   # Polls a locally-computed live vote power value
├── store/
│   └── loreStore.ts      # Zustand store for the feature's own local UI state
├── utils/
│   ├── staking.ts        # Token/stake amount parsing and reward math
│   └── utils.ts          # Lore sorting + land asset filtering (shared with features/mining)
├── types/
│   └── loreTypes.ts
└── pages/
    └── Lore.tsx           # Route-level composition (Tailwind + Headless UI Tabs)
```

## Where state lives

- **Wallet/chain data** (`isDemoUser`, `loreFilter`, staking/voting actions, modal visibility) stays
  in Overmind's `wax`/`modal`/`main` namespaces via `useAppState`/`useActions` — it's shared app-wide
  state, not local to this feature, so it wasn't touched by this migration.
- **Dashboard row selection** (`selectedProposalId`, which also drives `LoreDrawer`'s open state) and
  **the stake-amount input preview** (`stakedInput`, used to compute `newDailyReward`) are the two
  pieces of state genuinely local to this feature. Both previously lived in ad-hoc `useState` inside
  `useLoreDashboard`/`useStakeLore` and now live in `store/loreStore.ts` (Zustand), mirroring the
  pattern used in `features/inventory/store/inventoryStore.ts` and `features/profile/store/profileStore.ts`.
- All GraphQL data flows through `LoreDataProvider` → `useLoreData`/`useLoreLoadingState`/etc.

## `utils/utils.ts`

`filterAssets` in this file is **not** private to lore — it's imported directly by
`features/mining/pages/Land.tsx` for land-asset filtering. It was left in place and given full test
coverage, but wasn't relocated as part of this migration.

## Styling

Everything under `components/`, `modals/`, and `pages/Lore.tsx` is Tailwind CSS (see
`tailwind.config.js`'s `content` glob), using `@headlessui/react` for the dialog/tab primitives that
Chakra used to provide. `shared/components/FormCheckbox` (used by `SubmitLoreModal`) remains a Chakra
component — it's shared with `features/onboarding`, so rewriting it was out of scope here, the same
reasoning `features/inventory` used to leave `NFTCardHelper.tsx` as Chakra.

## Testing

- Every file in this feature has a co-located `*.test.tsx`/`*.test.ts`. Run `yarn test src/features/lore`.
- `utils/staking.ts` and `utils/utils.ts` have plain unit tests (no rendering needed).
- Component tests mock `store` (`useAppState`/`useActions`) with only the slices each file reads, and
  mock `features/lore/data/LoreDataProvider` or the underlying GraphQL hooks where relevant — see
  existing tests for the established mocking shape.
- When adding new helpers or hooks, include tests that cover boundary cases (empty stakes, malformed
  numbers, permission gating).

## Contribution Checklist
- Run `yarn test` and `npx tsc --noEmit -p tsconfig.json` before opening a PR.
- Add unit tests for new data helpers or business logic.
- Prefer extending the hooks/services layer instead of introducing ad-hoc GraphQL calls inside components.
- Reuse existing color tokens (`shared/util/colors`) and Tailwind's `font-orb`/`font-tlm` classes rather
  than inline font-family strings.
