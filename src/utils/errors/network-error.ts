import { ArweaveStorageSdkError } from './base-error'

export class NetworkError extends ArweaveStorageSdkError {
  statusCode: number = 503

  constructor(message: string, error?: Error) {
    super(message, error)
  }
}
