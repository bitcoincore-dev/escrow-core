import { EscrowClient, Signer } from '@scrow/core'

const alice = { signer : Signer.seed('alice') }

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'

const client   = new EscrowClient(alice.signer, { hostname, oracle })

const cid = '87116bd6049d0f6ccc3c244402372c1826397c67cfb43bb1445893569a472eef'

const contract = await client.contract.read(cid)

console.log('Contract:', contract.data)
