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

await cli.mine_blocks(1)

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'
const signer   = Signer.seed('alice')

const client   = new EscrowClient(signer, { hostname, oracle })
const pubkey   = signer.pubkey

const info = await client.deposit.request({ pubkey })

console.log('Deposit Info:', info)

const { address, agent_id, agent_key, sequence } = info

await wallet.ensure_funds(1_000_000)

const txid = await wallet.send_funds(60_000, address)

console.log('Deposit txid:', txid)

const cid = '87116bd6049d0f6ccc3c244402372c1826397c67cfb43bb1445893569a472eef'

const tmpl = await client.deposit.create(agent_id, agent_key, sequence, txid, { cid })

console.log('Deposit template:', tmpl)

const deposit = await client.deposit.register(tmpl)

console.log('Deposit data:', deposit)
