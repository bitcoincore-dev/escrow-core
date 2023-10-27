import {
  EscrowClient,
  Signer
} from '@scrow/core'

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const deposit_id = '5e089834581a1b68e82917fef2d1f195edf82e4c02b856de3fa223be7b628fd3'

const deposit = await client.deposit.read(deposit_id)

console.log('Deposit data:', deposit)
