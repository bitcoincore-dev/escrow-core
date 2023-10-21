import { Buff }             from '@cmdcode/buff'
import { create_prevout }   from '@scrow/tapscript/tx'
import { register_deposit } from '@scrow/core/deposit'
import { parse_vm }         from '@scrow/core/parse'
import { get_recovery_ctx } from '@scrow/core/recovery'
import { create_session }   from '@scrow/core/session'
import { create_settlment } from '@scrow/core/spend'
import { now }              from '@scrow/core/util'
import { get_core }         from './core.js'

import {
  activate_contract,
  create_contract,
} from '@scrow/core/contract'

import {
  eval_stack,
  start_vm
} from '@scrow/core/vm'

import {
  validate_deposit,
  verify_deposit,
  validate_proposal,
  verify_proposal,
  validate_covenant,
  verify_covenant,
  validate_witness,
  verify_witness
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
  validate_deposit(tmpl)
  const rec = get_recovery_ctx(tmpl.recovery_tx)
  const { txid, vout } = rec.tx.vin[0]
  const ret = await client.get_txinput(txid, vout)
  assert.exists(ret)
  verify_deposit(agent.signer, tmpl, ret.txinput, rec)
  const id = Buff.random(32).hex
  return register_deposit(id, tmpl, ret.txinput, ret.status)
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
  verify_covenant(contract, f, agent.signer, agent.signer)
})

console.log(banner('Covenants'))
console.dir(funds.map(e => e.covenant), { depth : null })

/* ------------------ [ Activation ] ------------------ */

const { state, terms } = activate_contract(contract)

console.log(banner('init state'))
console.dir(state, { depth : null })

/* ------------------- [ Evaluation ] ------------------- */

const witness = await vgen.witness([members[0]], 'dispute', 'payout', '232902f4c4f83157d2e63cf6fa577764d6c37353073d4314da5da855a5402baa', now())

validate_witness(witness)
verify_witness(witness)

console.log(banner('witness'))
console.dir(witness, { depth : null })

const old_state = start_vm(state, terms)
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
