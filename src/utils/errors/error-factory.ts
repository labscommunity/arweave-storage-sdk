import { BadGateway } from './bad-gateway'
import { BadRequest } from './bad-request'
import { Forbidden } from './forbidden'
import { GatewayTimeout } from './gateway-timeout'
import { InternalError } from './internal-error'
import { NetworkError } from './network-error'
import { NotFound } from './not-found'
import { ServiceUnavailable } from './service-unavailable'
import { TooManyRequests } from './too-many-requests'
import { Unauthorized } from './unauthorized'

export const throwError = (status: number, message?: any, error?: Error) => {
  if (typeof message !== 'string') {
    message = JSON.stringify(message)
  }

  switch (status) {
    case 400:
      throw new BadRequest(message, error)
    case 401:
      throw new Unauthorized(message, error)
    case 403:
      throw new Forbidden(message, error)
    case 404:
      throw new NotFound(message, error)
    case 429:
      throw new TooManyRequests(message, error)
    case 502:
      throw new BadGateway(message, error)
    case 503:
      throw new ServiceUnavailable(message, error)
    case 504:
      throw new GatewayTimeout(message, error)
    default:
      if (
        error &&
        error['code'] &&
        (error['code'] === 'ENOTFOUND' ||
          error['code'] === 'ECONNRESET' ||
          error['code'] === 'ETIMEDOUT' ||
          error['code'] === 'ECONNREFUSED' ||
          error['code'] === 'ESOCKETTIMEOUT' ||
          error['code'] === 'socket hang-up')
      ) {
        throw new NetworkError(error['code'], error)
      }
      throw new InternalError('Internal error. Please try again or contact support.', error)
  }
}

export const retryableErrors = [NetworkError, BadGateway, ServiceUnavailable, GatewayTimeout]
