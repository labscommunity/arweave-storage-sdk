import { ArweaveStorageSdkError } from './base-error'

export class Unauthorized extends ArweaveStorageSdkError {
  statusCode: number = 401

  constructor(message: string, error?: Error) {
    super(message, error)
  }
}
