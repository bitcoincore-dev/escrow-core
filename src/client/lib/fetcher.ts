import { resolve } from '@/lib/oracle.js'

export function get_fetcher (
  fetcher : typeof fetch
) {
  return async <T> (
    input : RequestInfo | URL, 
    init ?: RequestInit | undefined
  ) => {
    const res = await fetcher(input, init)
    return resolve<T>(res)
  }
}
