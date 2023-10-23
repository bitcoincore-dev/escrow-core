import {
  OracleTxData,
  OracleTxSpend,
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

export async function lookup_vout (
  host : string,
  txid : string,
  vout : number
) {
  const url = `${host}/api/tx/${txid}/outspend/${vout}`
  const res = await fetch(url)

  if (res.status === 404) return null
  
  const ret = await resolve<OracleTxSpend>(res)

  if (!ret.ok) throw new Error(ret.error)

  await schema.oracle.txspend.parseAsync(ret.data)

  return ret.data
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
