import { EscrowClient, Signer } from '@scrow/core'

const alice = { signer : Signer.seed('alice') }

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'

const client   = new EscrowClient(alice.signer, { hostname, oracle })

const cid = 'c3ce41450f2facb418e4657ad667e2d3767ac7e1ce551d8d984c0241051513ad'

const contract = await client.contract.cancel(cid)

console.log('Contract:', contract)
