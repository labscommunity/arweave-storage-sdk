import { ArweaveStorageSdkError } from './base-error'

export class BadRequest extends ArweaveStorageSdkError {
  statusCode: number = 400

  constructor(message: string, error?: Error) {
    super(message, error)
  }
}
