
import {
  EscrowClient,
  Signer
} from '@scrow/core'

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const dpid = '9f1b1cb6641ed07ee28e5ea2de19161072262c96201c93c545f3c06747c64e4c'

const contract = await client.covenant.remove(dpid)
const deposit  = await client.deposit.read(dpid)

console.log('Contract data :', contract.data)
console.log('Deposit data  :', deposit.data)
