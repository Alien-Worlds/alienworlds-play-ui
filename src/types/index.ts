// Global Types
export interface AppConfig {
  environment: 'development' | 'staging' | 'production'
  apiEndpoint: string
  chainIds: {
    wax: string
    bsc: string
    eth: string
  }
}

// Blockchain Types
export interface WalletConnection {
  type: 'wax' | 'bsc' | 'eth' | 'coinbase'
  address: string
  isConnected: boolean
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  error?: string
  status: number
}

// State Management Types
export interface AppState {
  wallet: WalletConnection
  theme: 'light' | 'dark'
  loading: boolean
}

// Component Props Types
export interface BaseProps {
  className?: string
  style?: React.CSSProperties
}

// Game Specific Types
export interface GameAsset {
  id: string
  name: string
  type: 'nft' | 'token'
  metadata: Record<string, unknown>
}

// Form Types
export interface FormField<T = string> {
  value: T
  error?: string
  touched: boolean
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
