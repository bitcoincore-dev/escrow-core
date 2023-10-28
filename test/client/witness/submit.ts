import { create_witness } from '@/lib/witness.js'
import { EscrowClient, Signer } from '@scrow/core'

const alice = { signer : Signer.seed('alice') }

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'

const client   = new EscrowClient(alice.signer, { hostname, oracle })

const programs = [
  [ 'dispute', 'payout',  'proof', 1, '9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be' ],
  [ 'resolve', '*',       'proof', 1, '9094567ba7245794198952f68e5723ac5866ad2f67dd97223db40e14c15b092e' ],
  [ 'close|resolve', '*', 'proof', 2, '9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be', '4edfcf9dfe6c0b5c83d1ab3f78d1b39a46ebac6798e08e19761f5ed89ec83c10' ]
]

const cid   = 'f17e0e61946214cffc9f7aa98fa776601409fdf5dc9d907a6438688e98472fdb'
const entry = create_witness('dispute', 'payout', client.signer, { programs })

console.log('Witness entry:', entry)

const witness = await client.witness.submit(cid, entry)

console.log('Witness data:', witness)
