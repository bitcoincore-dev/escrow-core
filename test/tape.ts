import tape         from 'tape'
import { get_core } from './core.js'

import prop_test from './src/prop.test.js'
import e2e_test  from './src/e2e.test.js'

tape('Escrow Core Test Suite', async t => {
  const core   = get_core()
  const client = await core.startup()
  prop_test(t)
  await e2e_test(t, client)
  t.teardown(() => { core.shutdown() })
})
