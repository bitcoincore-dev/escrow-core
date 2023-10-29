
import {
  EscrowClient,
  Signer
} from '@scrow/core'

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const cid  = '2bdf91fb28ab8cad4a4a756f52ce853f4bb9fcadb47fcff9dd8240a8de20e0c4'
const dpid = '443ee49066ddef4718faeba298cd43d47b4106092334829f69fd6f2e73b1a643'

let contract = await client.contract.read(cid)

console.log('current balance:', contract.data.balance)

let deposit  = await client.deposit.read(dpid)

console.log('covenant status:', deposit.data.covenant)

contract = await client.covenant.add(contract, deposit)
deposit  = await client.deposit.read(dpid)

console.log('Deposit data  :', deposit.data)
console.log('Contract data :', contract.data)
