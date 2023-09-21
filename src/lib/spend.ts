import { Signer }        from '@cmdcode/signer'
import { combine_psigs } from '@cmdcode/musig2'
import { verify_sig }    from '@cmdcode/crypto-tools/signer'
import { TxPrevout }     from '@scrow/tapscript'
import { create_tx }     from '@scrow/tapscript/tx'
import { get_sighash }   from './tx.js'

import {
  create_deposit_psig,
  get_deposit_nonce,
  get_deposit_psig
} from './deposit.js'

import {
  get_deposit_ctx,
  get_session_ctx
} from './context.js'

import {
  get_path_templates,
  get_path_vout
} from './proposal.js'

import {
  AgentData,
  DepositContext,
  DepositData,
  ProposalData
} from '@/types/index.js'

export function create_signed_txinput (
  context  : DepositContext,
  deposit  : DepositData,
  pathname : string,
  signer   : Signer
) : TxPrevout {
  const { agent, key_data, templates }  = context
  const { psigs, session_pub, txinput } = deposit
  const pnonces = [ session_pub, agent.session_pub ]
  const psig_d  = get_deposit_psig(psigs, pathname)
  const sighash = get_sighash(pathname, templates, txinput)
  const session = get_session_ctx(context, pnonces, sighash)
  const psig_a  = create_deposit_psig(session, signer)
  const musig   = combine_psigs(session.ctx, [ psig_d, psig_a ])
  verify_sig(musig, sighash, key_data.group_pubkey, { throws : true })
  return { ...txinput, witness : [ musig.append(0x81) ] }
}

export function create_signed_tx (
  agent    : AgentData,
  deposits : DepositData[],
  pathname : string,
  proposal : ProposalData,
  signer   : Signer,
) {
  const vin  : TxPrevout[] = []
  const tmpl = get_path_templates(agent, proposal)
  const vout = get_path_vout(pathname, tmpl)
  for (const deposit of deposits) {
    const { deposit_pub } = deposit
    const ctx  = get_deposit_ctx(agent, proposal, deposit_pub)
    get_deposit_nonce(ctx, signer)
    const txin = create_signed_txinput(ctx, deposit, pathname, signer)
    vin.push(txin)
  }
  return create_tx({ vin, vout })
}
