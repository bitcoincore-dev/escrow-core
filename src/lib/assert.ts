import {
  Network,
  ProposalData
} from '../types/index.js'

import * as schema from '../schema/index.js'

export function ok (
  value    : unknown,
  message ?: string
) : asserts value {
  if (value === false) throw new Error(message ?? 'Assertion failed!')
}

export function valid_address (
  address : string,
  network : Network = 'bitcoin'
) {
  const base58 = /^[123mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/
  const bech32 = /^(bc|tb|bcrt)1([ac-hj-np-z02-9]{39,59})$/

  if (base58.test(address)) {
    throw new Error('Legacy address types are not supported!')
  }

  if (!bech32.test(address)) {
    throw new Error('Invalid address format: ' + address)
  }

  if (
    (network === 'bitcoin' && !address.startsWith('bc')) ||
    (network === 'testnet' && !address.startsWith('tb')) ||
    (network === 'regtest' && !address.startsWith('bcrt'))
  ) {
    throw new Error(`Address does not match "${network}" network: ${address}`)
  }
}

export function valid_proposal (
  proposal : ProposalData
) : asserts proposal is ProposalData {
  void schema.proposal.data.parse(proposal)
}
