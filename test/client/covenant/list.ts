import {
  EscrowClient,
  Signer
} from '@scrow/core'

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const cid   = 'f17e0e61946214cffc9f7aa98fa776601409fdf5dc9d907a6438688e98472fdb'
const funds = await client.covenant.list(cid)

console.log('Funds:', funds.map(e => e.data))
