import { WitnessEntry } from '@scrow/core'
import { get_contract } from '@scrow/core/contract'
import { now }          from '@scrow/core/util'

import {
  parse_contract,
  parse_vm
} from '@scrow/core/parse'

import {
  get_vm,
  eval_stack,
  eval_witness
} from '@scrow/core/vm'

import { get_core } from './core.js'

import cvector from './vectors/contract.json' assert { type : 'json' }
import vgen    from './vectors/gen.vector.js'

// const core   = get_core()
// const client = await core.startup()

// const aliases  = [ 'alice', 'bob', 'carol' ]
// const members  = await vgen.members(client, aliases)
//console.log('members:', members)

// const agent    = await vgen.agent(client)
// // console.log('agent:', agent)

// const proposal = await vgen.proposal(members)
// // console.log('proposal:', proposal)

// const session  = await vgen.session(agent, proposal)
// // console.log('session:', session)

// const deposits = await vgen.deposits(members, proposal, session)
// // console.log('deposits:', deposits)

// const contract = get_contract(deposits, proposal, session)
// console.log('contract:', JSON.stringify(contract, null, 2))

const contract = parse_contract(cvector)

const vm_state = get_vm(contract)

console.log('vm state:', vm_state)

// const witness = await vgen.witness([members[0]], 'dispute', 'payout', '232902f4c4f83157d2e63cf6fa577764d6c37353073d4314da5da855a5402baa', now())

const witness : WitnessEntry = [
  1696228876,
  'dispute',
  'payout',
  '232902f4c4f83157d2e63cf6fa577764d6c37353073d4314da5da855a5402baa',
  '3455555a240a4424c0ac0414993575b56b128d62dd90eaa0e9f15b98bbe3beb99997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be28be94f2d9837ec1efcd05229e1be88da0328418992f38fef28c8a6f7fc2dbfca20126bed40a6acf2e4a9c06b1ee459cd68cf29a8cdbf0d40e8db44a6193bc7ad3efcbde437ac9044ef2293b6d370bbfc09bd95b006061240e041c23bc2557d2'
]

//console.log('witness:', witness)
const result = eval_stack(vm_state, [ witness ], now() + 8000)

console.dir(parse_vm(result), { depth : null })

// await core.shutdown()
