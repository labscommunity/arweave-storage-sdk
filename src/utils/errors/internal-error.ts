import { ArweaveStorageSdkError } from './base-error'

export class InternalError extends ArweaveStorageSdkError {
  statusCode: number = 500

  constructor(message: string, error?: Error) {
    super(message, error)
  }
}
