import { CoreDaemon } from '@cmdcode/core-cmd'

let daemon : CoreDaemon | null = null

export function get_core () : CoreDaemon {
  if (daemon === null) {
    daemon = new CoreDaemon({
      core_params : [ '-txindex' ],
      // corepath    : 'test/bin/bitcoind',
      // clipath     : 'test/bin/bitcoin-cli',
      // confpath    : 'test/bitcoin.conf',
      // datapath    : 'test/data',
      network     : 'regtest',
      isolated    : false,
      debug       : false,
      verbose     : false
    })
  }
  return daemon
}
