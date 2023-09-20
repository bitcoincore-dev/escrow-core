import { Test }             from 'tape'
import { Signer }           from '@cmdcode/signer'
import { CoreClient }       from '@cmdcode/core-cmd'
import { create_signed_tx } from '@cmdcode/escrow-core/spend'
import { get_test_core }    from '../util.js'

import {
  create_deposit,
  get_deposit_address
} from '@cmdcode/escrow-core/deposit'

import vectors from '../vectors/pass.vectors.json' assert { type : 'json' }

type TestVector   = typeof vectors[0]
type TestAgent    = TestVector['agent']
type TestDeposit  = TestVector['deposits'][0]
type TestProposal = TestVector['proposal']

export default async function (t : Test) {
  t.test('Deposit Tests', async t => {
    const core = get_test_core()
    
    t.plan(vectors.length)
    t.teardown(() => { core.shutdown() })

    for (const v of vectors) {
      try {
        const { agent, deposits, proposal } = v
        const client = await core.startup()

        const agent_signer = new Signer(agent.secret_key)

        const test_deposits = deposits.map(async deposit => {
          return create_test_deposit(agent, client, deposit, proposal)
        })
        
        const txdata = create_signed_tx(agent, test_deposits, 'close', proposal, agent_signer)
        const txid   = client.publish_tx(txdata)

        t.pass('Tests completed with txid: ' + txid)
      } catch (err) {
        const { message } = err as Error
        t.fail(message)
      }
    }
  })
}

async function create_test_deposit (
  agent    : TestAgent,
  client   : CoreClient,
  deposit  : TestDeposit,
  proposal : TestProposal
) {
  const { wallet_name, secret_key, deposit_amt } = deposit
  const signer  = new Signer(secret_key)
  const address = get_deposit_address(agent, proposal, signer.pubkey, 'regtest')

  // Load a wallet for Bob and ensure it has funds.
  const wallet = await client.get_wallet(wallet_name)
  await wallet.ensure_funds(1_000_000)

  // Fund the tx from Alice using Bob's wallet
  const txid = await wallet.send_funds(address, deposit_amt)
  const { txdata } = await client.get_tx(txid)

  // Mine a blocks to confirm the tx.
  await client.mine_blocks(1)

  return create_deposit(agent, proposal, signer, txdata)
}
