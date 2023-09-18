import tape       from 'tape'
import base_test  from './src/base.test.js'
import proof_test from './src/proof/proof.test.js'
import prop_test  from './src/prop/prop.test.js'

tape('Escrow Core Test Suite', async t => {
  // await base_test(t)
  proof_test(t)
  prop_test(t)
})
