import { ArweaveStorageSdkError } from './base-error'

export class NotFound extends ArweaveStorageSdkError {
  statusCode: number = 404

  constructor(message: string, error?: Error) {
    super(message, error)
  }
}
