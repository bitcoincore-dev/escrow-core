export type Literal = string | number | boolean | null
export type Json    = Literal | { [key : string] : Json } | Json[]

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

interface ApiSuccess<T> {
  ok     : true,
  data   : T
  error ?: string
}

interface ApiFailure {
  ok    : false
  data ?: any
  error : string
}

export type Resolver<T = Json> = ResolveTrue<T> | ResolveFalse

interface ResolveTrue<T> {
  ok     : true
  data   : T
}

interface ResolveFalse {
  ok    : false
  error : string
}
