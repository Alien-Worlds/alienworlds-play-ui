import { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/** A fresh QueryClient (no retries, no logging) and a wrapper for renderHook. */
export const createQueryWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
    logger: { log: () => {}, warn: () => {}, error: () => {} },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}
