import { Test }             from 'tape'
import { CoreClient }       from '@cmdcode/core-cmd'
import { Signer }           from '@cmdcode/signer'
import { create_signed_tx } from '@cmdcode/escrow-core/spend'
import { get_deposit_ctx }  from '@cmdcode/escrow-core/context'
import { get_path_names }   from '@cmdcode/escrow-core/proposal'
import { PayPath, schema }  from '@cmdcode/escrow-core'

import {
  create_deposit,
  get_deposit_address,
  get_deposit_nonce
} from '@cmdcode/escrow-core/deposit'

import vectors from './vectors/pass.vectors.js'

const { DEBUG = false } = process.env

export default async function (
  tape   : Test,
  client : CoreClient
) {
  tape.test('E2E Deposit Tests', async t => {

    t.plan(vectors.length)

    for (const vector of vectors) {
      const { agent, deposits, proposal } = vector
      const ag_data    = schema.contract.agent.parse(agent)
      const ag_signer  = new Signer(agent.seckey)
      const prop_data  = schema.proposal.data.parse(proposal)
      const path_names = get_path_names(proposal.paths as PayPath[])

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
            const wallet = await client.get_wallet(wallet_id)
            await wallet.ensure_funds(1_000_000)

            const deposit_txid = await wallet.send_funds(address, amount)

            if (DEBUG) console.log('deposit txid:', deposit_txid)

            const deposit_tx   = await client.get_tx(deposit_txid)

            if (DEBUG) {
              console.log('deposit tx:')
              console.dir(deposit_tx, { depth: null })
            }
        
            const deposit_tmpl = create_deposit(ag_data, prop_data, dp_signer, deposit_tx.txdata)

            if (DEBUG) {
              const deposit_pn = get_deposit_nonce(context, dp_signer)
              const agent_pn   = get_deposit_nonce(context, ag_signer)
              console.log('deposit name     :', wallet_id)
              console.log(`deposit address  : ${address}`)
              console.log('deposit pnonce   :', deposit_pn.hex)
              console.log('agent pnonce     :', agent_pn.hex)
              console.log('deposit template :', deposit_tmpl)
            }

            return deposit_tmpl
          })

          // Mine a blocks to confirm the tx.
          await client.mine_blocks(1)

          const ready_deposits = await Promise.all(deposit_templates)
          const spend_txdata   = create_signed_tx(ag_data, ready_deposits, pathname, prop_data, ag_signer)
          const spend_txid     = await client.publish_tx(spend_txdata)

          if (DEBUG) {
            console.log('spend path   :', pathname)
            console.log('spend txid   :', spend_txid)
            console.log('spend txdata :')
            console.dir(spend_txdata, { depth: null })
          }

          await client.mine_blocks(1)
        }
        t.pass('All deposit paths completed successfully.')
      } catch (err) {
        if (DEBUG) console.log(err)
        t.fail(`Transaction failed for path: ${current_path}`)
      }
    }
  })
}
