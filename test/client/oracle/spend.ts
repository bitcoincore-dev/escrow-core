// c7d8c4b02af2a4edb6d839d855eccd3b1e4e6cb21f4ee9fb9ab738065e8d4d3d

import { EscrowClient, Signer } from '@scrow/core'

const alice = { signer : Signer.seed('alice') }

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'

const client   = new EscrowClient(alice.signer, { hostname, oracle })

const txid = 'c7d8c4b02af2a4edb6d839d855eccd3b1e4e6cb21f4ee9fb9ab738065e8d4d3d'
const addr = 'bcrt1pzdrwdqsz762raszpfe8060jfk5wxkd6lg2rc5p03sxy554zuqeds7yghyz'

const tx = await client.oracle.get_spend_out({ txid,  address : addr })

console.log('tx:', tx)
