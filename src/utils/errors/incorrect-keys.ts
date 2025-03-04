import { ArweaveStorageSdkError } from './base-error'

export class IncorrectKeys extends ArweaveStorageSdkError {
  statusCode: number = 409

  constructor(error?: Error) {
    super('Incorrect encryption key.', error)
  }
}
