import { ArweaveStorageSdkError } from './base-error'

export class Forbidden extends ArweaveStorageSdkError {
  statusCode: number = 403

  constructor(message: string, error?: Error) {
    super(message, error)
  }
}
