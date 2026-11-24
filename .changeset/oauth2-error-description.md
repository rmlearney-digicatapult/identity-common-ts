---
'@openid4vc/oauth2': patch
---

The `error_description` of the error responses of `@openid4vc/oauth2` no longer contains the message of a caught error, as RFC 6749 Section 5.2 only allows printable ASCII without `"` and `\` in it, and the message can hold a value of the request. The message is still in the error message, and the error is the `cause`.

- For a validation error, the description names up to three of the issues by path and code, e.g. `Invalid authorization request. Could not parse jar request payload. Errors: response_type (missing_value).`. A path segment that is not an index or a plain name is shown as `*`. `Oauth2ServerErrorResponseError.fromValidationIssues` now does this too.
- For any other error, the description is a fixed text, e.g. `Error verifying client attestation.`.
- The new `Oauth2ServerErrorResponseError.fromError` creates such an error response for a caught error.

This applies to the DPoP proof, client attestation and PKCE checks of `Oauth2AuthorizationServer`, and to the access token and DPoP checks of `Oauth2ResourceServer`. The `request_uri` prefix in the error of `parsePushedAuthorizationRequestUriReferenceValue` is no longer in `"`.
