export type ClaimData = ClaimTemplate & ClaimMeta

export interface ClaimMeta {
  contract_id : string
  updated_at  : number
}

export interface ClaimTemplate {
  reason  : string
  message : string
}
