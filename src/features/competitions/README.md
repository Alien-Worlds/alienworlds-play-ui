# Competitions Feature

## Overview
- Lists Alien Worlds community tournaments, split into five tabs that map 1:1 to the
  `tournaments` GraphQL response: Upcoming, Live, Processing, Get Rewards, Completed.
- Opens a details drawer for a tournament, from which players can visit it or claim an
  unclaimed reward.

## Structure

```
src/features/competitions/
├── components/
│   ├── CompetitionCard/    # Tournament card (Tailwind); buttons depend on TournamentStatus
│   └── CompetitionDrawer/  # Details drawer (Tailwind + Headless UI Dialog), claim/visit/copy link
├── store/
│   └── competitionsStore.ts # Zustand: reward-claim transaction + in-flight flag
├── pages/
│   └── Competitions.tsx    # Route-level composition (Tailwind + Headless UI Tabs)
├── types/
│   └── competitionTypes.ts # TournamentStatus (the UI status each tab renders its cards with)
├── utils/
│   └── utils.ts            # UTC formatting, reward-claim eligibility, card opacity
└── testUtils/
    └── makeTournament.ts   # Tournament fixture shared by the tests
```

## Where state lives

- **Tournament data** comes from `graphql/hooks/useCompetitions`, queried for the current
  `walletId`.
- **`walletId`/`isDemoUser`** come from `shared/store/sessionStore` (Zustand).
- **Claiming a reward** is `claimTournamentReward` in `store/competitionsStore` (Zustand). It builds
  the `comp.worlds` `claim` action and signs it with `shared/wax/transact`, which uses the Wharf
  session from `sessionStore`. No Overmind involved; the old `wax.tryClaimTournamentReward` action
  and `claimTournamentReward` effect are removed. The page refetches on success.
- The selected tournament and drawer visibility are plain `useState` in the page; nothing else
  reads them, so they don't warrant a store.

## Styling

Everything in this feature is Tailwind CSS (see `tailwind.config.js`'s `content` glob), using
`@headlessui/react` for the dialog/tab primitives that Chakra used to provide. `@alien-worlds/uikit`'s
`Button`/`useBreakpointValue` and `@alien-worlds/icons` are kept, as in the other migrated features.

Behavioural notes on the migration:
- The drawer used Chakra's `persistent` variant on desktop (no overlay, page behind it stayed
  interactive). Headless UI's `Dialog` is always modal, so on desktop clicking outside now closes
  the drawer. The dimming overlay is still only shown below `lg`, like before.
- Responsive classes use Tailwind's default breakpoints (`sm` 640px, `lg` 1024px), which differ
  slightly from Chakra's (`sm` 480px, `lg` 992px), consistent with the arena/lore/profile migrations.

## Testing

- Every component, the page, and the utils have co-located tests. Run `yarn test src/features/competitions`.
- Component tests mock `shared/store/sessionStore` and `react-use` with only the slices each file
  reads. The page test mocks `useCompetitions`, `competitionsStore` and the drawer; the store test
  mocks `shared/wax/transact` and the toasts.

## Contribution Checklist
- Run `yarn test` and `npx tsc --noEmit -p tsconfig.json` before opening a PR.
- Reuse `testUtils/makeTournament` for fixtures instead of hand-building `Tournament` objects.
- Reuse existing color tokens (`shared/util/colors`) and Tailwind's `font-orb`/`font-tlm` classes rather
  than inline font-family strings.
