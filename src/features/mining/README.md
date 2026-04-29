# Mining Feature

A comprehensive mining system for the Alien Worlds game, featuring tool management, land ownership, planet exploration, and boost mechanics.

## 🏗️ Architecture Overview

The mining feature is organized into a modular architecture with clear separation of concerns:

```
src/features/mining/
├── components/          # React components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and constants
├── modals/             # Modal components
└── README.md           # This file
```

## 🚀 Recent Refactoring Improvements

### Performance Optimizations
- **Stable React Keys**: Replaced all `v4()` unstable keys with stable identifiers
- **Memoization**: Added strategic `useMemo` and `useCallback` usage across components
- **Component Memoization**: Memoized heavy components to prevent unnecessary re-renders
- **Efficient Calculations**: Cached expensive computations and filtering logic

### Code Quality Enhancements
- **Shared Constants**: Centralized card dimensions and asset type constants
- **Reusable Components**: Created `MiningNFTCard` for consistent card rendering
- **Custom Hooks**: Extracted business logic into focused, reusable hooks
- **Type Safety**: Enhanced TypeScript interfaces and type definitions

### Architecture Improvements
- **Separation of Concerns**: Logic separated into focused hooks and utilities
- **Centralized State Management**: Improved state handling and data flow
- **Better Error Handling**: More robust error boundaries and validation

## 📁 Directory Structure

### Components (`/components`)
- **BagItemChooser**: Tool slot management with drag-and-drop functionality
- **FilterByToolTypeSelector**: Asset filtering by tool type
- **MiningNFTCard**: Reusable NFT card component with optional features
- **MiningToolDrawer**: Tool selection and management interface
- **MiningTabs**: Navigation between mining sub-features
- **LandOwners**: Land management and boost slot components

### Hooks (`/hooks`)
- **useFilteredMiningAssets**: Asset filtering and preparation logic
- **useLandBoostSlots**: Land boost slot management
- **useMiningUtils**: Common mining utility functions
- **useMiningCardInteractions**: Bag management operations
- **usePlanetAssets**: Planet-specific asset handling
- **useRarityPools**: Rarity pool calculations

### Pages (`/pages`)
- **Land.tsx**: Land management and ownership interface
- **Mining.tsx**: Main mining dashboard
- **Planets.tsx**: Planet exploration and selection
- **Shining.tsx**: NFT shining mechanics
- **LandMgt.tsx**: Advanced land management

### Types (`/types`)
- **MiningTypes.ts**: Core mining type definitions
- **LandownerTypes.ts**: Land ownership and boost types
- **RarityPoolTypes.ts**: Rarity pool type definitions

### Utils (`/utils`)
- **constants.tsx**: Shared constants and configuration
- **land.ts**: Land-specific utility functions
- **planet.ts**: Planet-related utilities
- **landownerUtils.ts**: Landowner helper functions

## 🎯 Key Features

### Tool Management
- **Bag System**: Multi-slot tool inventory with drag-and-drop
- **Tool Filtering**: Filter tools by type, rarity, and other attributes
- **Equipment Logic**: Smart asset equipping with conflict prevention

### Land Ownership
- **Boost Slots**: Configurable boost slots for land enhancement
- **Slot Management**: Unlock, add, and manage boost slots
- **Commission System**: Land-based commission calculations

### Planet Exploration
- **Planet Selection**: Choose mining destinations
- **Asset Discovery**: Find and collect planet-specific assets
- **Rarity Pools**: Dynamic rarity-based reward systems

### NFT Shining
- **Shining Mechanics**: Upgrade NFT shine levels
- **Cost Calculation**: Dynamic pricing based on shine requirements
- **Preview System**: Preview shined NFT before committing

## 🔧 Custom Hooks

### useFilteredMiningAssets
```typescript
const { assets } = useFilteredMiningAssets({ currentBagAsset })
```
Filters and prepares mining assets based on current bag state and filters.

### useLandBoostSlots
```typescript
const { firstAvailableSlot, getFirstAvailableSlot } = useLandBoostSlots()
```
Manages land boost slot availability and calculations.

### useMiningUtils
```typescript
const { isAssetEquipped, canEquipAsset, getBagSlotAsset } = useMiningUtils()
```
Provides common utility functions for mining operations.

### useMiningCardInteractions
```typescript
const { addToolToBag, removeToolFromBag, clearBag } = useMiningCardInteractions()
```
Handles bag management operations with proper state updates.

## 🎨 Shared Constants

### Card Dimensions
```typescript
export const MINING_CARD_WIDTH_PX = 270
export const MINING_CARD_HEIGHT_PX = 400
```

### Asset Types
```typescript
export const ASSET_TYPE_LAND = 'Land'
```

### Rarity Colors
```typescript
export const RarityPoolColors = {
  [NftRarity.abundant]: Colors.SNOW_WHITE,
  [NftRarity.common]: Colors.SILVER_CHALICE,
  // ... more rarity colors
}
```


## 🛠️ Development Guidelines

### Adding New Components
1. Create component in appropriate subdirectory
2. Use shared constants from `/utils/constants.tsx`
3. Implement proper TypeScript interfaces
4. Add memoization for performance-critical components
5. Use stable keys for list rendering

### Creating Custom Hooks
1. Place in `/hooks` directory
2. Use descriptive naming convention (`use[Feature][Action]`)
3. Implement proper dependency arrays
4. Add TypeScript interfaces for parameters and return values
5. Include JSDoc comments for complex logic

### State Management
1. Use existing store patterns for global state
2. Implement local state with useState for component-specific data
3. Use useMemo for expensive calculations
4. Use useCallback for event handlers passed to child components

### Performance Best Practices
1. **Memoization**: Use `useMemo` for expensive calculations
2. **Stable References**: Use `useCallback` for function props
3. **Stable Keys**: Use predictable, stable keys for lists
4. **Lazy Loading**: Implement lazy loading for heavy components
5. **Code Splitting**: Split large components into smaller, focused pieces

## 🧪 Testing Guidelines

### Component Testing
- Test component rendering with different prop combinations
- Verify memoization prevents unnecessary re-renders
- Test user interactions and state changes
- Validate accessibility features

### Hook Testing
- Test hook return values with different inputs
- Verify memoization dependencies work correctly
- Test error handling and edge cases
- Validate state updates and side effects

### Integration Testing
- Test component interactions and data flow
- Verify state management across components
- Test user workflows and business logic
- Validate performance under load

## 🐛 Common Issues & Solutions

### Performance Issues
- **Problem**: Component re-rendering unnecessarily
- **Solution**: Add `React.memo` and check prop stability

### Type Errors
- **Problem**: TypeScript errors with asset types
- **Solution**: Use proper interfaces from `/types` directory

### State Synchronization
- **Problem**: State not updating across components
- **Solution**: Check store actions and effect dependencies

## 📈 Future Improvements

### Planned Enhancements
- [ ] Add virtual scrolling for large asset lists
- [ ] Implement advanced filtering options
- [ ] Add drag-and-drop between different mining interfaces
- [ ] Enhance accessibility features
- [ ] Add comprehensive error boundaries

### Performance Optimizations
- [ ] Implement React.Suspense for code splitting
- [ ] Add service worker for offline functionality
- [ ] Optimize bundle size with tree shaking
- [ ] Add performance monitoring and analytics

## 🤝 Contributing

When contributing to the mining feature:

1. **Follow Architecture**: Maintain the established directory structure
2. **Use Hooks**: Leverage existing custom hooks when possible
3. **Performance First**: Consider performance implications of changes
4. **Type Safety**: Maintain strict TypeScript typing
5. **Documentation**: Update this README for significant changes

## 📚 Related Documentation

- [Alien Worlds Game Documentation](https://docs.alienworlds.io/)
- [React Performance Best Practices](https://react.dev/learn/render-and-commit)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Chakra UI Documentation](https://chakra-ui.com/docs)

---

**Last Updated**: December 2024  
**Version**: 2.0.0  
**Maintainer**: Development Team 