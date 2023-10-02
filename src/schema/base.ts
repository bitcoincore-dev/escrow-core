import { z } from 'zod'

const address    = z.string(),
      bool       = z.boolean(),
      date       = z.date(),
      index      = z.number().max(512),
      num        = z.number(),
      script     = z.string().array(),
      str        = z.string(),
      stamp      = z.number().min(500_000_000),
      value      = z.number().max(Number.MAX_SAFE_INTEGER)

const hex = z.string()
  .regex(/^[0-9a-fA-F]*$/)
  .refine(e => e.length % 2 === 0)

const label     = z.string().regex(/^[0-9a-zA-Z_-]{2,64}$/)
const network   = z.enum([ 'bitcoin', 'testnet', 'regtest' ])
const payment   = z.tuple([ value, address ])
const paypath   = z.tuple([ label, value, address ])

const hash      = hex.refine((e) => e.length === 64)
const pubkey    = hex.refine((e) => e.length === 64  || e.length === 66)
const nonce     = hex.refine((e) => e.length === 128 || e.length === 132)
const psig      = hex.refine((e) => e.length === 192)
const signature = hex.refine((e) => e.length === 128)

const base64    = z.string().regex(/^[a-zA-Z0-9+/]+={0,2}$/)
const base64url = z.string().regex(/^[a-zA-Z0-9\-_]+={0,2}$/)
const bech32    = z.string() // .regex(/^[a-zA-Z0-9\-_]+={0,2}$/)

const proof = z.tuple([
  z.string(), pubkey, hash, signature, stamp
])

const literal = z.union([
  z.string(), z.number(), z.boolean(), z.null()
])

const entry   = z.tuple([ z.string(), literal ])
const record  = z.record(literal.array())
const tags    = literal.array()
const prevout = z.object({ value, script })

export {
  address,
  base64,
  base64url,
  bech32,
  bool,
  date,
  entry,
  hash,
  hex,
  index,
  literal,
  label,
  network,
  nonce,
  num,
  paypath,
  payment,
  prevout,
  proof,
  psig,
  pubkey,
  record,
  script,
  signature,
  str,
  tags,
  stamp,
  value
}
