import { Buff, Bytes }  from '@cmdcode/buff'
import { TxFullInput }  from '@scrow/tapscript'
import { parse_script } from '@scrow/tapscript/script'
import { tap_pubkey }   from '@scrow/tapscript/tapkey'
import { hash340 }      from '@cmdcode/crypto-tools/hash'
import { tweak_pubkey } from '@cmdcode/crypto-tools/keys'
import { sort_bytes }   from './util.js'

import { get_path_templates } from '@/lib/proposal.js'

import {
  create_ctx,
  get_nonce_ctx,
  get_key_ctx,
  tweak_key_ctx
} from '@cmdcode/musig2'

import {
  get_refund_script,
  get_sighash
} from '@/lib/tx.js'

import {
  AgentData,
  DepositContext,
  PathTemplate,
  ProposalData,
  SessionContext
} from '@/types/index.js'

export function get_deposit_ctx (
  agent      : AgentData,
  proposal   : ProposalData,
  refund_pub : Bytes,
  txinput    : TxFullInput,
) : DepositContext {
  const fees         = [ ...proposal.fees, ...agent.fees ]
  const deposit_pub  = get_deposit_key(txinput)
  const timelock     = get_deposit_timelock(agent, proposal)
  const signing_pubs = [ deposit_pub, agent.signing_key ]
  const script       = get_refund_script(refund_pub, timelock)
  const int_data     = get_key_ctx(signing_pubs)
  const tap_data     = tap_pubkey(int_data.group_pubkey, { script })
  const key_data     = tweak_key_ctx(int_data, [ tap_data.taptweak ])
  const templates    = get_path_templates(proposal.paths, fees)
  const sighashes    = get_sighashes(templates, txinput)

  return {
    agent,
    key_data,
    proposal,
    sighashes,
    signing_pubs,
    tap_data,
    templates,
    timelock,
    txinput
  }
}

export function get_session_ctx (
  deposit_ctx  : DepositContext,
  message      : Bytes,
  session_pubs : Bytes[]
) : SessionContext {
  const { key_data, sighashes } = deposit_ctx
  const group_pub   = key_data.group_pubkey
  const nonce_tweak = get_session_tweak(deposit_ctx, session_pubs, message)
  const pub_nonces  = tweak_session_pubs(session_pubs, nonce_tweak)
  const nonce_ctx   = get_nonce_ctx(pub_nonces, group_pub, message)
  const musig_ctx   = create_ctx(key_data, nonce_ctx)
  return { musig_ctx, nonce_tweak, sighashes }
}

export function get_sighashes (
  templates : PathTemplate[],
  txdeposit : TxFullInput
) {
  return templates
    .map(e => get_sighash(txdeposit, e[1]).hex)
    .sort()
}

export function get_deposit_key (
  txinput : TxFullInput
) : Buff {
  const { scriptPubKey } = txinput.prevout
  const { key } = parse_script(scriptPubKey)
  if (key === undefined) {
    throw new Error('Script key is undefined!')
  }
  return key
}

function get_deposit_timelock (
  agent    : AgentData,
  proposal : ProposalData
) {
  const current = Math.floor(Date.now() / 1000)
  const created = agent.created_at
  const expires = proposal.schedule.expires
  const delta   = (created + expires) - current
  return delta << 9
}

export function get_session_tweak (
  deposit_ctx  : DepositContext,
  session_pubs : Bytes[],
  message      : Bytes
) {
  const { key_data, sighashes } = deposit_ctx
  const key_commits = sort_bytes(session_pubs)
  const sig_commits = sort_bytes(sighashes)
  return hash340 (
    'musig/session_tweak',
    key_data.group_pubkey,
    ...key_commits,
    ...sig_commits,
    message
  )
}

export function tweak_session_pubs (
  session_keys  : Bytes[],
  session_tweak : Bytes
) : Buff[] {
  return session_keys.map(e => {
    const sn = Buff
      .parse(e, 32, 64)
      .map(k => tweak_pubkey(k, [ session_tweak ]))
    return Buff.join(sn)
  })
}
