import { ChainType } from '../../types'
import { throwError } from '../../utils/errors/error-factory'
import { BackendClient } from '../BackendClient'
import { VerifyAuthOptions } from './types'

export class AuthClient extends BackendClient {
  constructor() {
    super()
  }

  async generateNonce(walletAddress: string, chainType: ChainType) {
    const response = await this.httpClient.post('/auth/nonce', {
      walletAddress,
      chainType
    })

    if (response.status !== 201 || !response?.data?.data) {
      throwError(response.status, response?.data?.message)
    }

    const nonce = response?.data?.data
    return nonce as string
  }

  async verify(options: VerifyAuthOptions) {
    const { walletAddress, chainType, signedMessage, signature, publicKey } = options

    const response = await this.httpClient.post('/auth/verify', {
      walletAddress,
      chainType,
      signedMessage,
      signature,
      publicKey
    })

    if (response.status !== 201 || !response?.data?.data) {
      throwError(response.status, response?.data?.message)
    }

    const accessToken = response?.data?.data?.accessToken
    const refreshToken = response?.data?.data?.refreshToken

    if (!accessToken || !refreshToken) {
      throwError(500, 'Something went wrong while verifying the user')
    }

    await this.tokenStorage.setAccessToken(accessToken)
    await this.tokenStorage.setRefreshToken(refreshToken)
    await this.tokenStorage.setAddress(walletAddress)
  }

  async refreshAccessToken() {
    const accessToken = await this.tokenStorage.getAccessToken()
    const refreshToken = await this.tokenStorage.getRefreshToken()

    if (!refreshToken || !accessToken) {
      throwError(400, 'Unauthorized request. Please login again.')
    }

    const response = await this.httpClient.post('/auth/refresh', {
      refreshToken
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (response.status !== 201 || !response?.data?.data) {
      throwError(response.status, response?.data?.message)
    }

    const newAccessToken = response?.data?.data?.accessToken
    const newRefreshToken = response?.data?.data?.refreshToken

    if (!newAccessToken || !newRefreshToken) {
      throwError(500, 'Something went wrong while refreshing the access token')
    }

    await this.tokenStorage.setAccessToken(newAccessToken)
    await this.tokenStorage.setRefreshToken(newRefreshToken)
  }

  async getAddress() {
    return await this.tokenStorage.getAddress()
  }

  async hasActiveSession() {
    const accessToken = await this.tokenStorage.getAccessToken()
    const refreshToken = await this.tokenStorage.getRefreshToken()

    return !!accessToken && !!refreshToken
  }

  async logout() {
    await this.tokenStorage.clearTokens()
  }
}
