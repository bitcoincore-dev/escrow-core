import {
  EscrowClient,
  Signer
} from '@scrow/core'

import ctx from '../ctx.js'

const hostname = ctx.escrow
const oracle   = ctx.oracle
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const info = ctx.acct
const txid = ctx.txid

const { agent_id, agent_key, sequence } = info

const tmpl = await client.deposit.create(agent_id, agent_key, sequence, txid, { network : 'testnet'})

console.log('Deposit template:', tmpl)

const deposit = await client.deposit.register(tmpl)

console.log('Deposit data:', deposit)
