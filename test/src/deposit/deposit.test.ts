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
import { taproot } from '@scrow/tapscript/sighash'

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

        const pend_deposits = deposits.map(deposit => {
          return create_test_deposit(agent, client, deposit, proposal)
        })

        const test_deposits = await Promise.all(pend_deposits)

        // Mine a blocks to confirm the tx.
        await client.mine_blocks(1)
        
        const txdata = create_signed_tx(agent, test_deposits, 'payout', proposal, agent_signer)
        
        const is_valid = taproot.verify_tx(txdata, { throws: true, txindex: 0 })

        const txid = await client.publish_tx(txdata)

        console.log('txid:', txid)

        t.true(is_valid, 'Transaction must be valid.')
      } catch (err) {
        console.log(err)
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

  console.log('depositor created address:', address)

  // Load a wallet for Bob and ensure it has funds.
  const wallet = await client.get_wallet(wallet_name)
  await wallet.ensure_funds(1_000_000)

  // Fund the tx from Alice using Bob's wallet
  await wallet.cmd('settxfee', [ '0.00001' ])

  const txid = await wallet.send_funds(address, deposit_amt)
  const { txdata } = await client.get_tx(txid)

  return create_deposit(agent, proposal, signer, txdata)
}
