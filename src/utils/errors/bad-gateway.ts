import { ArweaveStorageSdkError } from './base-error'

export class BadGateway extends ArweaveStorageSdkError {
  statusCode: number = 502

  constructor(message: string, error?: Error) {
    super(message, error)
  }
}
