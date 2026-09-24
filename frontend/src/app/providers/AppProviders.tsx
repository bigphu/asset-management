import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider as ReduxProvider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from '@/app/store'
import { queryClient } from '@/lib/queryClient'
import { ToastProvider } from '@/components/ui/Toast'

/**
 * Every app-wide provider lives here, composed in one place so `App.tsx`
 * stays a plain layout/router mount. Order matters only if a provider below
 * ever needs to read from one above it — keep Redux and Query siblings.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </ToastProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ReduxProvider>
  )
}
