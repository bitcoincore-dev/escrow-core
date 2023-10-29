import { create_witness } from '@/lib/witness.js'
import { EscrowClient, Signer } from '@scrow/core'

const alice = { signer : Signer.seed('carol') }

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'

const client   = new EscrowClient(alice.signer, { hostname, oracle })

const programs = [
  [ 'dispute', 'payout',  'proof', 1, '9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be' ],
  [ 'resolve', '*',       'proof', 1, '9094567ba7245794198952f68e5723ac5866ad2f67dd97223db40e14c15b092e' ],
  [ 'close|resolve', '*', 'proof', 2, '9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be', '4edfcf9dfe6c0b5c83d1ab3f78d1b39a46ebac6798e08e19761f5ed89ec83c10' ]
]

const cid   = '51c6220df0cc2dc6de80f55c07b5d129a0756f79146828a386b437cbf6ac2003'
const entry = create_witness('resolve', 'payout', client.signer, { programs })

console.log('Witness entry:', entry)

const witness = await client.witness.submit(cid, entry)

console.log('Witness data:', witness)
