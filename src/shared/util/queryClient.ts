import { QueryClient } from '@tanstack/react-query'
import { config } from 'shared/util/config'

// The app's React Query client. Lives outside index.tsx so non-component code (analytics) can read
// the cache without importing the app entry point.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: config.IsProduction,
    },
  },
})
