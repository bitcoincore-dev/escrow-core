import { Buff }   from '@cmdcode/buff-utils'
import { Signer } from '@cmdcode/signer'

import { create_proof, verify_proof } from '../src/lib/proof.js'

import pass_vectors from './src/prop/pass.vectors.json' assert { type : 'json' }
import { stringify } from '../src/lib/util.js'

const secret = Buff.str('carol').digest
const aux    = '00'.repeat(32)
const signer = new Signer(secret, { aux })

const proposal = {
  "details" : "n/a",
  "fees"    : [[ 10000, "bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc" ]],
  "members" : [
    "9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be",
    "4edfcf9dfe6c0b5c83d1ab3f78d1b39a46ebac6798e08e19761f5ed89ec83c10",
    "9094567ba7245794198952f68e5723ac5866ad2f67dd97223db40e14c15b092e"
  ],
  "network" : "regtest",
  "paths": [
    [ "payment", 90000, "bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc" ],
    [ "refund",  90000, "bcrt1qdyyvyjg4nfxqsaqm2htzjgp9j35y4ppfk66qp9" ]
  ],
  "programs" : [
    [ "payment", "dispute", "signature", 1, "9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be" ],
    [ "*",       "resolve", "signature", 1, "9094567ba7245794198952f68e5723ac5866ad2f67dd97223db40e14c15b092e" ],
    [ "*",       "close",   "signature", 2, "9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be", "4edfcf9dfe6c0b5c83d1ab3f78d1b39a46ebac6798e08e19761f5ed89ec83c10" ]
  ],
  "schedule": {
    "deadline" : 7200,
    "duration" : 7200,
    "expires"  : 7200,
    "onclose"  : "payment",
    "onexpire" : "payment"
  },
  "title"   : "Basic two-party contract plus moderator.",
  "value"   : 100000,
  "version" : 1
}

const prop2 = pass_vectors[0].proposal
console.log('hash1 prop:', Buff.str(stringify(proposal)).digest.hex)
console.log('hash2 prop:', Buff.str(stringify(prop2)).digest.hex)

console.log('secret:', secret.hex)
console.log('pubkey:', signer.pubkey.hex)

const proof = create_proof(signer, proposal)

console.log('proof:', proof)
console.log('valid:', verify_proof(proof, prop2))
