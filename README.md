[![Integration Tests](https://github.com/BitEscrow/escrow-core/actions/workflows/integration.yml/badge.svg?branch=master)](https://github.com/BitEscrow/escrow-core/actions/workflows/integration.yml)

# escrow-core

Core library for implenting the escrow protocol.

Features:
  * Method libraries for the proposal, contract, and settlement rounds of the protocol.
  * Multi-platform client with minimal dependencies.
  * Run-time schema validation (using zod).
  * Showcases the power of taproot and musig2.
  * E2E test suite with native Bitcoin Core integration.

Comimg Soon:
  * Caching and hydration for the contract object.
  * Real-time events with EventEmitter interface.
  * Tooling for disposable private keys.
  * More tests and documentation.

Long Term:
  * Spending paths with variable amounts.
  * Extended deposit key for generating addresses.
  * Direct change outputs into a new deposit.
  * Refinements to the contract vm.

## Prelude

The main focus of this project is to build the best escrow platform on the planet, using the Bitcoin blockchain as a globally neutral arbitration service.

This open-source project represents my one-year tribute of chasing after that dream.

My inspiration comes from the Bitcoin space, and the incredibly talented people that keep it alive. From them I gained my knowledge and spirit, and for that I am forever grateful.

I wish for Bitcoin to win all the marbles; and become the new global reserve marbles that we all fight over. I firmly believe it will make the world a better place to live in, and advance our society towards a new golden age. Maybe we will even become space-faring apes that reach beyond the moon.

## Mission Statement

These are the core design principles of the project:

Be simple   : Do not over-complicate the protocol.  
Be brief    : Few rounds of communication as possible.  
Be discreet : Don't leave any sensitive information on-chain.  

These are the core security prinicples:

* Custody is cancer. Avoid it at all costs.
* Private keys are radioactive (which give us cancer).
* Signing devices are the standard.

## Overview

The protocol is split into three phases: `proposal`, `contract`, and `settlement`. Each phase represents a round of communication in the protocol.

A brief overview:

**Proposal**:  

A proposal is the pre-cursor to a contract, and contains all of the negotiable terms. It is written and consumed in JSON format, and designed for collaboration (much like a PSBT).

There is no specification placed on how to communicate a proposal between parties. There are already many great and terrible communication protocols that exist in the wild, and they (mostly) support JSON. Feel free to use your favorite one!

**Contract**:  

Once the terms of a proposal have been established, the next step is to setup an escrow contract. The contract is collaborative agreement between the three acting parties:

  - The `members` of the proposal, which receive the funds.
  - The `funders` of the proposal, which deposit the money.
  - The escrow `agent`, which executes the terms of the contract.

In order to bind funds to a contract, a `deposit` is made into a joint 2-of-2 address between the funder and agent, with a time-locked refund output. The time-lock ensures the agent has an exclusive window to negotiate the funds, and the refund output guarantees the funder can recover their funds in a worst-case scenario.

Once funds are secured within a deposit address, a `covenant` is made between the funder and agent. The covenant is constructed using a set of pre-signed transactions that authorize the spending of funds within a limited set of outputs.

Since the address is a 2-of-2, both the agent and funder must agree on the the outputs in order for the signatures to be valid. The makeup of these outputs are defined by the proposal in a easily digestible way.

Once the covenant is made, the funds are considered in escrow. When the agent has collected enough funds to cover the value of the contract, the contract becomes active.

**Settlement**:

The final round of the escrow process is the `settlement`. This is the most fun part of the process, as members of the contract now get to debate about how the money shall be spent.

Before explaining the settlement process, I should note that the purpose of the proposal is to spawn a simple and dumb decision tree for the escrow agent to follow.

Agents are like meeseeks in that their purpose is to coordinate deposits, collect signatures and spit out transactions for a nominal fee. There may be no ambiguity in the life of an agent. Any descision outside of a 0 or 1 equals pain for the agent.

When a contract becomes active, it spawns a very basic virtual machine (nicknamed CVM). This machine is designed to accept signed statements, run programs, and execute tasks based on the terms of the contract. The entire state of the CVM is determined by the initial terms of the proposal, plus some additional terms provided by the agent.

Every input into the CVM is signed. Each update to the CVM is signed and returned as receipt. Each update to the CVM also commits to the prevous update (a hash-chain if you will). The end-goal of the CVM is to build a cryptographic proof that demonstrates the final selection of a spending output for the contract.

Once a selection has been made, the contract agent then proceeds to complete the covenant signatures and spend the selected output as an on-chain transaction.

Thankfully, all of this is done by computer software. :-)

## Protocol Flow

  > **Scenario**: Sales agreement between a buyer (alice) and seller (bob) with third-party (carol) arbitration.

  Step 0 (draft proposal):  
    * Alice prepares a proposal with Bob. They both agree on Carol to resolve disputes.

  Step 1 (create contract):  
    * Bob submits his proposal to the agent and receives a contract.
    * Bob shares this contract with Alice.

  Step 2 (deposit & covenant):  
    * Alice deposits her funds into a 2-of 2 account with the contract agent.
    * Alice signs a covenant that spends her funds to either 'payout' or 'refund' path.
    * Once the deposit is confirmed on-chain, the contract becomes active.
  
  Step 3a (settle contract - happy path):  
    * Alice receives her widget and forgets about Bob.
    * The contract schedule closes automatically on 'payout'.
    * Bob gets the funds, Alice can verify the CVM execution.

  Step 3b (settle contract - so-so path):  
    * Alice doesn't like her widget.
    * Alice and Bob both agree to sign the 'refund' path.
    * Alice gets a partial refund, Bob still keeps his fees.

  Step 3c (dispute contract - unhappy path):  
    * Alice claims she didn't get a widget, and disputes the payout.
    * Carol now has authority to settle the contract.
    * Carol decides on the 'refund' path.
    * Alice gets a partial refund, Bob still keeps his fees.

  Step 3d (expired contract - ugly path):  
    * Alice claims she didn't get a widget, and disputes the payout.
    * Carol is on a two-week cruise in the bahamas.
    * The proposal did not include any auto-settlement terms.
    * The contract hangs in dispute until it expires.
    * The fallback path is executed, or if not defined, all deposits are refunded.

   Step 3e (expired deposits - horrific path):  
    * Everything in 3d happens, except the last bit.
    * The entire escrow platform goes down in flames.
    * All deposits expire, and can be swept using the refund path.

## The Proposal

A proposal is the precursor to creating a contract. It defines the terms of the contract and how the CVM should be executed. It is written in a simple JSON format that is easy to read, for humans and machines alike.

```ts
{
  title    : 'Basic two-party contract with third-party dispute resolution.',
  details  : 'n/a',
  expires  : 14400,
  network  : 'regtest',
  paths: [
    [ 'payout', 90000, 'bcrt1qhlm6uva0q2m5dq4kjd9uzsankkxe9pza5uylcs' ],
    [ 'return', 90000, 'bcrt1qemwtdfh9uncvw7jlq4ux7p7stl9lgvfxa8t05g' ]
  ],
  payments : [[ 10000, 'bcrt1qxemag7t72rlrhl2ezsnsprmunmnzc35nmaph6v' ]],
  programs : [
    [ 'dispute', 'payout', 'proof', 1, '9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be' ],
    [ 'resolve',      '*', 'proof', 1, '9094567ba7245794198952f68e5723ac5866ad2f67dd97223db40e14c15b092e' ],
    [ 'close|resolve','*', 'proof', 2, 
      '9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be',
      '4edfcf9dfe6c0b5c83d1ab3f78d1b39a46ebac6798e08e19761f5ed89ec83c10'
    ]
  ],
  schedule : [[ 7200, 'close', 'payout|return' ]],
  value    : 100000,
  version  : 1
}
```

This proposal format is designed to be collaborative and sharable between interested parties. Each member can add their own unique terms into the `paths`, `payments`, `programs`, and `schedule` fields. All other fields are single-value and require a unanimous consensus across members.

The following table defines a complete list of terms that may be included in the proposal. Fields marked with a `?` are optional.

| Term      | Description                                                                                                                                                       |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| confirmations? | Enforce a minimum number of confirmations on deposits before being accepted. Optional.
| details   | Detailed information about the contract.                                                                                                                          |
| deadline?  | The amount of time (in seconds) available for funding a once a contract is published. If the funding goal is not met by the deadline, the contract is cancelled. |
| effective? | The exact date (in UTC seconds) that a contract is scheduled to activate. If a deadline is not specified, then the effective date is used to imply a funding deadline.                             |
| expires   | The maximum time (in seconds) that a contract can exist once published. If a contract does not settle by the expiration date, then it is cancelled.                  |
| fallback?  | This specifies a default spending path to be used if and when a contract expires. Optional.
| feerate? | Enforce a minimum feerate on all deposits. Optional.                                                                       |
| network   | The blockchain that this contract is executing on. Defaults to bitcoin mainnet.                                                                                   |
| paths     | A collection of spending outputs, labeled with a path name.                                                                                                        |
| payments  | A collection of spending outputs that should be included in all spending paths. More details on paths and payments are described below.                             |
| programs  | A collection of programs that will be made available in the CVM, plus their configuration. More details on programs are described below.                           |
| schedule  | A collection of scheduled actions that will executed within the CVM. More details on the schedule are described below.                                            |
| title     | The title of the proposal.                                                                                                                                        |
| value     | The output value of the contract. Each set of spending outputs must sum to this total amount.                                                                     |
| version   | A version number for the proposal specification.                                                                                                                  |

### Paths and Payments

The purpose of `paths` and `payments` is to define the set of spending outputs available to the contract.

**Paths**  

Each path entry must contain three items: the *label*, *output value*, and *destination address*.
```ts
[ 'payout', 90000, 'bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc' ]
```

**Payments**  

A payment is a spending output that must be included in all paths. Each payment entry must contain just two items: the *output value* and *destination address*.
```ts
[ 10000, 'bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc' ]
```

When a contract is created, the outputs specified in `paths` are grouped together by path-name, and each group is used to create a transaction template. The outputs specified in `payments` are then added to each template.

The total sum for each transaction template must be identical, and must equal the `value` of the proposal.

### Actions and Programs

Each contract comes with a tiny virtual machine, called the CVM. The purpose of the CVM is to provide contract members an environment for updating the contract and debating how it should be settled.

**Actions**  

Updates to the CVM take the form of an `action` that is applied to a specified `path`:
```
close   : Settle the contract using the provided path.
lock    : Lock a spending path from being used.
unlock  : Unlock a spending path for use.
dispute : Dispute a spending path and block its use.
resolve : Resolve a dispute and settle the contract (using the provided path).
```
Actions can be taken within the CVM by executing a program.

**Programs**  

Programs can be loaded into the CVM using the `programs` section of the proposal. Each program definition must specify an *action regex*, a *path regex*, a *method* to use, followed by any *parameters* used to configure the method.

The following entry is an example definition of a program:
```ts
[  'close|resolve', '*', 'proof',  2, '9997...03be', '4edf...3c10' ]
```
Based on the above configuration, the `close` and `resolve` actions can be taken on any (`'*'`) path in the contract, using the `proof` method. The proof method takes a `threshold` parameter, plus a list of pubkeys allowed to use the program.

Let's assume that the list of pubkeys includes the buyer and seller. The buyer and seller can use the above program to collaboratively `close` or `resolve` the contract on any spending path, by each contributing a valid `proof`.

The logic rules of the CVM are designed to be simple and easy to follow:
```
  ## Rules of Actions
  - An open path can be locked, disputed, or closed.
  - A locked path can be disputed or unlocked.
  - A disputed path can only be resolved.
  - Closing a path will settle the contract.
  - Resolving a dispute will settle the contract.
```
The `proof` method is a basic implementation of a threshold multi-signature agreement. Additional methods and actions may be added to the CVM in the future.

The regex allowed for paths and actions is intentionally limited: you can only use the `|` symbol to specify multiple options, or the `*` symbol to specify all options.

### Scheduled Actions

In addition to `programs`, an action can be executed within the CVM on a pre-defined schedule.

Each path entry must contain three items: the *timer*, *action*, and *path regex*.
```ts
[ 7200, 'close', 'payout|return' ]
```

The timer is defined in seconds, and will be relative to the `activated` date that is defined in the contract. Once the specified number of seconds have passed, the action will be executed inside the CVM.

You may specify multiple paths. The task will execute the provided action on each path in sequential order. If the result of the action leads to a settlement, then the contract will close. If an action fails to execute on a given path (due to a rule violatin), then the task will continue its execution on the next path.

The format of the proposal is mostly solidified, but still a work in progress. There may be changes or refinements in the future.

## The Contract

The contract serves as the coordinating document for both depositors and contract members. It provides information for making deposits, constructing a covenant, and hosts the CVM for contract members to interact with.

```ts
interface ContractData {
  activated   : null | number
  agent_id    : string
  agent_key   : string
  agent_pn    : string
  balance     : number
  cid         : string
  deadline    : number
  expires_at  : null | number
  fees        : Payment[]
  moderator   : string | null
  outputs     : SpendTemplate[]
  pending     : number
  prop_id     : string
  published   : number
  settled     : boolean
  settled_at  : number | null
  spent       : boolean,
  spent_at    : number | null
  spent_txid  : string | null
  status      : ContractStatus
  terms       : ProposalData
  total       : number
  updated_at  : number
  vm_state    : null | ContractState
}
```

```ts
// The different states of a Contract.
export type ContractStatus = 
  'published' | // Initial state of a contract. Can be cancelled. 
  'funded'    | // Contract is funded, not all deposits are confirmed.
  'secured'   | // All deposits are confirmed, awaiting delayed execution. 
  'pending'   | // Contract is ready for activation
  'active'    | // Contract is active, CVM running, clock is ticking.
  'closed'    | // Contract is closed, ready for settlement.
  'spent'     | // Contract is spent, tx in mempool.
  'settled'   | // Contract is settled, tx is confirmed.
  'canceled'  | // Contract canceled or expired during funding.
  'expired'   | // Contract expired during execution.
  'error'       // Something broke, may need manual intervention.
```

Once funds are secured and the contract is active, the CVM is initialized and ready to accept arguments.

```ts
// The state of a newly born CVM, fresh from the womb.
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
}
```

Arguments are supplied using signed statements. Each statement is fed into the CVM, and evaluated within the rules of the CVM. If the statement is valid, then the actions are applied, the state is updated, and a receipt is returned to the sender.

```ts
type WitnessEntry = [
  stamp   : number,   // A UTC timestamp, in seconds.
  action  : string,   // The action to be taken.
  path    : string,   // The path that will receive the action.
  prog_id : string,   // A unique ID that calls the program.
  ...args : Literal[] // The arguments to supply to the program.
]
```

Currently, the CVM only supports one method, and that is the `proof` method. The proof method is designed to accept a number of signatures, then execute an action based on a quorum of signatures being reach. The threshold for this quorm is defined in the proposal terms.

The `proof` method uses simple, short-hand proofs that are designed to be compact and easy to parse / use. They are inspired by `NIP-26` style delegation proofs.

```ts
// Includes a record id, pubkey, proof id, and signature.
'a61ba8a7780a8bb02c31a67c613855c608b3d064b366e122420caae0cf23d2379997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803bedcb3e636893b1b39ee8199da6948b2ad3fdfa47b901342a67e979992a256f3ea23af335d9d3ac52949e759e91cf59931054f0460325a31f885293e64bf296bedc603b73b29aa11fb2c0a7b1470945f5f3b8b56cdf7bf2ade422dfa29ecbd4a2c'
```

Also, proofs use the same signing method as nostr notes, so technically any proof can be converted into a valid nostr note, and vice-versa. Valid proofs can also be constructed usings nostr-based signing devices (such as `NIP-07` based extensions).

```ts
// A parsed proof will look like this:
interface ProofData {
  ref    : string
  pub    : string
  pid    : string
  sig    : string
  params : string[][]
}
```

The CVM is designed to be extensibe. It will support many hooks and cross-platform integrations in the future. It is also a work in progress, so expect bugs.

## Deposits

Deposits are the most magical part of the protocol, and a good amount of engineering has been poured into their construction.

To start, each deposit account is a time-locked 2-of-2 taproot address. All deposits are guaranteed refundable, and the script path is only revealed in a worst-case scenario.

In addition, the 2-of-2 address is constructed using an extended version of the musig2 protocol to optimize for non-interactive signing of a batch of transactions. This protocol is compatible with BIP327, and does not comprimise on any of the security features in the specification.

```ts
interface DepositData {
  agent_id     : string
  agent_key    : string
  agent_pn     : string
  block_hash   : string | null
  block_height : number | null
  block_time   : number | null
  confirmed    : boolean
  covenant     : CovenantData | null
  created_at   : number
  expires_at   : number | null
  deposit_id   : string
  deposit_key  : string
  return_tx    : string
  scriptkey    : string
  sequence     : number
  settled      : boolean
  settled_at   : number | null
  spent        : boolean,
  spent_at     : number | null
  spent_txid   : string | null
  status       : DepositStatus
  txid         : string
  updated_at   : number
  value        : number
  vout         : number
}
```

It is important to note that a deposit can be released from one contract, and signed to another, without requiring an on-chain transaction. This is particularly useful if a contract expires or is otherwise cancelled, as the deposits can be reused immediately.

The caveat with this is that there is currently no revocation protocol in place for past covenants, so technically the agent has a limited opportunity to double-spend. There are plans to impove the off-chain use of deposits in a future version of the protocol.

```ts
type DepositStatus =
'reserved' | // An account has been reserved, no deposit registered.
'pending'  | // Deposit is registered in mempool and ready for signing.
'stale'    | // Deposit is stuck in mempool, must wait for confirmation.
'open'     | // Deposit is confirmed and ready for signing
'locked'   | // Deposit is currently locked to a covenant.
'spent'    | // Deposit has been spent and is in the mempool.
'settled'  | // Deposit spending tx has been confirmed.
'expired'  | // Deposit time-lock is expired, no longer secured.
'error'      // Something went wrong, may need manual intervention.
```

Finally, the deposit refund process is designed to incorporate a soon-to-be-released feature called disposable private keys. These keys are meant to be generated locally on your machine, used to sign a covenant, and then thrown into the abyss. Disposable keys are optional and not a part of the escrow spec, but they have great security benefits, and I hope to provide more documentation on them in the future.

When a contract is settled, it will appear on the blockchain as a simple P2TR (Pay to Taproot) transaction. No information about the contract, its depositors, or its participating members, are ever revealed.

## Covenants

The covenant itself is constructed using a custom protocol based on the musig2 specification, with a number of optimizations. The largest optimization is the establishment of a "root" nonce value, which is further tweaked by each depositor using a non-interactive protocol.

In regards to scaling, the protocol is O(1) for the collective negotiation of deposits, requires O(n = outputs) signatures from a given depositor, and O(n * m = depositors) for verification of signatures by the agent.

The protocol is relatively simple:

* All parties compute a hash that commits to the full terms of the contract.
  > Ex: hash340('contract/id', serialize(contract_terms))
* Each member uses this hash to produce a "root" secret nonce value (using BIP340).
* The agent shares their root public nonce value with all depositors.
* For _each_ transaction, the depositor performs the following protocol:
  - The depositor produces a second commitment that includes both root pnonces, plus the transaction.
    > Ex: hash340('contract/root_tweak', depositor_root_pnonce, agent_root_pnonce, sighash(tx))
  - This second hash is used to tweak the root pnonce for both the depositor and the agent.
  - The agent pubkey and new pnonce values are used to produce a partial signature for the transaction.
* Each depositor delivers their pubkey, root pnonce value and package of signatures to the agent.

The purpose of the root pnonce value is to guarantee that each derived pnonce value is computed fairly, regardless of which participant performs the computation. Each tweak commits to the root pnonce values and specific transaction being signed. Since this tweak is applied non-interactively on both sides, there must be a mutual agreement by both parties. Once the tweak is applied, a partial signature is constructed using the standard musig2 protocol. This includes a full commitment to the session state, including the tweaked nonce values, so the security model of the original musig2 paper still holds.

The agent does not respond with any signature material, nor commit to any pnonce values used in the actual signing, so random oracle attacks should not apply.

```ts
export interface CovenantData {
  cid    : string
  pnonce : string
  psigs  : [ string, string ][]
}
```

Each signature is signed using the sighash flag ANYONECANPAY, thus the deposit may be included with any combination of other inputs used to fund the contract. Once all deposits and covenant packages have been collected for a given contract (and verified by the agent), the contract is considered live and executable.

## Signatures and Signing Devices

The entire protocol, software, and supporting libraries have been designed from the ground-up to incorprate signing devices at all costs. Every interaction with a user's private key is done with the concept of a signing device in mind, and all cryptographic signing methods in the procotol **require** a signing device as input.

In addition, the protocol is designed with the assumption that the contract agent is a dirty scoundrel who will swindle your private keys away from you using the best-and-worst tricks imaginable. All signature methods in the protocol **require** a signing device to generate nonce values and perform key operations, and **zero** trust is given to any counter-party during the signing process.

Even the musig part of the protocol has been extended to require secure nonce generation *within the device* as part of the signing process.

However, since we are incorporating state-of-the-art cryptography, there is a lack of devices out there that can deliver on what we need in order to build the best escrow platform on the planet.

Therefore, included as part of the escrow-core library is a reference implementation of a software-based signing device.

This purpose of this signer is to act as a place-holder in the protocol, and clearly define what interactions take place, what information is exchanged, and what cryptographic primitives are required.

There are three main primitives that are required in order to use the protocol:

- Schnorr signatures (BIP340)/
- Musig signatures (BIP327, plus secure nonce generation).
- Adaptor tweaks during nonce generation (for the batch covenant signing).

Below is the current API for the Signer class. 

```ts
class Signer {
  // Generates a signing device from a random 32-byte value.
  static generate (config ?: SignerConfig) : Signer
  // Generates a signing device from the sha-256 hash of a passphrase.
  static seed (seed : string, config ?: SignerConfig ): Signer;
  // Provides a signing device for a given secret and configuration.
  constructor(secret: Bytes, config?: SignerConfig);
  // Provides a sha256 hash of the public key.
  get id(): string;
  // Provides the x-only public key of the device.
  get pubkey(): string;
  // Derives a key-pair from a derivation path. Accepts numbers and strings.
  derive(path: string): Signer;
  // Computes a shared-secret with the provided public key/
  ecdh(pubkey: Bytes): Buff;
  // Generates a nonce value for a given message, using BIP340.
  gen_nonce(message: Bytes, options?: SignerOptions): Buff;
  // Performs an HMAC operation using the device's internal secret.
  hmac(message: Bytes): Buff;
  // Produces a musig2 partial signature using the supplied context.
  musign(context: MusigContext, auxdata: Bytes, options?: SignerOptions): Buff;
  // Produces a BIP340 schnorr signature using the provided message.
  sign(message: Bytes, options?: SignerOptions): string;
}
```

There are a few nifty things that are planned for a future upgrade to the protocol, so the reference signer comes packed with some extra goodies. The current API represents what a first-class signing device should be able to do, at minimum. Future revisions of the API may incorporate methods for validation, as trusting third-party software for validation of cryptographic proofs is not a good practice.

## Whitepaper

There is work being done on a white-paper that focuses on the technical details of the protocol (including the good, bad, and ugly) in order to make things official and invite the sweet-tasting wrath of academic scrutiny.

## Development / Testing

Coming soon. The documentation for development and testing is currently being fleshed out for an open beta release.

## Issues / Questions / Comments

Please feel free to post and contribute. All feedback is welcome.

## Resources

Nearly the entire code-base has been built from scratch, with only one hard third-party dependency and a couple soft dependencies.

**noble-curves**  

Best damn elliptic curve library. Lightweight, independently audited, optimized to hell and back. Works across all platforms. Even deals with the nightmare that is webcrypo. There is no second best. Credit to Paul Miller.

https://github.com/paulmillr/noble-curves  

**noble-hashes**  

Paul's hashing library is also great, and performs synchronous operations. Credit to Paul Miller.

https://github.com/paulmillr/noble-hashes  

**Zod**  

The best run-time validation library, also the best API of any method library. Turns javascript into a some-what respectable language. The error output can be the stuff of nightmares though. Credit to Colin McDonnel.

https://github.com/colinhacks/zod  

**Tapscript**  

My humble taproot library and grab-bag of bitcoin related tools. Currently using a development version that has yet-to-be released due to undocumented changes in the API. 

https://github.com/cmdruid/tapscript  

**Musig2**  

Reference implementation of the Musig2 protocol with a few additional features. However I do not implement the death star optimization.

https://github.com/cmdruid/musig2  

**Crypto Tools**  

Provides a full suite of cryptographic primities and other useful tools. Wraps the noble-curve and noble-hash libraries (and cross-checks them with other implementations). Also provides an extended protocol for BIP32 key-derivation that supports strings and urls.

https://github.com/cmdruid/crypto-tools  

**Buff**  

The swiss-army-knife of byte manipulation. Such a fantastic and invaluable tool. Never leave home without it.

https://github.com/cmdruid/buff  

**Core Command**  

Not a run-time dependency, but I use this to incorporate bitcoin core directly into my test suite. I also use it to mock-up core as a poor-man's electrum server. Acts as a daemon wrapper and CLI tool, provides a full wallet API, faucets, and can run bitcoin core natively within a nodejs environment (which is pretty wild).

https://github.com/cmdruid/core-cmd  