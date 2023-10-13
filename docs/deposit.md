# Deposits

In order for an agent to negotiate funding on behalf of a contract, there needs to be some guarantee that a funding source cannot be spent pre-maturely. If a single source of funds is spent before the contract matures, then the contract as a whole will become under-funded, and thus unable to settle.

To produce this guarantee, we are we are using a 2-of-2 musig output, with a time-locked recovery script as the basis for a deposit utxo.

  * The two-party musig protects the depositor and agent from any custodial concerns.
  * The time-lock ensures exclusivity on the spending of funds for a limited time.
  * The script reserves the depositor's right to refund after the timelock expires.

The depositor collects a public key from the agent, then combines it with their own public key to produce a group key (using musig2). This group key is further tweaked (using taproot) to add the time-locked recovery script.

The depositor may decide how long the time-lock should be. For a deposit to be considered safe to include in a contract, the time remaining on the lock must be greater than the expiration date of the contract.

If a depositor is only interested in a specific contract, then their time-lock should not exceed the expiration date of the contract. However, if a depositor would like to re-use their deposit in the event a contract fails to execute, then a longer time-lock may be desirable.