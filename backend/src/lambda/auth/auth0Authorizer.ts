import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-f83484e6.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: any): Promise<JwtPayload> {


  try {
    const token = getToken(authHeader)
    const jwt: Jwt = decode(token, { complete: true }) as Jwt

    const key_id = jwt.header.kid
    const jwkSet = await Axios.get(jwksUrl)
    const signCheck = jwkSet.data.keys.find((k) => k.kid === key_id)

    if (!signCheck) {

      throw new Error(`No matching key of '${key_id}' was found`);
    }

    const certificate = `-----BEGIN CERTIFICATE-----\n${signCheck.x5c[0]}\n-----END CERTIFICATE-----`
    // when certificate is retrieved then verify
    return verify(token, certificate, { algorithms: ['RS256'] }) as JwtPayload
  } catch (e) {
    logger.error('Failed to retrieve auth0 certificate', { error: e.message })
  }


}

function getToken(authHeader: any): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
