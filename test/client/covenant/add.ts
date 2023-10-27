
import {
  EscrowClient,
  Signer
} from '@scrow/core'

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const cid  = '815db82199668676a730011cd0b7be444b1d763817d388415e40195a947caf8f'
const dpid = '5e089834581a1b68e82917fef2d1f195edf82e4c02b856de3fa223be7b628fd3'

let contract = await client.contract.read(cid)

console.log('current balance:', contract.data.balance)

let deposit  = await client.deposit.read(dpid)

console.log('covenant status:', deposit.data.covenant)

contract = await client.covenant.add(contract, deposit)
deposit  = await client.deposit.read(dpid)

console.log('Deposit data  :', deposit.data)
console.log('Contract data :', contract.data)
