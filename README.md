[![Integration Tests](https://github.com/BitEscrow/escrow-core/actions/workflows/integration.yml/badge.svg?branch=master)](https://github.com/BitEscrow/escrow-core/actions/workflows/integration.yml)

# escrow-core

Core library for implenting the escrow protocol.

Features:
  * Method libraries for implementing the proposal, deposit and settlement phases of the protocol.
  * Consensus validation and run-time schema validation (using zod).
  * Supports version 5 of Typescript.
  * E2E test suite with native Bitcoin Core integration.

## Overview

The life-cycle of a contract has three stages: `creation`, `deposits` and `settlement`.

## The Protocol

### Examples

  **Scenario:** Sales agreement between buyer (alice) and seller (bob) with third-party arbitration.

  Step 0 (draft proposal)  :
    * Alice coordinates on a proposal with Bob.
  Step 1 (create contract) :
    * Bob submits his proposal to the platform and receives a contract.
    * Bob shares this contract with Alice.
  Step 2 (deposit funds)   :
    * Alice deposits her funds into a 2-of 2 account with the contract agent.
    * Alice signs a covenant with the agent that funds the contract.
    * Once the deposit is confirmed, the contract becomes active.
  Step 3 (settle contract) :
    * Alice and Bob supply arguments to the CVM, and each receive a receipt.
    * Based on the supplied arguments, the CVM will select a settlement path.
    * The agent settles the covenant on the selected path and broadcasts the closing tx.
  Step 4 (verify results)  :
    * Both Alice and Bob verify the CVM executed their arguments correctly.
    * If a given action has an invalid signature, Alice / Bob can prove it.
    * If a given action was omitted from the CVM, the receipts can prove it.

Each stage has it's own library of methods that help with the setup, signatures and validation for that stage.

## The Proposal

A proposal is a precursor to creating a contract. It defines the terms of the contract and how it should be executed. It is written in a simple JSON format that is easy to read, for humans and machines alike.

```ts
{
  // The title of the proposal / contract.
  title      : "Basic two-party contract plus moderator.",
  // The details of the proposal / contract.
  details    : "n/a",
  // A relative funding deadline for the contract. Optional.
  deadline  ?: "",
  // An absolute funding deadline for the contract. Optional
  effective ?: "",
  // The max duration of the contract.
  expires    : 10000,
  // Specify a fallback path to use if the contract expires.
  fallback  ?: "",
  // Which block-chain network to use (affects address validation).
  network    : "regtest",
  // A collection of transaction output paths, segregated by a path name.
  paths : [
    [ "payment", 90000, "bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc" ],
    [ "refund",  90000, "bcrt1qdyyvyjg4nfxqsaqm2htzjgp9j35y4ppfk66qp9" ]
  ],
  // A collection of transaction outputs. Applies to all output paths.
  payments : [[ 10000, "bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc" ]],
  // Define which programs will be available in the CVM, and their configuration.
  programs : [
    [ "dispute", "payment", "proof_v1", 1, "9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be" ],
    [ "resolve", "*",       "proof_v1", 1, "9094567ba7245794198952f68e5723ac5866ad2f67dd97223db40e14c15b092e" ],
    [ "close",   "*",       "proof_v1", 2, "9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be", "4edfcf9dfe6c0b5c83d1ab3f78d1b39a46ebac6798e08e19761f5ed89ec83c10" ]
  ],
  // Define actions to be executed in the CVM on a schedule.
  schedule : [[ 7200, "close", "payment|return" ]]
  // The output value of the contract. Any proposed path must sum to this amount.
  value   : 100000,
  // A version number for the proposal specification.
  version : 1,
}

Define these terms:

`paths   `:
`payments`:
`programs`:
`schedule`:
`value   `:

The proposal is designed to be collaborative.

```

### Paths and Payments

### Programs and Actions

### Deadlines and Expiration

## The Agent

 * What is an agent?
 * What is a session?
 * What can an agent do?

```ts
// Example of an agent session.
{
  created_at  : 1696362767,
  deposit_key : 'aef7130f73086fd86b1f14e87315c58b50f09c772566ed436142fe693f5908c1',
  payments    : [[ 1000, 'bcrt1qcdrvy8qmr8ewncv0cx9mq9tnh4kpv99jf9k8cs' ]],
  platform_id : 'a9edd4c2be13d2ebd5abbae78cf2136604136bc068cd9717674a7bc1d9fae76a',
  session_key : '1e938a3b56e87c41ce540da46f09737ad505aba191ef04031e53646250b76d743f35852ad2d3b7d4cdd60df3ef7b18e77b1b94759242094f49a4e76d71b547e3',
  subtotal    : 101000
}
```

###

The purpose of the escrow agent is to collect the partial signatures required from each depositor, then use them to execute the contract as set forth in the proposal.

The agent may also collect an additional partial signature from each depositor, to be used for cooperatively returning their deposit. In the event that a contract does not meet its funding goals, the agent can decide to refund all depositors quickly and automatically.

Since each transaction includes an output for the agent (to cover contract fees), the agent can be used to 'fee-bump' a transaction in the event that it becomes stuck (for example, during a fee spike in the market).

When using key recovery, the agent may

## The Contract

  * published date.
  * virtual machine
  * submit arguments to

```ts
// The main Contract interface.
interface ContractData {
  agent     : AgentSession
  cid       : string
  deposits  : DepositData[]
  published : number
  state     : ContractState
  status    : 'published' | 'active' | 'closed' | 'expired'
  terms     : ProposalData
  total     : number
  witness   : WitnessEntry[]
}
```

## Making Deposits

  * Generating an address.
  * Constructing the covenant utxo.
  * Cooperative return of funds.
  * Non-cooperative sweep of funds.
  * Using ephemeral recovery keys.

```ts
{
  deposit_key : '9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be',
  recover_sig : '826fff03984f74aae6a8fef77c7b3105557e286f50bb9bdc8b7537f72951aab1f10de213d8bf3bc7385517e68ac48bf652ae69e7d129dd1da9e54b94f9a322cb',
  session_key : 'caf68d0f7139c89b13fb68ef9ac400a9a5afbfd4b07da6c8b8577b13fdcb984f4bf51d193f627985d75cafc1b45d2119b0d0b51600989d48dc6d11473e6c773d',
  signatures: [
    [ 'payout', '{ signature_hex }' ],
    [ 'return', '{ signature_hex }' ]
  ],
  txinput: 'txvin10v38xcmjd9c8g5mfvu3r5k6a9s38xet3w4jkucm9ygargv3exsunvdej8yejcgnhd96xuetnwv3r5k6a9s38g7rfvs3r5gnrvvckxwf3xsexvdtyvf3xzde4v9nrjefex4jnywp5ve3kvdf4vf3rqd33vfjrvd3nxgcnzefkv4nxzdmyvsmrjc3hvc6nvenyx3nrsg3vyfmx7at5ygarztpzwpex2an0w46zywnmyfmxzmr4v53r5g33xq6nqvpsdc3zcgnnvdexjur52p6kyjm90y3r5g34xyerqvryx5erxvfcv43rgdfevfsnzef3x93xxc33xqcnxceevc6kxvfcxp3k2wp3vycnwvnxvdjrzdpsx3nxzer9xgexxv3jve3rzve3x33jyltadkyh23'
}
```

A deposit is considered to be a UTXO that has been placed in a 2-of-2 contract with the escrow agent. The depositor then pre-signs all transactions required to settle the contract under any given condition, and provides these partial signatures to the agent. This allows the agent to independently complete a signature for any given path and settle the contract when needed.

The deposit is formed using a combination of new `BIP-340` taproot and `BIP-327` musig2 protocols. The funds are locked into a 2-of-2 musig key between the depositor and escrow agent, with an additional time-locked refund path for the depositor. This guarantees that funds are recoverable in the event of a worst-case scenario (i.e the escrow agent is non-responsive).

The use of musig also guarantees that the signatures provided by the depositor are not usable on their own. Even in the event of a data-leak, the signatures cannot be used to arbitrarily settle a contract or move funds. The escrow agent must explicitly sign one of the transactions in order to complete a given signature.

In addition, the signature that is used to settle the contract will appear on the blockchain as a simple P2TR (Pay to Taproot) transaction. No data about the contract, its depositors, or its participating members, are ever revealed.

```
{
  confirmed :
  txid      :
  updated   : 
}
```

## The CVM (Contract Virtual Machine)

```ts
state: {
  commits : [],
  head    : 'df015d478a970033af061c7ed0152b97907c148b51353a8a33f79cf0b3d87350',
  paths   : [ [ 'payout', 0 ], [ 'return', 0 ] ],
  result  : null,
  start   : 1696362768,
  status  : 'init',
  steps   : 0,
  store   : [],
  updated : 1696362768
},
```

### Providing Arguments (the Witness)

### Locks and Releases

### Disputes and Resolution

### Closing a Contract

## The Settlement

Once a contract is funded, the escrow agent then has the ability to settle the contract by broadcasting a closing transaction. **The agent does NOT have any custody over the funds.** The transactions available to an agent are limited entirely to what has been pre-authorized by each depositor.

The settlement of the contract is automated through the use of `programs`. These programs may receive input from the contract members. If the proper inputs are provided to a given program, then the agent will settle the contract using the spending path linked to that program.

## Development / Testing

Coming soon!

## Issues / Questions / Comments

Coming soon!

## Resources

Coming soon!
