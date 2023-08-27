import { Address }    from '@scrow/tapscript'
import { CoreDaemon } from '@cmdcode/core-cmd'

const core = new CoreDaemon()

core.on('ready', async (client) => {

  const info = await client.get_info

  console.log(info)

  const wallet = await client.get_wallet('test_wallet')

  const { address }  = await wallet.newaddress

  console.log('addr:', address)

  const template = {
    vout : [{
      value : 800_000,
      scriptPubKey : Address.parse(address).script
    }]
  }

  await wallet.ensure_funds(1_000_000)

  const txdata = await wallet.fund_tx(template)

  console.log(txdata)

  const txid = await client.publish_tx(txdata)

  console.log('txid:', txid)

  await core.shutdown()
})

await core.startup()
