# Contract

A contract is the result of a proposal that has been verified and published. It is hosted by our platform and accessible via the `contract_id`. Each contract is assigned an automated `agent`. This agent will service the contract, collect signatures from depositors, and produce the final spending transaction once a settlement is reached.

```ts
{
  activated  : null,
  agent      : {} as AgentSession,
  balance    : 0,
  cid        : 'f86bea011ea7415e44c3fa3097141553f00b713e1f2a489535eec31687717eca',
  created_at : 1696960555,
  deadline   : 7200,
  expires    : null,
  fees       : [[ 1500, 'bcrt1q0rt35v4scsmw3udps84rdctduvzz0tlvst0lpq' ]],
  templates  : [] as SpendTemplate[],
  terms      : {} as ProposalData,
  state      : null,
  status     : 'published',
  target     : 101500,
  tx         : null,
}
```

## Glossary

The following table defines a complete list of terms that are included in a contract.

| Term      | Description                                                                                                                                                       |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| active_at | The UTC timestamp (in seconds) of when the contract was activated. If the contract is inactive, this value is null. |
| agent | The details of the signing agent. Used for collecting pre-signed covenants from depositors. |
| balance | The current balance of the contract, which is the sum of all deposits that have been confirmed and signed. |
| cid | A hash commitment of the complete terms of the contract. |
| covenants | A collection of covenant packages that have been pleged to the contract. |
| created_at | The UTC timestamp (in seconds) of when the contract was published.
| deadline | The amount of time (in seconds) available for collecting funds, starting from the published date. |
| expires | The UTC timestamp (in seconds) of when the contract expires. If the contract is inactive, this value is null. |
| fees | A collection of spending outputs that should be included in all spending paths. This field is defined by the platform. |
| templates | A collection of spending templates, labeled by path name. These templates are computed from the proposal and contract fees. |
| terms | The full terms of the contract. This field should be identical to the original proposal. |
| state | The current serialized state of the virtual machine (CVM). If the contract is inactive, this value is null. |
| status | The current status of the contract. |
| target | The target value that must be covered by deposits. The contract `balance` must exceed this value by the specified `deadline`. |
| tx | Information regarding the settlement transaction. If the contract has not yet been settled, this value is null. |
| witness | A collection of signed statements from the contract members. Each statement is evaluated inside the CVM. |

## Components

### Agent Session

### Fees

### Funding

### Templates

### Terms

### Virtual Machine (CVM)

## Settlement
