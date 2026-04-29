# Lore Feature – Developer Guide

## Getting Started
- Copy `.env.example` to `.env` and provide API credentials (Wax Cloud Wallet, GraphQL endpoints).
- Start the UI with `yarn start:local`. The lore feature mounts at `/lore`.
- For GraphQL development without upstream services, run your preferred mock server (MSW, Apollo mock link, etc.) and point `LORE_GRAPHQL_ENDPOINT` to the local endpoint (e.g. `http://localhost:4000/graphql`).

## Architectural Overview
- `LoreDataProvider` owns data fetching and exposes memoised selectors (`useLoreData`, `useLoreLoadingState`, `useLoreVotingInfo`).
- Hooks (`useStakeLore`, `useLiveVotePower`, `useLoreDashboard`) translate provider data & store state into render-ready values.
- Presentational components consume hooks and render Chakra UI. State transitions (staking, submitting, modals) route through Overmind actions.
- Utility modules (`utils/staking.ts`, `utils/utils.ts`) store arithmetic helpers and sorting/formatting logic. Keep them free of React dependencies for simple testing.

## Common Tasks
- **Add data to provider:** extend `LoreDataContextValue`, fetch via GraphQL hook, and pass through via `useMemo`.
- **Expose store actions:** use `useActions` inside hooks rather than components to keep UI declarative.
- **Add a modal:** create under `modals/`, register in the store, and trigger via `setSecondaryModalActive`.

## Testing Strategy
- Run `yarn test src/features/lore/utils` for utility coverage. Tests live next to utilities under `utils/__tests__/`.
- Use React Testing Library + context wrappers for hooks or components that depend on providers/stores.
- Mock Apollo Client and Overmind actions by passing fakes into hooks when necessary; avoid hitting live APIs in unit tests.

## Accessibility & UX Notes
- Ensure new table cells set `aria-sort` when adding sortable columns.
- Buttons should expose `aria-label`s when icon-only; reuse Chakra variants (`primary`, `warning`, etc.) to stay on-brand.
- Keep copy in `shared/locales` once i18n lands; avoid hardcoding strings with product names to ease localisation.

## Release Checklist
- `yarn lint && yarn test src/features/lore` should pass.
- Provide screenshots/GIFs for new UI interactions when filing PRs.
- Update Terraform/infra references if new environment variables are introduced.

