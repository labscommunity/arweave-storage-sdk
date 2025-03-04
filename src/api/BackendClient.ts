import { STORAGE_SERVICE_API_URL } from '../utils/constants'
import { TokenStorage } from '../utils/TokenStorage'
import { AxiosInstance } from 'axios'
import { httpClient } from './http'
import { throwError } from '../utils/errors/error-factory'

export class BackendClient {
  public readonly apiBaseUrl: string = STORAGE_SERVICE_API_URL
  protected tokenStorage: TokenStorage
  protected httpClient: AxiosInstance

  constructor() {
    this.tokenStorage = new TokenStorage()
    this.httpClient = httpClient
  }

  protected async getAccessToken() {
    const accessToken = await this.tokenStorage.getAccessToken()
    if (!accessToken) {
      throwError(401, 'Unauthorized request. Please login and try again.')
    }

    return accessToken
  }
}
