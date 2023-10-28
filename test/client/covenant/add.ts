
import {
  EscrowClient,
  Signer
} from '@scrow/core'

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const cid  = 'f17e0e61946214cffc9f7aa98fa776601409fdf5dc9d907a6438688e98472fdb'
const dpid = 'dc292e2da3066b87d3f1517427b1b71b0ffe0d37e57825a65af5ca2928492df8'

let contract = await client.contract.read(cid)

console.log('current balance:', contract.data.balance)

let deposit  = await client.deposit.read(dpid)

console.log('covenant status:', deposit.data.covenant)

contract = await client.covenant.add(contract, deposit)
deposit  = await client.deposit.read(dpid)

console.log('Deposit data  :', deposit.data)
console.log('Contract data :', contract.data)
