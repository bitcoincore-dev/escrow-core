import { EscrowClient, Signer } from '@scrow/core'

const alice = { signer : Signer.seed('alice') }

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'

const client   = new EscrowClient(alice.signer, { hostname, oracle })

const cid = 'b063c55cc021b110d1a046c995c2dd6cf48a59b63f161ccb3615cb9e68aa6ff7'

const contract = await client.contract.read(cid)

console.log('Contract:', contract)
