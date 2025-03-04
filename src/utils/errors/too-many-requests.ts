import { ArweaveStorageSdkError } from './base-error'

export class TooManyRequests extends ArweaveStorageSdkError {
  statusCode: number = 429

  constructor(message: string, error?: Error) {
    super(message, error);
  }
}