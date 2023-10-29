
import {
  EscrowClient,
  Signer
} from '@scrow/core'

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const cid  = '87116bd6049d0f6ccc3c244402372c1826397c67cfb43bb1445893569a472eef'
const dpid = '9f1b1cb6641ed07ee28e5ea2de19161072262c96201c93c545f3c06747c64e4c'

let contract = await client.contract.read(cid)

console.log('current balance:', contract.data.balance)

let deposit  = await client.deposit.read(dpid)

console.log('covenant status:', deposit.data.covenant)

contract = await client.covenant.add(contract, deposit)
deposit  = await client.deposit.read(dpid)

console.log('Deposit data  :', deposit.data)
console.log('Contract data :', contract.data)
