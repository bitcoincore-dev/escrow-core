import { Signer } from '@cmdcode/signer'

export class EscrowSigner {
  readonly _signer : Signer

  constructor (signer : Signer) {
    this._signer = signer
  }

  endorse () {

  }

  create_deposit (
    agent    : AgentData,
    txinput  : TxInput,
    proposal : ProposalData,
  ) {
    
  }
}