import {
  EscrowClient,
  Signer
} from '@scrow/core'

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const cid    = '51c6220df0cc2dc6de80f55c07b5d129a0756f79146828a386b437cbf6ac2003'
const status = await client.covenant.status(cid)

console.log('Covenant status:', status)
