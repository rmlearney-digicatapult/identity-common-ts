---
'@openid4vc/openid4vci': patch
'@openid4vc/openid4vp': patch
---

The `error_description` of these error responses no longer contains the message of a caught error, as RFC 6749 Section 5.2 only allows printable ASCII without `"` and `\` in it, and the message can hold a value of the request. They use `Oauth2ServerErrorResponseError.fromError` and `fromValidationIssues` of `@openid4vc/oauth2`, so a validation error names up to three issues by path and code, e.g. `Invalid proof. Errors: nonce (claim_value_mismatch).`, and any other error gets a fixed text, e.g. `Invalid proof.`.

- `Openid4vciIssuer`: the jwt, attestation and di_vp proofs, the credential request, the header of an encrypted credential request, and the notification request.
- `@openid4vc/openid4vp`: a request object that is expired or not yet valid, and transaction data that does not validate.
