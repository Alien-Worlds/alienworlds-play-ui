# Lore Feature

## Overview
- Coordinates the lore browsing, voting, and staking experience.
- Centralises lore data fetching through `LoreDataProvider` to avoid duplicate network calls and make derived hooks available.
- Splits user interactions into composable components (`Dashboard`, `StakeLore`, drawers/modals) to simplify maintenance.

## Data Flow
- `LoreDataProvider` wraps `pages/Lore` and exposes context via `useLoreData`, `useLoreLoadingState`, and helpers such as `useLiveVotePower`.
- Queries:
  - `useLores` → lore proposals and globals.
  - `useWalletDetails` → wallet balances and lore voter state.
- UI components reach data through hooks (no direct GraphQL calls).
- Mutations and side effects remain orchestrated in store actions (`useActions`) to keep the UI declarative.

## Key Components
- `pages/Lore` – route-level composition that wires data, responsive layout, and modal triggers.
- `components/Dashboard` – renders sortable lore proposal table with selection hooked to `LoreDrawer`.
- `components/StakeLore` – stake/unstake and submission actions paired with live wallet data.
- `components/LoreDrawer` – vote form with validations and clipboard helpers.
- `modals/*` – submission/unstake flows, reusing shared styles and form utilities.

## Hooks
- `useLoreData` – access raw data (`proposals`, `globals`, `walletDetails`, loading flags).
- `useLoreLoadingState` – concise loading selector for route/feature gating.
- `useLiveVotePower` – derives real-time vote power from globals and voter info at a configurable polling interval.

## Architecture
- `hooks/useStakeLore` and `hooks/useLoreDashboard` isolate business logic (staking flows, table selection/sorting) away from presentation.
- Shared helpers live in `utils/staking.ts` and `utils/utils.ts`; add new token math/formatters here so both hooks and tests can reuse them.
- UI is composed from leaf components:
  - `StakeLore` → `StakeMetrics`, `StakeActions`, `StakeDailyRewardBanner`.
  - `Dashboard` → `LoreTable` helpers (`SortByTh`, `loreTableBodyRenderer`) and `LoreDrawer`.
- All network access still flows through `LoreDataProvider` → GraphQL hooks and Overmind actions.

## Extending the Feature
- **Add a new dashboard column:** update `types/loreTypes.ts` → `LoreTableColumns`, adjust `loreTableRowRenderer`, and extend `LoreProposal` mapping logic in `LoreTableCellRenderer`. Keep renderers pure and format data via helpers in `utils/`.
- **Augment staking UI:** reuse hooks from `hooks/useStakeLore` and add presentational components under `components/StakeLore/`. Form validation should remain in `StakeActions` with shared helpers (`validateAmount`).
- **Add a modal or drawer:** create a component in `modals/` or `components/`, trigger it via Overmind actions inside hooks rather than directly from presentational code.
- **Introduce new GraphQL data:** expose it through `LoreDataProvider` selectors, then consume via hooks—avoid placing GraphQL logic directly in components.

## Testing
- Unit tests for lore utilities live under `src/features/lore/utils/__tests__/`. Run `yarn test src/features/lore/utils` to execute them.
- When adding new helpers or hooks, include tests that cover boundary cases (empty stakes, malformed numbers, permission gating).
- Prefer React Testing Library for components; mock `LoreDataProvider` context when exercising hooks or containers.

## Contribution Checklist
- Run lint/tests before opening a PR (`yarn lint` / project defaults).
- Add unit tests for new data helpers or business logic.
- Prefer extending the hooks/services layer instead of introducing ad-hoc GraphQL calls inside components.
- Reuse existing color tokens and typography (define missing tokens in the theme rather than inline styles).

## Additional Resources
- See `docs/lore/development.md` for environment setup, mock data strategies, and API contract notes.

