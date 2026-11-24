import { ValidationError, type ValidationIssue } from '@owf/identity-common'

/** How many errors an error_description names */
const MAX_DESCRIBED_ERRORS = 3
const MAX_PATH_SEGMENT_LENGTH = 64

// Matches one character class from start to end, so it can't backtrack
const PLAIN_NAME = /^[A-Za-z0-9_-]+$/

function describedPathSegment(segment: string | number): string {
  if (typeof segment === 'number') return String(segment)
  return segment.length <= MAX_PATH_SEGMENT_LENGTH && PLAIN_NAME.test(segment) ? segment : '*'
}

/**
 * `errorDescription` followed by the errors among the issues as `path (code)`, e.g.
 * `Invalid proof. Errors: nonce (claim_value_mismatch).`, naming at most three.
 *
 * RFC 6749 Section 5.2 only allows printable ASCII without `"` and `\` in `error_description`. The codes are constants
 * of the library, and a path segment that is not an index or a plain name, such as a record key of the request, is
 * shown as `*`, so the description holds no value of the request.
 */
export function validationErrorDescription(errorDescription: string, issues: readonly ValidationIssue[]): string {
  const errors = issues.filter((issue) => issue.severity === 'error')
  if (!errors.length) return errorDescription

  const described = errors
    .slice(0, MAX_DESCRIBED_ERRORS)
    .map(({ path, code }) => (path.length ? `${path.map(describedPathSegment).join('.')} (${code})` : code))
  const more = errors.length - described.length
  return `${errorDescription} Errors: ${described.join(', ')}${more > 0 ? ` and ${more} more` : ''}.`
}

/**
 * The `error_description` for a caught error: `errorDescription`, followed by the issues of a validation error, see
 * {@link validationErrorDescription}. The message of any other error is left out, as it may hold a value of the
 * request or what another server responded.
 */
export function errorDescriptionOf(errorDescription: string, error: unknown): string {
  return error instanceof ValidationError
    ? validationErrorDescription(errorDescription, error.issues)
    : errorDescription
}
