import { BaseSchema }     from './schema/base.js'
import { ClaimSchema }    from './schema/claim.js'
import { ContractSchema } from './schema/contract.js'
import { DepositSchema }  from './schema/deposit.js'
import { ProposalSchema } from './schema/proposal.js'
import { TxSchema }       from './schema/transaction.js'

export * from './types/base.js'
export * from './types/contract.js'
export * from './types/deposit.js'
export * from './types/proposal.js'

export const schema = {
  base     : BaseSchema,
  claim    : ClaimSchema,
  contract : ContractSchema,
  deposit  : DepositSchema,
  proposal : ProposalSchema,
  tx       : TxSchema
}
