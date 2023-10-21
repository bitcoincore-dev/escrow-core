import { assert, Buff, Bytes } from '@cmdcode/buff'
import { Network }     from '@scrow/tapscript'

export function ok (
  value    : unknown,
  message ?: string
) : asserts value {
  if (value === false) {
    throw new Error(message ?? 'Assertion failed!')
  }
}

export function is_hash (hash : string) : void {
  assert.is_hex(hash)
  if (hash.length !== 64) {
    throw new TypeError(`Value is incorrect length: ${hash.length}`)
  }
}

export function size (input : Bytes, size : number) : void {
  const bytes = Buff.bytes(input)
  if (bytes.length !== size) {
    throw new Error(`Invalid input size: ${bytes.hex} !== ${size}`)
  }
}

export function exists <T> (
  input ?: T | null
  ) : asserts input is NonNullable<T> {
  if (typeof input === 'undefined' || input === null) {
    throw new Error('Input is null or undefined!')
  }
}

export function min_value (
  bytes : Bytes,
  min   : bigint
) : void {
  const val = Buff.bytes(bytes).big
  if (val < min) {
    throw new TypeError(`Bytes integer value is too low: ${val} < ${min}`)
  }
}

export function valid_pubkey (pubkey : unknown) {
  try {
    size(pubkey as Bytes, 32)
  }
  catch {
    throw new Error('Invalid pubkey: ' + String(pubkey))
  }
}

export function valid_address (
  address : string,
  network : Network
) {
  const base58 = /^[123mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/
  const bech32 = /^(bc|tb|bcrt)1([ac-hj-np-z02-9]{39,59})$/

  if (base58.test(address)) {
    throw new Error('Legacy address types are not supported!')
  }

  if (!bech32.test(address)) {
    throw new Error('Invalid address format: ' + address)
  }

  if (
    (network === 'main'    && !address.startsWith('bc')) ||
    (network === 'testnet' && !address.startsWith('tb')) ||
    (network === 'regtest' && !address.startsWith('bcrt'))
  ) {
    throw new Error(`Address does not match "${network}" network: ${address}`)
  }
}
