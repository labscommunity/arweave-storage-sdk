import { Logger } from '../logger'

export class ArweaveStorageSdkError extends Error {
  statusCode: number
  requestId: string

  constructor(message: string, error?: Error) {
    super(message)
    this.requestId = (<any>error)?.response?.headers?.['request-id']
    Logger.error(this)
    Logger.error('Failed request id: ' + this.requestId)
    if (error) {
      Logger.error(error)
    }
  }
}
