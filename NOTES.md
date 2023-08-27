## Path Templates

Depositor signs all of the following paths:

  * All settlement paths.
  * _refund path:
      unhappy path, depositor refunded minus agent fees,
      used if deadline expires or contract cancelled
  * _dispute path:
      ugly path, agent paid out, depositor refreshes timeout, 
      claimants and remaining funds placed in musig / multisig quorum
  * _expired path:
      very ugly path, we don't need to support this explicitly.

Write a tx creator, signer, verifier and resolver for each spending path (except expires).

Deposit context should service and cache computation for building all of the above transaction paths.

!! Need to build bitcoin core testbench (with signer <-> bitcoin-cli wallet bridge).
