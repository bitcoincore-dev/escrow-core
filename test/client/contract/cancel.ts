import { EscrowClient, Signer } from '@scrow/core'

const alice = { signer : Signer.seed('alice') }

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'

const client   = new EscrowClient(alice.signer, { hostname, oracle })

const cid = '092ab5209f836797612f60533b2f6ef8725864993cc82d727d295b7a87acb74d'

const contract = await client.contract.cancel(cid)

console.log('Contract:', contract)
