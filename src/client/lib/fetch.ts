export {}

// // Need fetcher and middleware for handling user sessions.
// import { Buff } from '@cmdcode/buff-utils'

// import {
//   SessionConfig,
//   SignerAPI,
//   Token
// } from '../types.js'

// import * as ecc from '@cmdcode/crypto-utils'

// const LOG_TOKENS = false

// const now = () : number => Math.floor(Date.now() / 1000)

// function decode_token (
//   token : string
// ) : Token {
//   const bytes = Buff.b64url(token)

//   if (bytes.length !== 100) {
//     throw new Error(`Invalid token size: ${bytes.length}`)
//   }

//   return {
//     pubkey : bytes.subarray(0, 32).hex,
//     time   : bytes.subarray(32, 40).big,
//     sig    : bytes.subarray(40, 104).hex
//   }
// }

// export async function create_token (
//   signer  : SignerAPI,
//   request : string,
// ) : Promise<string> {
//   const pub  = await signer.getPublicKey()
//   const msg  = Buff.str(request)
//   const time = Buff.big(BigInt(now()), 8)
//   const hash = Buff.join([ pub, time, msg ]).digest
//   const sig  = await signer.sign(hash.hex)
//   const tkn  = Buff.join([ pub, time, sig ]).b64url
//   if (LOG_TOKENS) {
//     console.log('sign:', request, hash.hex)
//     verify_token(tkn, request)
//   }
//   return tkn
// }

// export function verify_token (
//   token   : string,
//   request : string,
// ) : boolean {
//   const { pubkey, time, sig } = decode_token(token)
//   const msg  = Buff.str(request)
//   const hash = Buff.join([ pubkey, time, msg ]).digest

//   if (LOG_TOKENS) {
//     console.log('verify:', request, hash.hex)
//   }
//   return ecc.signer.verify(sig, hash, pubkey)
// }

// export function create_fetch (
//   signer : SignerAPI,
//   config : Partial<SessionConfig> = {}
//   ) : typeof fetch {
//   return async (
//     input : RequestInfo | URL,
//     init  : RequestInit | undefined = {}
//   ) : Promise<Response> => {
//     const { host } = config

//     let url = (input instanceof Request)
//       ? input.url
//       : input instanceof URL
//         ? input.toString()
//         : input

//     if (typeof host === 'string') {
//       url = host + url
//     }

//     if (url.includes('://')) {
//       url = url.split('://')[1]
//     }

//     const body = (typeof init.body === 'object')
//       ? JSON.stringify(init.body)
//       : (typeof init.body === 'string')
//         ? init.body
//         : ''

    
//     const token  = await create_token(signer, url + body)
//     init.headers = { Authorization: 'Bearer ' + token }

//     return fetch(input, init)
//   }
// }
