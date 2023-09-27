import tape           from 'tape'
import { CoreDaemon } from '@cmdcode/core-cmd'

import prop_test from './src/prop.test.js'
import e2e_test  from './src/e2e.test.js'

tape('Escrow Core Test Suite', async t => {

  const core = new CoreDaemon({
    core_params : [ '-txindex' ],
    corepath    : 'test/bin/bitcoind',
    clipath     : 'test/bin/bitcoin-cli',
    confpath    : 'test/bitcoin.conf',
    datapath    : 'test/data',
    network     : 'regtest',
    isolated    : true,
    debug       : true,
    verbose     : false
  })

  const client = await core.startup()

  prop_test(t)

  await e2e_test(t, client)

  t.teardown(() => { core.shutdown() })
})
