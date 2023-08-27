function validate_endorsements (
  proposal : Proposal,
  proofs   : Endorsement[]
) {
  // Validate data model is correct.
  assert_proposal_schema(proposal)
  // Unpack members from the proposal.
  const members = proposal.members.sort()
  // Collect signer pubkeys from the proofs.
  const pubkeys = proofs.map(e => e[1]).sort()
  // Check if members string matches pubkeys string.
  if (members.toString() !== pubkeys.toString()) {
    throw new Error('Endorsements does not include all proposal members!')
  }
  // Covert proposal into JSON string.
  const content = JSON.stringify(proposal)
  // Compute content hash.
  const hash = Buff.str(content).digest
  // Validate each endorsement signs the same content.
  proofs.forEach(e => Verify.proof(content, e, true))
}

function validate_proof (
  hash  : string,
  proof : Endorsement
)