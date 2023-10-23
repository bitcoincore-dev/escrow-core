import { resolve } from '@/lib/util.js'

import {
  OracleTxData,
  OracleTxSpend
} from '@/types/index.js'

import * as schema from '@/schema/index.js'

export async function lookup_tx (
  host : string,
  txid : string,
) : Promise<OracleTxData | null> {
  const url = `${host}/api/tx/${txid}`
  const res = await fetch(url)

  if (res.status === 404) return null

  const chk = schema.oracle.txdata
  const ret = await resolve<OracleTxData>(res, chk)

  if (!ret.ok) throw ret.error

  return ret.data
}

export async function lookup_txout (
  host : string,
  txid : string,
  vout : number
) {
  const url = `${host}/tx/${txid}/outspent/${vout}`
  const res = await fetch(url)

  if (res.status === 404) return null
  
  const chk = schema.oracle.txspend
  const ret = await resolve<OracleTxSpend>(res, chk)

  if (!ret.ok) throw ret.error

  return ret.data
}
