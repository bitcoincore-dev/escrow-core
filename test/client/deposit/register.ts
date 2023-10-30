import {
  EscrowClient,
  Signer
} from '@scrow/core'

import ctx from '../ctx.js'

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const info = ctx.acct
const txid = ctx.txid

const { agent_id, agent_key, sequence } = info

const tmpl = await client.deposit.create(agent_id, agent_key, sequence, txid)

console.log('Deposit template:', tmpl)

const deposit = await client.deposit.register(tmpl)

console.log('Deposit data:', deposit)
