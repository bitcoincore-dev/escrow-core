
import {
  EscrowClient,
  Signer
} from '@scrow/core'

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const cid  = '6b19f988018cdcfa51849b8eeeaac8c2e28a837bfe799ec0245ba670d9cb76d7'
const dpid = '805f2d3047bf92781afede5451804724db90d4cd9dfaad3bd007380f58ee976c'

let contract = await client.contract.read(cid)

console.log('current balance:', contract.data.balance)

let deposit  = await client.deposit.read(dpid)

console.log('covenant status:', deposit.data.covenant)

contract = await client.covenant.add(contract, deposit)
deposit  = await client.deposit.read(dpid)

console.log('Deposit data  :', deposit.data)
console.log('Contract data :', contract.data)
