import { EscrowClient, Signer } from '@scrow/core'

const alice = { signer : Signer.seed('alice') }

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'

const client   = new EscrowClient(alice.signer, { hostname, oracle })

const cid = 'f17e0e61946214cffc9f7aa98fa776601409fdf5dc9d907a6438688e98472fdb'

const contract = await client.contract.read(cid)

console.log('Contract:', contract.data)
