import { Buff }             from '@cmdcode/buff'
import { init_deposit }     from '@scrow/core/deposit'
import { parse_vm }         from '@scrow/core/parse'
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

/* ------------------- [ Init ] ------------------- */

const banner  = (title : string) => `\n=== [ ${title} ] ===`.padEnd(80, '=') + '\n'
const core    = get_core()
const client  = await core.startup()
const aliases = [ 'alice', 'bob', 'carol' ]
const members = await vgen.members(client, aliases)
const agent   = await vgen.agent(client)

/* ------------------- [ Deposit ] ------------------- */

const templates = await vgen.deposits(agent, members)

const deposits = templates.map(tmpl => {
  validate_deposit(tmpl)
  verify_deposit(agent.signer, tmpl)
  return init_deposit(tmpl)
})

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

console.log(banner('funds'))
console.dir(funds, { depth : null })

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
