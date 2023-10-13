# Proposal

A proposal is the precursor to creating a contract. It defines the terms of the contract and how it should be executed. It is written in a simple JSON format that is easy to read, for humans and machines alike.

Example of a proposal:

```ts
{
  title     : 'Basic two-party contract plus moderator.',
  details   : 'n/a',
  deadline  : 3600,
  effective : 1697071723,
  expires   : 14000,
  fallback  : 'payout',
  network   : 'regtest',
  paths     : [
    [ 'payout', 90000, 'bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc' ],
    [ 'return', 90000, 'bcrt1qdyyvyjg4nfxqsaqm2htzjgp9j35y4ppfk66qp9' ]
  ],
  payments  : [[ 10000, 'bcrt1qp62lpn7qfszu3q4e0zf7uyv8hxtyvf2u5vx3kc' ]],
  programs  : [
    [ 'dispute',       '*', 'proof', 1, '9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be', '4edfcf9dfe6c0b5c83d1ab3f78d1b39a46ebac6798e08e19761f5ed89ec83c10' ],
    [ 'resolve',       '*', 'proof', 1, '9094567ba7245794198952f68e5723ac5866ad2f67dd97223db40e14c15b092e' ],
    [ 'resolve|close', '*', 'proof', 2, '9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be', '4edfcf9dfe6c0b5c83d1ab3f78d1b39a46ebac6798e08e19761f5ed89ec83c10' ]
  ],
  schedule  : [[ 7200, 'close', 'payout|return' ]]
  value     : 100000,
  version   : 1,
}
```

This proposal format is designed to be collaborative and sharable between interested parties. Each member can add their own unique terms into the `paths`, `payments`, `programs`, and `schedule` fields. All other fields are single-value and require a unanimous consensus across members.

## Glossary

The following table defines a complete list of terms that may be included in the proposal. Fields marked with a `?` are optional.

| Term      | Description                                                                                                                                                       |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| details   | Detailed information about the contract.                                                                                                                          |
| deadline?  | The amount of time (in seconds) available for funding a once a contract is published. If the funding goal is not met by the deadline, the contract is cancelled. |
| effective? | The exact date (in UTC seconds) that a contract is scheduled to activate. If a deadline is not specified, then the effective date is used to imply a funding deadline.                             |
| expires   | The maximum time (in seconds) that a contract can exist once published. If a contract does not settle by the expiration date, then it is cancelled.                  |
| fallback?  | This specifies a default spending path to be used if and when a contract expires. Optional.                                                                       |
| network   | The blockchain that this contract is executing on. Defaults to bitcoin mainnet.                                                                                   |
| paths     | A collection of spending outputs, labeled with a path name.                                                                                                        |
| payments  | A collection of spending outputs that should be included in all spending paths. More details on paths and payments are described below.                             |
| programs  | A collection of programs that will be made available in the CVM, plus their configuration. More details on programs are described below.                           |
| schedule  | A collection of scheduled actions that will executed within the CVM. More details on the schedule are described below.                                            |
| title     | The title of the proposal.                                                                                                                                        |
| value     | The output value of the contract. Each set of spending outputs must sum to this total amount.                                                                     |
| version   | A version number for the proposal specification.                                                                                                                  |

## Paths and Payments

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

## Actions and Programs

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

## Scheduled Actions

In addition to `programs`, an action can be executed within the CVM on a pre-defined schedule.

Each path entry must contain three items: the *timer*, *action*, and *path regex*.
```ts
[ 7200, 'close', 'payout|return' ]
```

The timer is defined in seconds, and will be relative to the `activated` date that is defined in the contract. Once the specified number of seconds have passed, the action will be executed inside the CVM.

You may specify multiple paths. The task will execute the provided action on each path in sequential order. If the result of the action leads to a settlement, then the contract will close. If an action fails to execute on a given path (due to a rule violatin), then the task will continue its execution on the next path.
