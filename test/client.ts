import { Buff } from '@cmdcode/buff'

import { EscrowClient, Signer } from '@scrow/core'

const hostname = 'http://localhost:3000'

const secret = Buff.str('alice').digest
const signer = new Signer(secret)

const client = new EscrowClient(hostname, signer)

client.contract.fetch()