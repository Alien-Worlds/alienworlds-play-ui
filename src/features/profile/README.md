# Profile Feature

A comprehensive profile management system for the Alien Worlds game UI. This feature handles user account information, balances, rewards, and claims.

## 🏗️ Architecture

The profile feature follows a modular, component-based architecture with clear separation of concerns:

```
src/features/profile/
├── components/          # UI Components
│   ├── ui/              # Reusable UI components
│   ├── sections/        # Feature-specific sections
│   └── layout/          # Layout components
├── hooks/               # Custom React hooks
├── types/               # TypeScript definitions
├── constants/           # Configuration and constants
├── utils/               # Utility functions
├── services/            # Business logic and API calls
├── context/             # React context providers
└── pages/               # Page components
```

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

The profile feature uses a consistent design system with predefined constants:

```tsx
import { PROFILE_CONSTANTS, UI_CONSTANTS } from 'features/profile/constants/profile.constants'

// Avatar sizes
const avatarSize = PROFILE_CONSTANTS.AVATAR_SIZES.MEDIUM

// Colors
const primaryColor = UI_CONSTANTS.COLORS.PRIMARY

// Spacing
const padding = UI_CONSTANTS.SPACING.MD
```

## 🧪 Testing

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
import { renderHook } from '@testing-library/react-hooks'
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
