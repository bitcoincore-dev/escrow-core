
import {
  EscrowClient,
  Signer
} from '@scrow/core'

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const dpid = '805f2d3047bf92781afede5451804724db90d4cd9dfaad3bd007380f58ee976c'

const contract = await client.covenant.remove(dpid)
const deposit  = await client.deposit.read(dpid)

console.log('Contract data :', contract.data)
console.log('Deposit data  :', deposit.data)
