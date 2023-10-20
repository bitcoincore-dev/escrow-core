import { Buff, Bytes } from '@cmdcode/buff'

export function now () {
  return Math.floor(Date.now() / 1000)
}

export function exists <T> (
  input ?: T | null
  ) : input is NonNullable<T> {
  return (typeof input === 'undefined' || input === null)
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
