import {
  OracleSpendData,
  OracleSpendState,
  OracleTxData,
  Resolver
} from '@/types/index.js'

import * as schema from '@/schema/index.js'

export async function lookup_tx (
  host : string,
  txid : string,
) : Promise<OracleTxData | null> {
  const url = `${host}/api/tx/${txid}`
  const res = await fetch(url)

  if (res.status === 404) return null

  const ret = await resolve<OracleTxData>(res)

  if (!ret.ok) throw new Error(ret.error)

  await schema.oracle.txdata.parseAsync(ret.data)

  return ret.data
}

export async function get_spend_state (
  host : string,
  txid : string,
  vout : number
) : Promise<OracleSpendState | null> {
  const url = `${host}/api/tx/${txid}/outspend/${vout}`
  const res = await fetch(url)

  if (res.status === 404) return null
  
  const ret = await resolve<OracleSpendState>(res)

  if (!ret.ok) throw new Error(ret.error)

  await schema.oracle.txspend.parseAsync(ret.data)

  return ret.data
}

export async function get_spend_data (
  host : string,
  txid : string,
  vout : number
) : Promise<OracleSpendData | null> {
  
  const tx = await lookup_tx(host, txid)

  if (tx === null) return null

  const txout = tx.vout.at(vout)

  if (txout === undefined) return null

  const state = await get_spend_state(host, txid, vout)

  if (state === null) return null
  
  const spendout = {
    txid,
    vout,
    value     : txout.value,
    scriptkey : txout.scriptpubkey
  }

  return { txout : spendout, status: tx.status, state }
}

export async function resolve <T> (
  res : Response
) : Promise<Resolver<T>> {
  try {
    const json = await res.json()
    return res.ok
      ? { ok : true,  data  : json as T  }
      : { ok : false, error : json.error }
  } catch {
    return { ok : false, error : `${res.status}: ${res.statusText}` }
  }
}
