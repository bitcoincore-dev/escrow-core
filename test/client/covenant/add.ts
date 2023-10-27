
import {
  EscrowClient,
  Signer
} from '@scrow/core'

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const cid  = ''
const dpid = '6e2a8b55a17d4dc44cd9db1c58886edb68a942566069626f6df276bd1db06fd4'

let contract = await client.contract.read(cid)
let deposit  = await client.deposit.read(dpid)

console.log('old balance:', contract.data.balance)

contract = await client.covenant.add(contract, deposit)
deposit  = await client.deposit.read(dpid)

console.log('Covenant data:', deposit.data.covenant)
console.log('new balance:', contract.data.balance)
