import { Buff } from "@cmdcode/buff"
import { gen_keypair } from "@cmdcode/crypto-tools/keys"
import { create_addr } from "@scrow/tapscript/address"

for (let i = 0; i < 10; i++) {
  console.log(create_addr(['OP_1', gen_keypair(true)[1]], 'regtest'))
}