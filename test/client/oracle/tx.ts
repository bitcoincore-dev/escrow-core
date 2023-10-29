// c7d8c4b02af2a4edb6d839d855eccd3b1e4e6cb21f4ee9fb9ab738065e8d4d3d

import { EscrowClient, Signer } from '@scrow/core'

const alice = { signer : Signer.seed('alice') }

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'

const client   = new EscrowClient(alice.signer, { hostname, oracle })

const txid = '637682e0e2b8c4aa01cb488fcd8a8941c09ef1eef76b51993242fb1c09cc48e2'

const tx = await client.oracle.get_tx_data(txid)

console.log('tx:', tx)
