import { ArweaveStorageSdkError } from './base-error'

export class GatewayTimeout extends ArweaveStorageSdkError {
  statusCode: number = 504

  constructor(message: string, error?: Error) {
    super(message, error)
  }
}
