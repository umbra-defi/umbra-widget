import { QueryClient, keepPreviousData } from '@tanstack/react-query'

/** Mirrors umbra-web's QueryProvider config. */
export function createWidgetQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData
      }
    }
  })
}
