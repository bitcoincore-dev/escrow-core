import { EscrowClient, Signer } from '@scrow/core'

const alice = { signer : Signer.seed('alice') }

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'

const client   = new EscrowClient(alice.signer, { hostname, oracle })

const cid = '6aff0a4f6607cb3d6521256355148a5eb9c6808ee218b2fc97917f9d117e518f'

const contract = await client.contract.read(cid)

console.log('Contract:', contract)
