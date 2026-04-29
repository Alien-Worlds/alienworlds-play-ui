# Inventory Feature

The Inventory feature provides a comprehensive system for displaying, filtering, and managing NFT assets in the Alien Worlds game. This feature has been refactored for better maintainability, community contribution, and extensibility.

## 🏗️ Architecture

The inventory feature follows a modular architecture with clear separation of concerns:

```
src/features/inventory/
├── components/          # React components
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── constants/          # Constants and configuration
└── pages/              # Page components
```

## 📁 Directory Structure

### Components
- **ErrorBoundary/**: Error handling and fallback UI
- **AssetsFilterPanel/**: Desktop filter controls
- **AssetsFilterPanelMobile/**: Mobile filter controls
- **InventoryFiltersDrawer/**: Mobile filter drawer
- **NFTCard/**: Individual NFT card components

### Hooks
- **useInventory.ts**: Main inventory state management
- **useAssetProcessing.ts**: Asset data transformation

### Utils
- **assetTypeProcessor.ts**: Asset type detection and mapping
- **assetImageProcessor.ts**: Image URL generation and validation
- **assetStatsProcessor.ts**: Game stats and powers calculation

### Types
- **index.ts**: Comprehensive TypeScript definitions

### Constants
- **index.ts**: Configuration values and mappings

## 🚀 Getting Started

### Basic Usage

```tsx
import { useInventory } from 'features/inventory/hooks/useInventory'
import { InventoryErrorBoundary } from 'features/inventory/components/ErrorBoundary'

function InventoryPage() {
  const { assets, loading, filter, actions } = useInventory(
    userAssets,
    walletId,
    bagAssets
  )

  return (
    <InventoryErrorBoundary>
      <div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <AssetGrid assets={assets} onAssetSelect={actions.selectAsset} />
        )}
      </div>
    </InventoryErrorBoundary>
  )
}
```

### Processing Assets

```tsx
import { useAssetProcessing } from 'features/inventory/hooks/useAssetProcessing'

function AssetProcessor() {
  const { processAsset, getAssetImage } = useAssetProcessing()

  const cardData = processAsset(asset, {
    walletId: 'user123',
    bagAssets: [],
    includeImages: true,
    includePowers: true,
  })

  const imageUrl = getAssetImage(asset)
  
  return <NFTCard data={cardData} imageUrl={imageUrl} />
}
```

## 🔧 Configuration

### Asset Processing Configuration

```tsx
interface AssetProcessingConfig {
  walletId?: string           // User's wallet ID for ownership checks
  bagAssets?: any[]          // Assets in user's bag
  includeImages?: boolean    // Include image processing
  includePowers?: boolean    // Include game stats calculation
  includeMetadata?: boolean  // Include additional metadata
}
```

### Filter Configuration

```tsx
interface InventoryFilter {
  assetSchema: string        // Asset type filter
  sortBy: string           // Sort field
  reversed: boolean        // Sort direction
  groupByTemplate: boolean // Group by template
}
```

## 🎨 Customization

### Adding New Asset Types

1. **Update Constants**:
```tsx
// constants/index.ts
export const ASSET_TYPE_MAPPINGS = {
  [AssetType.NEW_TYPE]: 'New Type',
  // ... existing mappings
}
```

2. **Add Type Processing**:
```tsx
// utils/assetTypeProcessor.ts
export const getAssetTypeName = (schema: string, templateId?: string): string => {
  // Add logic for new type
  if (schema === AssetType.NEW_TYPE) {
    return 'New Type'
  }
  // ... existing logic
}
```

3. **Add Stats Processing**:
```tsx
// utils/assetStatsProcessor.ts
export const getAssetPowers = (asset: IAsset, config: AssetStatsConfig): AssetPower[] => {
  // Add case for new type
  case AssetType.NEW_TYPE:
    // Add power calculations
    break
}
```

### Custom Error Handling

```tsx
import { withErrorBoundary } from 'features/inventory/components/ErrorBoundary'

const CustomFallback = ({ error }: { error: Error }) => (
  <div>Custom error UI: {error.message}</div>
)

const SafeComponent = withErrorBoundary(MyComponent, CustomFallback)
```

## 🧪 Testing

### Unit Tests

```tsx
// __tests__/assetTypeProcessor.test.ts
import { getAssetTypeName, isOreTemplate } from '../utils/assetTypeProcessor'

describe('Asset Type Processor', () => {
  it('should identify ore templates', () => {
    expect(isOreTemplate('515558')).toBe(true)
    expect(isOreTemplate('123456')).toBe(false)
  })

  it('should return correct type names', () => {
    expect(getAssetTypeName('tool.worlds')).toBe('Tool')
    expect(getAssetTypeName('level.worlds', '515558')).toBe('Ore')
  })
})
```

### Component Tests

```tsx
// __tests__/Inventory.test.tsx
import { render, screen } from '@testing-library/react'
import { useInventory } from '../hooks/useInventory'

// Mock the hook
jest.mock('../hooks/useInventory')

test('renders inventory with assets', () => {
  const mockAssets = [/* mock asset data */]
  useInventory.mockReturnValue({
    assets: mockAssets,
    loading: false,
    error: null,
    // ... other return values
  })

  render(<InventoryPage />)
  expect(screen.getByText('Tool')).toBeInTheDocument()
})
```

## 📊 Performance Considerations

### Optimization Strategies

1. **Memoization**: Use `useMemo` for expensive calculations
2. **Virtualization**: Implement virtual scrolling for large asset lists
3. **Image Lazy Loading**: Load images only when needed
4. **Debounced Filtering**: Debounce filter changes to avoid excessive re-renders

### Example Implementation

```tsx
import { useMemo, useCallback } from 'react'
import { debounce } from 'lodash'

function OptimizedInventory() {
  const [filter, setFilter] = useState('')
  
  // Debounced filter update
  const debouncedSetFilter = useCallback(
    debounce((value: string) => setFilter(value), 300),
    []
  )

  // Memoized filtered assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => 
      asset.name.toLowerCase().includes(filter.toLowerCase())
    )
  }, [assets, filter])

  return (
    <div>
      <input onChange={(e) => debouncedSetFilter(e.target.value)} />
      <AssetGrid assets={filteredAssets} />
    </div>
  )
}
```

## 🔍 Debugging

### Debug Tools

```tsx
// Enable debug logging
const DEBUG_INVENTORY = process.env.NODE_ENV === 'development'

if (DEBUG_INVENTORY) {
  console.log('Inventory State:', { assets, filter, pagination })
  console.log('Asset Processing:', { processedAssets })
}
```

### Common Issues

1. **Image Loading Failures**: Check IPFS URLs and fallback images
2. **Filter Performance**: Use debouncing for filter inputs
3. **Memory Leaks**: Ensure proper cleanup in useEffect hooks
4. **Type Errors**: Verify asset data structure matches expected types

## 🤝 Contributing

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public functions
- Write unit tests for utility functions

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

### Adding New Features

1. **Plan the Feature**: Define the API and behavior
2. **Create Types**: Add TypeScript definitions
3. **Implement Logic**: Create utility functions
4. **Add Hooks**: Create custom hooks if needed
5. **Build Components**: Create React components
6. **Write Tests**: Add comprehensive tests
7. **Update Docs**: Update this README

## 📚 API Reference

### Hooks

#### `useInventory(assets, walletId, bagAssets)`
Main inventory management hook.

**Parameters:**
- `assets: IAsset[]` - Array of assets to display
- `walletId?: string` - User's wallet ID
- `bagAssets?: any[]` - Assets in user's bag

**Returns:**
- `assets: NFTCardData[]` - Processed assets for display
- `loading: boolean` - Loading state
- `error: string | null` - Error message if any
- `filter: InventoryFilter` - Current filter state
- `pagination: PaginationConfig` - Pagination state
- `actions: object` - Action functions

#### `useAssetProcessing()`
Asset data processing hook.

**Returns:**
- `processAsset(asset, config)` - Process single asset
- `processAssets(assets, config)` - Process multiple assets
- `getAssetImage(asset)` - Get asset image URL
- `getAssetPowers(asset)` - Get asset powers/stats

### Utilities

#### Asset Type Processing
- `getAssetTypeName(schema, templateId)` - Get display name
- `isOreTemplate(templateId)` - Check if template is ore
- `shouldDisableInnerRing(asset)` - Check ring visibility
- `filterAssetsByType(assets, type)` - Filter by type

#### Asset Image Processing
- `getAssetImageUrl(asset)` - Get complete image URL
- `isBoostCard(asset)` - Check if boost card
- `validateImageUrl(url)` - Validate image accessibility

#### Asset Stats Processing
- `getAssetPowers(asset, config)` - Get all powers/stats
- `getAssetEase(asset)` - Get mining power
- `getAssetLuck(asset)` - Get NFT power
- `getAssetStatsSummary(asset)` - Get all stats

## 🆕 Migration Guide

### From Old Structure

If you're migrating from the old inventory structure:

1. **Replace Direct Imports**:
```tsx
// Old
import { NFTCardDataPreparation } from 'features/inventory/utils/NFTCardHelper'

// New
import { useAssetProcessing } from 'features/inventory/hooks/useAssetProcessing'
```

2. **Update Component Usage**:
```tsx
// Old
const processedAssets = NFTCardDataPreparation(assets, walletId, bagAssets)

// New
const { processAssets } = useAssetProcessing()
const processedAssets = processAssets(assets, { walletId, bagAssets })
```

3. **Add Error Boundaries**:
```tsx
// Wrap components with error boundary
<InventoryErrorBoundary>
  <YourComponent />
</InventoryErrorBoundary>
```

## 📄 License

This feature is part of the Alien Worlds game UI and follows the same license terms.
