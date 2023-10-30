import { EscrowClient, Signer } from '@scrow/core'

import ctx from '../ctx.js'

const alice = { signer : Signer.seed('alice') }

const hostname = ctx.escrow
const oracle   = ctx.oracle

const client   = new EscrowClient(alice.signer, { hostname, oracle })

const wid = ctx.wid

const witness = await client.witness.read(wid)

console.log('Witness:', witness)
