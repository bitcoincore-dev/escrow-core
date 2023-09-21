import { Signer }          from '@cmdcode/signer'
import { get_pubkey }      from '@cmdcode/crypto-tools/keys'
import { get_deposit_ctx } from '@cmdcode/escrow-core/context'

import vectors from './src/vectors/pass.vectors.json' assert { type : 'json' }

const { agent, deposits, proposal } = vectors[0]

const { secret_key } = deposits[0]

const agent_pub   = get_pubkey(agent.secret_key, true)
const deposit_pub = get_pubkey(secret_key, true)
const signer      = new Signer(secret_key)
const context     = get_deposit_ctx(agent, proposal, deposit_pub)
const { group_pub, prop_id } = context
const pnonce      = signer.gen_session_nonce(group_pub, prop_id) 

console.log('agent_pub:', agent_pub.hex)
console.log('deposit_pub:', deposit_pub.hex)
console.log('agent pnonce:', pnonce.hex)
// console.log('context:', context)

//         [ "refund", 90000, "bcrt1qdyyvyjg4nfxqsaqm2htzjgp9j35y4ppfk66qp9" ]