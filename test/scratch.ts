import { now }      from '@scrow/core/util'
import { parse_vm } from '@scrow/core/parse'

import {
  activate_contract,
  create_contract,
  close_contract
} from '@scrow/core/contract'

import {
  eval_stack,
  start_vm
} from '@scrow/core/vm'

import { get_core } from './core.js'

// import cvector from './vectors/contract.json' assert { type : 'json' }

import vgen    from './vectors/gen.vector.js'

const banner = (title : string) => `\n=== [ ${title} ] ===`.padEnd(80, '=') + '\n'

const core   = get_core()
const client = await core.startup()

const aliases  = [ 'alice', 'bob', 'carol' ]
const members  = await vgen.members(client, aliases)
const agent    = await vgen.agent(client)
const proposal = await vgen.proposal(members)

console.log(banner('proposal'))
console.dir(proposal, { depth : null })

const deposits = await vgen.deposits(agent, members)

console.log(banner('deposits'))
console.dir(deposits, { depth : null })

const contract = create_contract(agent.signer, proposal)

console.log(banner('contract'))
console.dir(contract, { depth : null })

const covenants = await vgen.covenant(contract, deposits, members)

console.log(banner('covenants'))
console.dir(covenants, { depth : null })

contract.covenants = covenants

const { state, terms } = activate_contract(contract)

console.log(banner('init state'))
console.dir(state, { depth : null })

const witness = await vgen.witness([members[0]], 'dispute', 'payout', '232902f4c4f83157d2e63cf6fa577764d6c37353073d4314da5da855a5402baa', now())

console.log(banner('witness'))
console.dir(witness, { depth : null })

const vm_state = start_vm(state, terms)

const new_state = eval_stack(vm_state, [ witness ], now() + 8000)

console.log(banner('final state'))
console.dir(parse_vm(new_state), { depth : null })

const { result } = new_state

if (result !== null) {
  const txdata = close_contract(agent.signer, contract, result, )

  console.log(banner('closing tx'))
  console.dir(txdata, { depth : null })

  const txid = await client.publish_tx(txdata, true)

  console.log(banner('txid'))
  console.log(txid)
}

console.log('\n' + '='.repeat(80) + '\n')

await core.shutdown()
