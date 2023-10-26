import { CoreDaemon } from '@cmdcode/core-cmd'

import {
  EscrowClient,
  Signer
} from '@scrow/core'

const core = new CoreDaemon({
  debug   : false,
  verbose : false
})

const cli      = await core.startup() 
const wallet   = await cli.load_wallet('alice')

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'
const signer   = Signer.seed('alice')

const client   = new EscrowClient(signer, { hostname, oracle })
const pubkey   = signer.pubkey

const { address, agent_id, agent_key, sequence } = await client.deposit.request({ pubkey })

await wallet.ensure_funds(100_000)
const txid = await wallet.send_funds(100_000, address, true)

const tmpl = await client.deposit.create(agent_id, agent_key, sequence, txid)

const deposit = await client.deposit.register(tmpl)

console.log('deposit:', deposit)
