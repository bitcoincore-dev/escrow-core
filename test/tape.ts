import tape      from 'tape'
import base_test from './src/base.test.js'

tape('Escrow Core Test Suite', async t => {
  await base_test(t)
})
