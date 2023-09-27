import { Buff, Bytes }  from '@cmdcode/buff'
import { Signer }       from '@cmdcode/signer'
import { hash340 }      from '@cmdcode/crypto-tools/hash'
import { tweak_pubkey } from '@cmdcode/crypto-tools/keys'
import { get_prop_id }  from './proposal.js'
import { sort_bytes }   from './util.js'

import {
  DepositContext,
  ProposalData,
} from '../types/index.js'

export function get_session_id (
  proposal  : ProposalData,
  aux_data ?: Bytes
) {
  const prop_id = get_prop_id(proposal)
  const image : Bytes[] = [ prop_id ]
  if (aux_data !== undefined) image.push(aux_data)
  return hash340('escrow/session_id', ...image).hex
}

export function get_session_key (
  context : DepositContext,
  signer  : Signer
) {
  const session_id = get_session_id(context.proposal)
  return signer.gen_session_nonce(session_id)
}

export function get_session_tweak (
  context : DepositContext,
  pnonces : Bytes[],
  sighash : Bytes
) : Buff {
  const { group_pub } = context
  return hash340 (
    'escrow/session_tweak',
    group_pub,
    sighash,
    ...sort_bytes(pnonces)
  )
}

export function get_session_pnonce (
  key   : Bytes,
  tweak : Bytes
) {
  const pnonces = Buff
    .parse(key, 32, 64)
    .map(k => tweak_pubkey(k, [ tweak ], true))
  return Buff.join(pnonces)
}

export function get_session_pnonces (
  keys  : Bytes[],
  tweak : Bytes
) : Buff[] {
  return keys.map(e => get_session_pnonce(e, tweak))
}
