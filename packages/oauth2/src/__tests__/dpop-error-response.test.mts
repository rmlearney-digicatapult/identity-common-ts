import type { Jwk } from '@owf/jose'
import * as jose from 'jose'
import { describe, expect, test } from 'vitest'
import { createDpopJwt, verifyDpopJwt } from '../dpop/dpop'
import { callbacks, getSignJwsCallback } from './util.mjs'

const request = { method: 'POST' as const, url: 'https://server.com/token', headers: new Headers() }

describe('DPoP proof error response', () => {
  // RFC 6749 Section 5.2: error_description only allows printable ASCII without '"' and '\'
  test('keeps the jwk of the proof out of the error_description', async () => {
    const { publicKey, privateKey } = await jose.generateKeyPair('ES256', { extractable: true })
    const dpopJwt = await createDpopJwt({
      callbacks: { ...callbacks, signJws: getSignJwsCallback([(await jose.exportJWK(privateKey)) as Jwk]) },
      request,
      signer: {
        method: 'jwk',
        alg: 'ES256',
        publicJwk: {
          ...((await jose.exportJWK(publicKey)) as Jwk),
          use: 'enc"\r\n2026-11-24T00:00:00Z ERROR a line of the request',
        },
      },
    })

    const error = await verifyDpopJwt({ dpopJwt, request, callbacks }).catch((error) => error)

    expect(error.errorResponse).toEqual({ error: 'invalid_dpop_proof', error_description: 'Invalid DPoP proof.' })
  })
})
