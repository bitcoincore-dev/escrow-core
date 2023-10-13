## Covenants

Once a deposit is secured, the depositor can then negotiate with the agent in order to pledge funding towards a contract.

However, there are several issues when negotiating a pledge of funds:

  * It is not immediately clear which set of outputs should be chosen for settlement.
  * A contract may not close right away, so the movement of funds is deferred.
  * A depositor may refuse to participate in the fair settlement of a contract.

To address the issues above, the depositor constructs a "covenant", or a package of pre-signed transactions, then provides these signatures to the agent. The covenant provides the agent with a limited authorization on how the deposit may be spent.

Each signature produced by the depositor is a partial one, thus it cannot be used by the depositor to move funds prematurely. This limited authorization is transferred exclusively to the agent, as only the agent is capable of completing a given partial signature.

Each signature is signed using the sighash flag ANYONECANPAY, thus the deposit may be included with any combination of other inputs used to fund the contract.

The covenant itself is constructed using a custom protocol based on the musig2 specification, with a number of optimizations. The largest optimization is the establishment of a "root" nonce value, which is further tweaked by each depositor using a non-interactive protocol.

This optimization allows for an unbounded number of depositors to cooperate with the agent, and for each depositor to pre-sign an unlimited number of transactions - all within a single round of communication.

The protocol is relatively simple:

```md
All parties compute a hash that commits to the full terms of the contract.

  Ex: hash340('contract/id', serialize(contract_terms))

Each member uses this hash to produce a "root" secret nonce value (using BIP340).

The agent shares their root public nonce value and public key with all depositors.

For each transaction, the depositor performs the following protocol:

  The depositor produces a second commitment that includes both root pnonces, plus the transaction.

  Ex: hash340('contract/root_tweak', depositor_root_pnonce, agent_root_pnonce, sighash(tx))

  This second hash is used to tweak the root pnonce for both the depositor and the agent.

  The agent pubkey and new pnonce values are used to perform a musig2 signing operation and produce a partial signature for the transaction.

Each depositor delivers their pubkey, root pnonce value and package of signatures to the agent.
```

The purpose of the root pnonce value is to guarantee that each derived pnonce value is computed fairly, regardless of which participant performs the computation. Each new tweak commits to the root pnonce values and specific transaction being signed.

Each partial signature is constructed using the standard musig2 protocol, so the security model of the original musig2 paper still holds.

The agent does not generate any signature material, nor pnonce values outside of the root, so random oracle attacks do not apply.

Once all deposits and covenant packages have been collected for a given contract (and verified by the agent), the contract is considered live and executable.