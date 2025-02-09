import { Buff }               from '@cmdcode/buff'
import { parse_vm }           from '@scrow/core/parse'
import { get_return_ctx }     from '@scrow/core/return'
import { create_session }     from '@scrow/core/session'
import { now }                from '@scrow/core/util'
import { prevout_to_txspend } from '@scrow/core/tx'
import { get_core }           from './core.js'
import { create_settlment }   from './src/spend.js'

import {
  activate_contract,
  create_contract,
} from '@scrow/core/contract'

import {
  get_deposit_ctx,
  get_spend_state,
  register_deposit
} from '@scrow/core/deposit'

import {
  eval_stack,
  start_vm
} from '@scrow/core/vm'

import {
  verify_deposit,
  validate_proposal,
  verify_proposal,
  validate_covenant,
  verify_covenant,
  validate_witness,
  verify_witness,
  validate_registration
} from '@scrow/core/validate'

import vgen from './src/vectorgen.js'

import * as assert from '@scrow/core/assert'

/* ------------------- [ Init ] ------------------- */

const banner  = (title : string) => `\n=== [ ${title} ] ===`.padEnd(80, '=') + '\n'
const core    = get_core()
const client  = await core.startup()
const aliases = [ 'alice', 'bob', 'carol' ]
const members = await vgen.members(client, aliases)
const agent   = await vgen.agent(client)

/* ------------------- [ Deposit ] ------------------- */

const templates = await vgen.deposits(agent, members)

const promises = templates.map(async tmpl => {
  validate_registration(tmpl)
  const return_ctx = get_return_ctx(tmpl.return_tx)
  const { pubkey, sequence } = return_ctx
  const { txid, vout }       = return_ctx.tx.vin[0]
  const deposit_key = agent.signer.pubkey
  const deposit_ctx = get_deposit_ctx(deposit_key, pubkey, sequence)
  const data = await client.get_txinput(txid, vout)
  assert.exists(data)
  const spendout = prevout_to_txspend(data.txinput)
  verify_deposit(deposit_ctx, return_ctx, spendout)
  const dep_id  = Buff.random(32).hex
  const state   = get_spend_state(sequence, data.status)
  const session = create_session(agent.signer, dep_id)
  const pnonce  = session.record_pn
  return register_deposit(deposit_ctx, dep_id, pnonce, tmpl, spendout, state)
})

const deposits = await Promise.all(promises)

console.log(banner('deposits'))
console.dir(deposits, { depth : null })

/* ------------------- [ Proposal ] ------------------- */

const proposal = await vgen.proposal(members)

validate_proposal(proposal)
verify_proposal(proposal)

console.log(banner('proposal'))
console.dir(proposal, { depth : null })

/* ------------------- [ Contract ] ------------------- */

const cid      = Buff.random().hex
const session  = create_session(agent.signer, cid)
const contract = create_contract(cid, proposal, session)

console.log(banner('contract'))
console.dir(contract, { depth : null })

/* ------------------- [ Funding ] ------------------- */

const funds = await vgen.funds(contract, deposits, members)

funds.forEach(f => {
  validate_covenant(f.covenant)
  const ctx = get_deposit_ctx(f.agent_key, f.deposit_key, f.sequence)
  verify_covenant(ctx, contract, f, agent.signer, agent.signer)
})

console.log(banner('Covenants'))
console.dir(funds.map(e => e.covenant), { depth : null })

/* ------------------ [ Activation ] ------------------ */

const { vm_state, terms } = activate_contract(contract)

console.log(banner('init state'))
console.dir(vm_state, { depth : null })

/* ------------------- [ Evaluation ] ------------------- */

const prog_id = '232902f4c4f83157d2e63cf6fa577764d6c37353073d4314da5da855a5402baa'
const witness = await vgen.witness([members[0]], 'dispute', 'payout', prog_id)

validate_witness(witness)
verify_witness(witness)

console.log(banner('witness'))
console.dir(witness, { depth : null })

const old_state = start_vm(vm_state, terms)
const new_state = eval_stack(old_state, [ witness ], now() + 8000)

console.log(banner('new state'))
console.dir(parse_vm(new_state), { depth : null })

/* ------------------- [ Settlement ] ------------------- */

const { result } = new_state

if (result !== null) {
  const txdata = create_settlment(agent.signer, contract, funds, result)

  console.log(banner('closing tx'))
  console.dir(txdata, { depth : null })

  const txid = await client.publish_tx(txdata, true)

  console.log(banner('txid'))
  console.log(txid)
}

console.log('\n' + '='.repeat(80) + '\n')

await core.shutdown()
