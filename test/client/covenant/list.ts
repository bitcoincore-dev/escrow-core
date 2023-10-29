import {
  EscrowClient,
  Signer
} from '@scrow/core'

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const cid   = '2bdf91fb28ab8cad4a4a756f52ce853f4bb9fcadb47fcff9dd8240a8de20e0c4'
const funds = await client.covenant.list(cid)

console.log('Funds:', funds.map(e => e.data))
