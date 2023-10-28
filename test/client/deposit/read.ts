import {
  EscrowClient,
  Signer
} from '@scrow/core'

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const deposit_id = 'dc292e2da3066b87d3f1517427b1b71b0ffe0d37e57825a65af5ca2928492df8'

const deposit = await client.deposit.read(deposit_id)

console.log('Deposit data:', deposit)
