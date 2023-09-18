# escrow-core

Core library for implenting the escrow protocol.

Features:
  * Method libraries for implementing the proposal, deposit and settlement phases of the protocol.
  * Consensus validation and run-time schema validation (using zod).
  * Supports version 5 of Typescript.
  * E2E test suite with native Bitcoin Core integration.

## Overview

The core protocol is divided into three stages: `proposal`, `deposit`, and `settlement`.

Each stage has it's own library of methods that help with the setup, signatures and validation for that stage.

## Proposal

The proposal is a smart contract template that is written in JSON format. The purpose of the proposal is to:

- Offer a complete overview of how the contract will be executed under any given condition.
- Collect signed agreements from all participating members that are listed in the contract.
- Allow depositors to pre-sign all potential settlement paths needed to cover the contract.
- Provide an easily readable document for our contract agent to use when evaluating a settlement.

Example proposal (in JSON format):

```ts
{
  title   : "Basic two-party contract plus moderator.",
  details : "n/a",
  network : "regtest",
  version : 1,
  value   : 100000,
  members : [
    "9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be",
    "4edfcf9dfe6c0b5c83d1ab3f78d1b39a46ebac6798e08e19761f5ed89ec83c10",
    "9094567ba7245794198952f68e5723ac5866ad2f67dd97223db40e14c15b092e"
  ],
  fees  : [[ 10000, "bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc" ]],
  paths : [
    [ "payment", 90000, "bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc" ],
    [ "refund",  90000, "bcrt1qdyyvyjg4nfxqsaqm2htzjgp9j35y4ppfk66qp9" ]
  ],
  programs : [
    [ "payment", "dispute", "signature", 1, "9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be" ],
    [ "*",       "resolve", "signature", 1, "9094567ba7245794198952f68e5723ac5866ad2f67dd97223db40e14c15b092e" ],
    [ "*",       "close",   "signature", 2, "9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be", "4edfcf9dfe6c0b5c83d1ab3f78d1b39a46ebac6798e08e19761f5ed89ec83c10" ]
  ],
  schedule: {
    deadline : 7200,
    duration : 7200,
    expires  : 7200,
    onclose  : "payment",
    onexpire : "payment"
  }
}
```

## Deposit

A deposit is considered to be a UTXO that has been placed in a 2-of-2 contract with the escrow agent. The depositor then pre-signs all transactions required to settle the contract under any given condition, and provides these partial signatures to the agent. This allows the agent to independently complete a signature for any given path and settle the contract when needed.

The deposit is formed using a combination of new `BIP-340` taproot and `BIP-327` musig2 protocols. The funds are locked into a 2-of-2 musig key between the depositor and escrow agent, with an additional time-locked refund path for the depositor. This guarantees that funds are recoverable in the event of a worst-case scenario (i.e the escrow agent is non-responsive).

The use of musig also guarantees that the signatures provided by the depositor are not usable on their own. Even in the event of a data-leak, the signatures cannot be used to arbitrarily settle a contract or move funds. The escrow agent must explicitly sign one of the transactions in order to complete a given signature.

In addition, the signature that is used to settle the contract will appear on the blockchain as a simple P2TR (Pay to Taproot) transaction. No data about the contract, its depositors, or its participating members, are ever revealed.

## Escrow Agent

The purpose of the escrow agent is to collect the partial signatures required from each depositor, then use them to execute the contract as set forth in the proposal.

The agent may also collect an additional partial signature from each depositor, to be used for refunding their deposit. In the event that a contract does not meet its funding goals, the agent can refund all depositors quickly and automatically.

Since each transaction includes an output for the agent (to cover contract fees), the agent can be used to 'fee-bump' a transaction in the event that it becomes stuck (for example, during a fee spike in the market).

## Settlement

Once a contract is funded, the escrow agent then has the ability to settle the contract by broadcasting a closing transaction. **The agent does NOT have any custody over the funds.** The transactions available to an agent are limited entirely to what has been pre-authorized by each depositor.

The settlement of the contract is automated through the use of `programs`. These programs may receive input from the contract members. If the proper inputs are provided to a given program, then the agent will settle the contract using the spending path linked to that program.

## Development / Testing

Coming soon!

## Issues / Questions / Comments

Coming soon!

## Resources

Coming soon!
