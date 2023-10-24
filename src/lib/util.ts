import { Buff, Bytes } from '@cmdcode/buff'

export function exists <T> (
  input ?: T | null
  ) : input is NonNullable<T> {
  if (typeof input === 'undefined' || input === null) {
    return false
  }
  return true
}

export function fail (
  error  : string,
  throws = false
) : boolean {
  if (!throws) return false
  throw new Error(error)
}

export function get_entry <T = string[]> (
  label   : string,
  entries : [ string, T ][]
) : T {
  const ent = entries.find(e => e[0] === label)
  if (ent === undefined) {
    throw new Error('Entry not found for label: ' + label)
  }
  return ent[1]
}

export function is_hex (
  input : string
) : boolean {
  if (
    typeof input === 'string'            &&
    input.match(/[^a-fA-f0-9]/) === null &&
    input.length % 2 === 0
  ) { return true }
  return false
}

export function is_hash (
  input : string
) : boolean {
  if (is_hex(input) && input.length === 64) {
    return true
  }
  return false
}

export function now () {
  return Math.floor(Date.now() / 1000)
}

export function regex (
  input   : string,
  pattern : string
) {
  if (pattern === '*') {
    return true
  } else {
    return new RegExp(pattern).test(input)
  }
}

export function sort_bytes (
  bytes : Bytes[]
) : string[] {
  return bytes.map(e => Buff.bytes(e).hex).sort()
}

export function stringify (content : any) : string {
  switch (typeof content) {
    case 'object':
      return JSON.stringify(content)
    case 'string':
      return content
    case 'bigint':
      return content.toString()
    case 'number':
      return content.toString()
    case 'boolean':
      return String(content)
    default:
      throw new TypeError('Content type not supported: ' + typeof content)
  }
}
