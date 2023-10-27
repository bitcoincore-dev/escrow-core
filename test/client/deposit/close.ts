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

const deposit_id = 'f1de92b6ee39424865b6105c1d7871d3c5cf802302ddb8214e98009fa83e4d8d'

const address = await wallet.new_address
const deposit = await client.deposit.read(deposit_id)
const closed  = await client.deposit.close(address, deposit)

console.log('Deposit data:', closed)
