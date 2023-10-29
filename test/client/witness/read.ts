import { EscrowClient, Signer } from '@scrow/core'

const alice = { signer : Signer.seed('alice') }

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'

const client   = new EscrowClient(alice.signer, { hostname, oracle })

const wid = '51c6220df0cc2dc6de80f55c07b5d129a0756f79146828a386b437cbf6ac2003'

const witness = await client.witness.read(wid)

console.log('Witness:', witness)
