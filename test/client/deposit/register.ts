import {
  EscrowClient,
  Signer
} from '@scrow/core'

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const info = {
  address   : 'bcrt1p8uuul5ln2j68uf3znqul3rf5dxc7pht3gw8uhfu5xkmuyfvhz35sxaq3v2',
  agent_id  : '3d2f5a0c515d9457168483320b96d43f72c971240a29b95d9bdc33a928bf19e6',
  agent_key : 'cd589e9ec65bdbf7984938a2bb482274214a980d486a04a813fe7dfbfaba5a88',
  sequence  : 4199366
}

const txid = '80b224a6c54e39d6e765f9674c801c8716920e684e581f6f630658a41286a823'

const { agent_id, agent_key, sequence } = info

const tmpl = await client.deposit.create(agent_id, agent_key, sequence, txid)

console.log('Deposit template:', tmpl)

const deposit = await client.deposit.register(tmpl)

console.log('Deposit data:', deposit)
