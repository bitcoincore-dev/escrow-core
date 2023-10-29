
import {
  EscrowClient,
  Signer
} from '@scrow/core'

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const dpid = '443ee49066ddef4718faeba298cd43d47b4106092334829f69fd6f2e73b1a643'

const contract = await client.covenant.remove(dpid)
const deposit  = await client.deposit.read(dpid)

console.log('Contract data :', contract.data)
console.log('Deposit data  :', deposit.data)
