import { Test }             from 'tape'
import { CoreClient }       from '@cmdcode/core-cmd'
import { Signer }           from '@cmdcode/signer'
import { create_signed_tx } from '@scrow/core/spend'
import { get_deposit_ctx }  from '@scrow/core/context'
import { get_path_names }   from '@scrow/core/proposal'
import { get_session_key }  from '@scrow/core/session'
import { PayPath, schema }  from '@scrow/core'

import {
  create_deposit,
  get_deposit_address
} from '@scrow/core/deposit'

import vectors from './vectorgen.js'

const { DEBUG = false } = process.env

export default async function (
  tape   : Test,
  client : CoreClient
) {
  tape.test('E2E Deposit Tests', async t => {

    t.plan(vectors.length)

    for (const vector of vectors) {
      const { agent, deposits, proposal } = vector
      const ag_data     = schema.contract.agent.parse(agent)
      const ag_signer   = new Signer(agent.seckey)
      const prop_data   = schema.proposal.data.parse(proposal)
      const path_names  = get_path_names(proposal.paths as PayPath[])
      const wallets_ids = deposits.map(e => e.wallet_id)
      const wallets     = await client.load_wallets(...wallets_ids)

      let current_path = ''

      try {
        for (const pathname of path_names) {
          // if (pathname !== 'refund') continue
          current_path = pathname
          const deposit_templates = deposits.map(async deposit => {
            const { amount, pubkey, seckey, wallet_id } = deposit
            const dp_signer = new Signer(seckey)
            const context   = get_deposit_ctx(ag_data, prop_data, pubkey)
            const address   = get_deposit_address(context, 'regtest')

            // Load a wallet for Bob and ensure it has funds.
            const wallet = wallets[wallet_id]
            await wallet.ensure_funds(1_000_000)

            const deposit_txid = await wallet.send_funds(amount, address)

            if (DEBUG) console.log('deposit txid:', deposit_txid)

            const deposit_tx = await client.get_tx(deposit_txid)

            if (DEBUG) {
              // console.log('deposit tx:')
              // console.dir(deposit_tx, { depth: null })
            }

            const deposit_tmpl = create_deposit(ag_data, prop_data, dp_signer, deposit_tx.txdata)

            if (DEBUG) {
              const deposit_pn = get_session_key(context, dp_signer)
              const agent_pn   = get_session_key(context, ag_signer)
              console.log('deposit name     :', wallet_id)
              console.log(`deposit address  : ${address}`)
              console.log('deposit pnonce   :', deposit_pn.hex)
              console.log('agent pnonce     :', agent_pn.hex)
              // console.log('deposit template :', deposit_tmpl)
            }

            return deposit_tmpl
          })

          // Mine a blocks to confirm the tx.
          await client.mine_blocks(1)

          const ready_deposits = await Promise.all(deposit_templates)
          const spend_txdata   = create_signed_tx(ag_data, ready_deposits, pathname, prop_data, ag_signer)
          const spend_txid     = await client.publish_tx(spend_txdata)

          await client.mine_blocks(1)

          

          if (DEBUG) {
            console.log('spend path   :', pathname)
            console.log('spend txid   :', spend_txid)
            // console.log('spend txdata :')
            // console.dir(spend_txdata, { depth: null })
          }
        }
        t.pass('All deposit paths completed successfully.')
      } catch (err) {
        if (DEBUG) console.log(err)
        t.fail(`Transaction failed for path: ${current_path}`)
      }
    }
  })
}
