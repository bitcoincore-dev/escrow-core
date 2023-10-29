import { EscrowClient, Signer } from '@scrow/core'

const alice = { signer : Signer.seed('alice') }

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'

const client   = new EscrowClient(alice.signer, { hostname, oracle })

const cid = '2bdf91fb28ab8cad4a4a756f52ce853f4bb9fcadb47fcff9dd8240a8de20e0c4'

const contract = await client.contract.read(cid)

console.log('Contract:', contract.data)
