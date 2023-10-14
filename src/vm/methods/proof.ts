import {
  parse_proof,
  verify_proof
} from '@cmdcode/crypto-tools/proof'

import { parse_witness } from '../../lib/witness.js'
import { WitnessEntry }  from '../../types/index.js'

export function proof_v1 (
  params : string[],
  store  : Map<string, any>
) {
  const [ threshold, ...members ] = params
  const thold = Number(threshold)

  return (witness : WitnessEntry) => {
    const { action, args, path, wid } = parse_witness(witness)
    const proofs = args.map(e => String(e))
    for (const proof of proofs) {
      const { pub, ref } = parse_proof(proof)
      if (!members.includes(pub)) {
        throw new Error('[vm/proof_v1] Invalid member:' + pub)
      } else if (ref !== wid) {
        throw new Error('[vm/proof_v1]: Invalid ref:' + ref)
      } else if (!verify_proof(proof, witness.slice(0, 4), { throws : true })) {
        throw new Error('[vm/proof_v1] Invalid proof:' + proof)
      } else {
        increment_map(store, `${path}/${action}`)
      }
    }
    return check_threshold(store, thold)
  }
}

function check_threshold (
  store : Map<string, number>,
  thold : number
) {
  const counts = [ ...store.values() ]
  for (const ct of counts) {
    if (ct >= thold) return true
  }
  return false
}

function increment_map (
  store : Map<string, number>,
  str   : string
) {
  let count = store.get(str)
  if (count === undefined) {
    store.set(str, 1)
  } else {
    store.set(str, count + 1)
  }
}
