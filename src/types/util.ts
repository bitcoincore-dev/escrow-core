import { MusigContext } from '@cmdcode/musig2'

export interface SignerAPI {
  pubkey : string
  sign   : (msg : string) => string
  getPublicKey : () => string
  musign : (ctx : MusigContext) => string
}
