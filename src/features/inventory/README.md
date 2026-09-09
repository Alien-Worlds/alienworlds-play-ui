# Inventory Feature

Displays, filters, and paginates the player's NFT assets.

## Structure

```
src/features/inventory/
├── components/
│   ├── AssetsFilterPanel/          # Desktop schema/sort filter bar (Tailwind + Headless UI Tab/Checkbox)
│   ├── AssestsFilterPanelMobil/    # Mobile filter panel (Tailwind + Headless UI Switch)
│   ├── FilterBySelectorMobil/      # Mobile schema dropdown, used inside the mobile filter panel
│   ├── InventoryFiltersDrawer/     # Full-screen mobile filter dialog (Headless UI Dialog)
│   └── ErrorBoundary/              # Error boundary wrapping the Inventory page
├── hooks/
│   └── useAssetProcessing.ts       # Transforms raw IAsset[] into display-ready NFTCardData
├── store/
│   └── inventoryStore.ts           # Zustand store for the page's local "load more" pagination state
├── utils/
│   ├── assetTypeProcessor.ts       # Asset type/schema classification helpers
│   ├── assetImageProcessor.ts      # Asset image URL resolution helpers
│   ├── assetStatsProcessor.ts      # Asset stats/powers calculation helpers
│   ├── NFTCardHelper.tsx           # Legacy data-prep helpers — shared with mining/outpost/profile
│   └── NFTCardOverlayRender.tsx    # Legacy Chakra render components for the NFT card overlay — same shared usage
├── types/                          # Shared TypeScript definitions
├── constants/                      # Pagination, mapping, and asset-type constants
└── pages/
    └── Inventory.tsx               # The Inventory page itself
```

## Where state lives

- **Filter** (asset schema tab, sort field, reversed, group-by-template) lives in Overmind's
  `atomic` namespace (`assetsFilter` / `setAssetsFilter`), not in this feature's own store — it's
  shared with `features/mining` (e.g. the Shining page reuses `AssetsFilterPanel` and
  `InventoryFiltersDrawer` directly).
- **Pagination** ("load more" visible count) is the one piece of state genuinely local to this
  page, and lives in `store/inventoryStore.ts` (Zustand), mirroring the pattern used in
  `features/profile/store/profileStore.ts`.
- **Asset data transformation** (`useAssetProcessing`) is stateless — pure functions over whatever
  assets/config are passed in.

## `utils/NFTCardHelper.tsx` and `utils/NFTCardOverlayRender.tsx`

These are **not** private to this feature. They're imported directly by `features/mining`,
`features/outpost`, and `features/profile` (and `store/wax` imports types from `NFTCardHelper`).
They remain Chakra UI components — rewriting their rendering to Tailwind would need to be
coordinated across all four features at once, so they were deliberately left as-is during the
Tailwind migration of this feature. They do have full test coverage.

## Styling

Everything under `components/` and `pages/Inventory.tsx` that this feature actually owns is
Tailwind CSS (see `tailwind.config.js`'s `content` glob), using `@headlessui/react` for the
dialog/tab/switch/checkbox primitives that Chakra used to provide.
