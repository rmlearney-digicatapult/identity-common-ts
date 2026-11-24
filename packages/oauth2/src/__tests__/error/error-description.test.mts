import type { ValidationIssue } from '@owf/identity-common'
import { describe, expect, test } from 'vitest'
import { validationErrorDescription } from '../../error/error-description'

const issue = (path: (string | number)[], code = 'invalid_value'): ValidationIssue => ({
  severity: 'error',
  code,
  path,
  message: 'the message is not described',
})

// RFC 6749 Section 5.2: printable ASCII without '"' and '\'
describe('validationErrorDescription', () => {
  test('shows a path segment that is not an index or a plain name as *', () => {
    expect(
      validationErrorDescription('Invalid request.', [issue(['authorization_details', 0, 'claims', 'a"b\nc', 'value'])])
    ).toEqual('Invalid request. Errors: authorization_details.0.claims.*.value (invalid_value).')
  })

  test('names at most three errors, and no warnings', () => {
    expect(
      validationErrorDescription('Invalid request.', [
        { ...issue(['warned']), severity: 'warning' },
        issue(['a']),
        issue(['b']),
        issue([], 'invalid_type'),
        issue(['d']),
        issue(['e']),
      ])
    ).toEqual('Invalid request. Errors: a (invalid_value), b (invalid_value), invalid_type and 2 more.')
  })
})
