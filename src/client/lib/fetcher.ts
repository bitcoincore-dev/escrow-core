import { ApiResponse, Json } from '@/types/index.js'

export function get_fetcher (
  fetcher : typeof fetch
) {
  return async <T> (
    input : RequestInfo | URL, 
    init ?: RequestInit | undefined
  ) => {
    const res = await fetcher(input, init)
    return handler<T>(res)
  }
}

async function handler<T = Json> (
  res : Response
) : Promise<ApiResponse<T>> {
  // Unpack response object.
  const { ok, status, statusText } = res
  // If initial response fails:
  if (!ok) {
    // Check if there is a JSON payload.
    try {
      const error = await res.json()
      return { ok, error }
    } catch {
      // Else, return the status as error.
      const error = `[${status}]: ${statusText}`
      return { ok, error }
    }
  }
  // Unpack the json response.
  const { data, error } = await res.json()
  // If an err object is present:
  if (error !== undefined) {
    // Return the error as response.
    return { ok: false, error }
  } else {
    // Return the data as generic type.
    return { ok, data: data as T }
  }
}
