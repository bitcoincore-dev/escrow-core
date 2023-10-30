import { CoreDaemon } from '@cmdcode/core-cmd'

import ctx from '../ctx.js'

const core = new CoreDaemon({
  debug   : false,
  verbose : false
})

const cli    = await core.startup() 
const wallet = await cli.load_wallet('alice')

const { address } = ctx.acct

await wallet.ensure_funds(1_000_000)
const txid = await wallet.send_funds(55_000, address, true)

console.log('Deposit txid:', txid)
