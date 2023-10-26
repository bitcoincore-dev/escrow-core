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

const deposit_id = '6e2a8b55a17d4dc44cd9db1c58886edb68a942566069626f6df276bd1db06fd4'

const address = await wallet.new_address
const deposit = await client.deposit.read(deposit_id)
console.log('id:', deposit.data.deposit_id)
const closed  = await client.deposit.close(address, deposit)

console.log('Deposit data:', closed)
