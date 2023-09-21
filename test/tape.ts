import tape      from 'tape'
import base_test from './src/base.test.js'
import prop_test from './src/proposal/prop.test.js'
import depo_test from './src/deposit/deposit.test.js'

tape('Escrow Core Test Suite', async t => {
  // await base_test(t)
  //prop_test(t)
  depo_test(t)
})
