import { ArweaveStorageSdkError } from './base-error'

export class ServiceUnavailable extends ArweaveStorageSdkError {
  statusCode: number = 503

  constructor(message: string, error?: Error) {
    super(message, error)
  }
}
