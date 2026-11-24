import { type ValidationIssue, validationErrorMessage } from '@owf/identity-common'
import type { Oauth2ErrorResponse } from '../common/z-oauth2-error'
import type { Oauth2ErrorOptions } from '../error/Oauth2Error'
import { errorDescriptionOf, validationErrorDescription } from './error-description'
import { Oauth2Error } from './Oauth2Error'

interface Oauth2ServerErrorResponseErrorOptions extends Oauth2ErrorOptions {
  internalMessage?: string

  /**
   * @default 400
   */
  status?: number
}

export class Oauth2ServerErrorResponseError extends Oauth2Error {
  public readonly status: number

  public constructor(
    public readonly errorResponse: Oauth2ErrorResponse,
    options?: Oauth2ServerErrorResponseErrorOptions
  ) {
    super(
      `${options?.internalMessage ?? errorResponse.error_description}\n${JSON.stringify(errorResponse, null, 2)}`,
      options
    )
    this.status = options?.status ?? 400
  }

  /**
   * The error response for a request that does not validate. Its `error_description` is the given one followed by
   * the codes and paths of the issues, as RFC 6749 Section 5.2 doesn't allow the line breaks and quotes of their
   * messages, see {@link validationErrorDescription}. The whole issues are in the message.
   */
  public static fromValidationIssues(
    errorResponse: Oauth2ErrorResponse & { error_description: string },
    issues: readonly ValidationIssue[]
  ): Oauth2ServerErrorResponseError {
    return new Oauth2ServerErrorResponseError(
      { ...errorResponse, error_description: validationErrorDescription(errorResponse.error_description, issues) },
      { internalMessage: validationErrorMessage(errorResponse.error_description, issues) }
    )
  }

  /**
   * The error response for a caught error. Its `error_description` is the given one, followed by the codes and paths
   * of the issues for a validation error, see {@link errorDescriptionOf}. The error is the `cause`, and its message is
   * in the message.
   */
  public static fromError(
    errorResponse: Oauth2ErrorResponse & { error_description: string },
    error: unknown,
    options?: Pick<Oauth2ServerErrorResponseErrorOptions, 'status'>
  ): Oauth2ServerErrorResponseError {
    return new Oauth2ServerErrorResponseError(
      { ...errorResponse, error_description: errorDescriptionOf(errorResponse.error_description, error) },
      {
        cause: error,
        internalMessage: error instanceof Error ? error.message : undefined,
        status: options?.status,
      }
    )
  }
}
