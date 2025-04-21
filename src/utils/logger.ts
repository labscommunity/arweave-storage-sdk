import { importDynamic } from './importDynamic'
import { isServer } from './platform'

const ERROR_LOG_FILE = 'arweave-storage-sdk-error.log'

export class Logger {
  static debug: boolean = false
  static logToFile: boolean = false
  private static fs: typeof import('fs') | null = null

  public static async init() {
    if (Logger.logToFile && isServer()) {
      Logger.fs = await importDynamic('fs')
    }
  }

  static error = async function (error: any) {
    if (this.debug) {
      console.error(error)
    }
    if (this.logToFile && isServer() && Logger.fs) {
      const logMessage = `${new Date().toISOString()} - ERROR - ${formatErrorLog(error)}\n`
      Logger.fs.appendFileSync(ERROR_LOG_FILE, logMessage)
    }
  }
  
  static log = function (message: any) {
    if (this.debug) {
      console.log(message)
    }
  }
  static warn = function (message: any) {
    if (this.debug) {
      console.warn(message)
    }
  }
}

const formatErrorLog = (error: any) => {
  const replacer = (key, value) => (key === '_sessionCache' ? undefined : value)
  const stringifiedError = JSON.stringify(error || {}, replacer, 2)
  return stringifiedError.length === 0 ? stringifiedError : error
}
