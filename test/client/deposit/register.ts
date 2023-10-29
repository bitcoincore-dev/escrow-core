import {
  EscrowClient,
  Signer
} from '@scrow/core'

const hostname = 'http://localhost:3000'
const oracle   = 'http://172.21.0.3:3000'
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const info = {
  address: 'bcrt1p4myjszwh3ukr3j95hmhu5yscl4836yww93fww8cjf3p9rpk588mqkdv0rq',
  agent_id: 'fb868f3c41e356bf6359233f8f7e28d605fb92caf98c16bfa14296c7dd34474d',
  agent_key: '074b78f9ec9b17d60e1e37339359f4707114008941de3604ece458b54bf271bd',
  sequence: 4199366
}

const txid = '0a4b7eb2f712e1f9af889ee5745e24da4f162dc22498a871d23e7a068f13cb88'

const { agent_id, agent_key, sequence } = info

const tmpl = await client.deposit.create(agent_id, agent_key, sequence, txid)

console.log('Deposit template:', tmpl)

const deposit = await client.deposit.register(tmpl)

console.log('Deposit data:', deposit)
