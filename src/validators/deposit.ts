import { Buff, Bytes } from '@cmdcode/buff-utils'
import { hash }        from '@cmdcode/crypto-utils'

import {
  ScriptData,
  Signer,
  Tap,
  Tx,
  TxData
} from '@cmdcode/tapscript'

import * as musig from '@cmdcode/musig2'

import {
  ContractSession,
  DepositTemplate,
  Proposal,
  SignerAPI,
  UTXO,
  TapContext,
  DepositContext,
  Payout,
  PayTemplate,
  TxInput,
  AgentData,
  Terms
} from '../types/index.js'

import schema from '../schema/index.js'

import { apply_fees, get_templates } from './proposal.js'

export function validate_deposit (
  proposal : Proposal,
  session  : ContractSession,
  template : DepositTemplate,
) {
  // Validate the proposal.
  schema.proposal.template.parse(proposal)
  // Validate the template.
  schema.deposit.template.parse(template)
  // Unpack some arguments.
  const { deposit_key, nonce_key, refund_key, refund_sig, utxo } = template
  const agent    = session.agent
  const expires  = proposal.terms.schedule.expires
  const pubkeys  = [ deposit_key, agent.pubkey ]
  const nonces   = [ nonce_key, agent.nonce    ]
  const co_ctx   = get_cosign_ctx(pubkeys, refund_key, expires)
  // Convert proposal into an array of templates.
  const tx_paths : Array<[string, TxData]> = get_tx_paths(proposal) 
  for (const [ label, sighash ] of tx_paths) {
    const psig = template.signatures.find(e => e[0] === label)
    if (psig === undefined) {
      throw new Error('No signature provided for path: ' + label)
    }
    const twk_nonces : string[] = get_tweaked_nonces(nonces, sighash)
    const config = { tweaks: [ co_ctx.tweak ] }
    const mu_ctx = musig.get_ctx(pubkeys, twk_nonces, sighash, config)
    if (!musig.verify.psig(mu_ctx, psig)) {
      throw new Error('Partial signature fails validation!')
    }
  }
}

export default {}
