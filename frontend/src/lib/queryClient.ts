import { QueryClient } from '@tanstack/react-query'

/**
 * Single QueryClient for the app. Server state (assets, export profiles)
 * lives here; client/UI-only state (filters, drawer open/closed, selection)
 * lives in Redux instead — see `app/store`.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
