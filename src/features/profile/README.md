# Profile Feature

A comprehensive profile management system for the Alien Worlds game UI. This feature handles user account information, balances, rewards, and claims.

## 🏗️ Architecture

The profile feature follows a modular, component-based architecture with clear separation of concerns:

```
src/features/profile/
├── components/          # UI Components
│   ├── ui/              # Reusable UI components
│   ├── sections/        # Feature-specific sections
│   └── modals/          # Modal components
├── hooks/               # Custom React hooks
├── types/               # TypeScript definitions
├── constants/           # Configuration and constants
├── utils/               # Utility functions
├── store/               # Zustand store (local UI state, e.g. claim-in-progress flags)
├── context/             # React context providers
└── pages/               # Page components
```

Styling is Tailwind CSS (no Chakra UI) and co-located `*.test.tsx`/`*.test.ts` files sit next to the code they test, following the same conventions as `src/features/arena/`.

## 🚀 Getting Started

### Basic Usage

```tsx
import { ProfileProvider } from 'features/profile/context/ProfileContext'
import { ProfileView } from 'features/profile/components/ProfileView'

function App() {
  return (
    <ProfileProvider>
      <ProfileView />
    </ProfileProvider>
  )
}
```

### Using Individual Components

```tsx
import { UserInfo } from 'features/profile/components/ui/UserInfo'
import { BalanceCard } from 'features/profile/components/ui/BalanceCard'

function MyComponent() {
  return (
    <div>
      <UserInfo 
        walletId="user123" 
        isDemoUser={false} 
        level={5} 
      />
      <BalanceCard 
        icon={<WaxIcon />}
        label="WAX Balance"
        amount="1000.0000"
        currency="TLM"
      />
    </div>
  )
}
```

### Using Custom Hooks

```tsx
import { useProfileData } from 'features/profile/hooks/useProfileData'
import { useBalanceData } from 'features/profile/hooks/useBalanceData'

function MyComponent() {
  const { profileData, loading, error } = useProfileData()
  const { balanceData } = useBalanceData()
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      <h1>{profileData?.walletId}</h1>
      <p>Balance: {balanceData?.tlmBalance}</p>
    </div>
  )
}
```

## 📚 Components

### UI Components

#### UserInfo
Displays user information including avatar and basic details.

```tsx
<UserInfo
  walletId="user123"
  isDemoUser={false}
  level={5}
  showAvatar={true}
  showLevel={true}
  variant="full"
/>
```

#### BalanceCard
A reusable component for displaying balance information.

```tsx
<BalanceCard
  icon={<WaxIcon />}
  label="WAX TLM Balance"
  amount="1000.0000"
  currency="TLM"
  color={Colors.SNOW_WHITE}
/>
```

#### BadgeDisplay
Displays user level badges and rank information.

```tsx
<BadgeDisplay
  level={5}
  size="medium"
  showMap={true}
/>
```

### Section Components

#### ProfileHeader
Comprehensive header component that displays user information and navigation.

```tsx
<ProfileHeader
  variant="full"
  showBadge={true}
/>
```

#### BalanceSection
Displays all user balances in an organized layout.

```tsx
<BalanceSection />
```

## 🎣 Custom Hooks

### useProfileData
Manages profile-related data fetching and state management.

```tsx
const { profileData, loading, error, refresh } = useProfileData()
```

### useBalanceData
Manages balance-related data fetching and calculations.

```tsx
const { balanceData, loading, error, refresh } = useBalanceData()
```

### useClaimsData
Manages claims-related data and actions.

```tsx
const { claims, loading, error, claimReward } = useClaimsData()
```

## 🎨 Styling

Components use Tailwind utility classes directly (no Chakra UI, no shared `Box`/`Flex` abstraction layer — raw `div`/`p`/`span` elements styled with `className`). Dynamic or computed values (gradients, per-rank colors from `shared/util/colors`, runtime-computed offsets) are set via inline `style` props rather than static classes, since Tailwind's build-time class generation can't express them.

```tsx
import { PROFILE_CONSTANTS, UI_CONSTANTS } from 'features/profile/constants/profile.constants'

// Avatar sizes
const avatarSize = PROFILE_CONSTANTS.AVATAR_SIZES.MEDIUM

// Colors
const primaryColor = UI_CONSTANTS.COLORS.PRIMARY

// Spacing
const padding = UI_CONSTANTS.SPACING.MD
```

## 🗃️ Store

`store/profileStore.ts` is a small [Zustand](https://github.com/pmndrs/zustand) store holding profile-local UI state — currently just `claimingStates`, the per-claim-key "is this claim in flight" map used by `useClaimsData`. It is intentionally narrow in scope: server data (wallet details, DAO balances) stays in GraphQL query hooks, and global wallet/claim actions stay in the app's Overmind store (`store/wax`) — only local, UI-only state lives here.

```tsx
import { useProfileStore } from 'features/profile/store/profileStore'

const claimingStates = useProfileStore((state) => state.claimingStates)
const setClaiming = useProfileStore((state) => state.setClaiming)
```

## 🧪 Testing

Tests use Jest + React Testing Library (via CRA's `react-scripts test`), matching `src/features/arena/`'s conventions: co-located `*.test.tsx`/`*.test.ts` files (no `__tests__` folders), module-boundary mocks for `store` (Overmind), GraphQL hooks, and cross-feature dependencies, and `afterEach(() => jest.clearAllMocks())`.

### Component Testing

```tsx
import { render, screen } from '@testing-library/react'
import { UserInfo } from 'features/profile/components/ui/UserInfo'

test('renders user information', () => {
  render(
    <UserInfo 
      walletId="test123" 
      isDemoUser={false} 
      level={5} 
    />
  )
  
  expect(screen.getByText('test123')).toBeInTheDocument()
  expect(screen.getByText('Rank:')).toBeInTheDocument()
})
```

### Hook Testing

```tsx
import { renderHook } from '@testing-library/react'
import { useProfileData } from 'features/profile/hooks/useProfileData'

test('returns profile data', () => {
  const { result } = renderHook(() => useProfileData())
  
  expect(result.current.profileData).toBeDefined()
  expect(result.current.loading).toBe(false)
})
```

## 🔧 Configuration

### Constants

The profile feature uses centralized constants for configuration:

```typescript
// Profile constants
export const PROFILE_CONSTANTS = {
  DEMO_ACCOUNT_TAG: 'Demo Account',
  AVATAR_SIZES: {
    SMALL: 5.2,
    MEDIUM: 7.6312,
    LARGE: 9
  }
}

// UI constants
export const UI_CONSTANTS = {
  COLORS: {
    PRIMARY: Colors.SNOW_WHITE,
    SECONDARY: Colors.DI_SERRIA
  },
  SPACING: {
    SM: '8px',
    MD: '16px',
    LG: '24px'
  }
}
```

## 🚨 Error Handling

The profile feature includes comprehensive error handling:

```tsx
import { ProfileErrorBoundary } from 'features/profile/components/ErrorBoundary'

<ProfileErrorBoundary>
  <ProfileView />
</ProfileErrorBoundary>
```

## 📈 Performance

### Optimizations

- **React.memo**: Used for expensive components
- **useMemo**: For expensive calculations
- **useCallback**: For event handlers
- **Lazy loading**: For large components

### Best Practices

```tsx
// Memoize expensive components
export const BalanceCard = React.memo(({ balance, type }) => {
  // Component implementation
})

// Use useMemo for calculations
const processedData = useMemo(() => {
  return processBalanceData(rawData)
}, [rawData])

// Use useCallback for handlers
const handleClaim = useCallback(async (type) => {
  await claimReward(type)
}, [claimReward])
```

## 🤝 Contributing

### Development Setup

1. Install dependencies
2. Run tests: `npm test`
3. Run linting: `npm run lint`
4. Build: `npm run build`

### Code Style

- Use TypeScript for all new code
- Follow the existing component structure
- Write tests for new components
- Update documentation for new features

### Pull Request Process

1. Create a feature branch
2. Make your changes
3. Add tests
4. Update documentation
5. Submit a pull request

## 📝 License

This project is part of the Alien Worlds game UI and follows the same licensing terms.

## 🆘 Support

For questions or issues:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information
4. Join the community Discord

---

**Happy coding! 🚀**
