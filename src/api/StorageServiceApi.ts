import axios from 'axios'
import { STORAGE_SERVICE_API_URL } from '../utils/constants'
import { WalletService } from '../wallet/WalletService'
import { Tag } from 'arweave/web/lib/transaction'
import { TokenStorage } from '../utils/TokenStorage'

export class StorageServiceApi {
  private readonly apiBaseUrl: string = STORAGE_SERVICE_API_URL
  private tokenStorage: TokenStorage
  private wallet: WalletService

  constructor(wallet: WalletService) {
    this.wallet = wallet
    this.tokenStorage = new TokenStorage(wallet.config.wallet === 'use_web_wallet')
  }

  async login() {
    if (!this.wallet.ready) {
      throw new Error('Wallet not ready')
    }

    // Check for existing valid tokens
    const accessToken = await this.tokenStorage.getAccessToken()
    const refreshToken = await this.tokenStorage.getRefreshToken()

    if (accessToken && refreshToken) {
      try {
        // Verify if the access token is still valid by making a test request
        const response = await axios.get(`${this.apiBaseUrl}/users/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })

        if (response.status === 200) {
          // Tokens are still valid, no need to login again
          return
        }

        // If access token is expired, try to refresh
        await this.refreshAccessToken()
        return
      } catch (error) {
        // Clear invalid tokens and proceed with new login
        this.tokenStorage.clearTokens()
      }
    }

    const nonceResponse = await axios.post(`${this.apiBaseUrl}/auth/nonce`, {
      walletAddress: this.wallet.address,
      chainType: this.wallet.chainType
    })

    if (nonceResponse.status !== 201 || !nonceResponse?.data?.data) {
      throw new Error('Failed to get nonce')
    }

    const nonce = nonceResponse?.data?.data

    const message = `
    Nonce: ${nonce}
    `
    const signature = await this.wallet.signer?.signMessage(message)

    const payload = {
      walletAddress: this.wallet.address,
      chainType: this.wallet.chainType,
      signedMessage: message,
      signature
    }

    const verifyResponse = await axios.post(`${this.apiBaseUrl}/auth/verify`, payload)

    if (verifyResponse.status !== 201 || !verifyResponse?.data?.data) {
      throw new Error('Failed to verify')
    }

    await this.tokenStorage.setAccessToken(verifyResponse?.data?.data?.accessToken)
    await this.tokenStorage.setRefreshToken(verifyResponse?.data?.data?.refreshToken)
  }

  async refreshAccessToken() {
    const accessToken = await this.tokenStorage.getAccessToken()
    const refreshToken = await this.tokenStorage.getRefreshToken()
    if (!refreshToken || !accessToken) {
      throw new Error('Refresh token or access token not found')
    }

    const response = await axios.post(
      `${this.apiBaseUrl}/auth/refresh`,
      {
        refreshToken
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )

    if (response.status !== 201 || !response?.data?.data) {
      throw new Error('Failed to refresh access token')
    }

    await this.tokenStorage.setAccessToken(response?.data?.data?.accessToken)
    await this.tokenStorage.setRefreshToken(response?.data?.data?.refreshToken)
  }

  async createUploadRequest(payload: CreateUploadRequestPayload) {
    const accessToken = await this.getAccessToken()

    const response = await axios.post(`${this.apiBaseUrl}/upload/create`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (response.status !== 201) {
      return {
        success: false,
        error: JSON.stringify(response.data.message)
      }
    }
    const data = response?.data?.data

    return {
      success: true,
      data
    }
  }

  async uploadFile(payload: UploadFilePayload) {
    const accessToken = await this.getAccessToken()

    const formData = new FormData()
    for (const [key, value] of Object.entries(payload)) {
      if (key === 'tags') {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, value)
      }
    }

    const response = await axios.post(`${this.apiBaseUrl}/upload`, formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.status !== 201) {
      return {
        success: false,
        error: JSON.stringify(response.data.message)
      }
    }
    const data = response?.data?.data

    return {
      success: true,
      data
    }
  }

  async getProfile() {
    const accessToken = await this.getAccessToken()

    const response = await axios.get(`${this.apiBaseUrl}/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (response.status !== 200) {
      return {
        success: false,
        error: JSON.stringify(response.data.message)
      }
    }
    const data = response?.data?.data
    return {
      success: true,
      data
    }
  }

  private async getAccessToken(): Promise<string> {
    const token = await this.tokenStorage.getAccessToken()
    if (!token) {
      throw new Error('Access token not found')
    }

    return token
  }
}

export interface CreateUploadRequestPayload {
  fileName: string
  mimeType: string
  size: number
  uploadType: string
  tokenTicker: string
  network: string
  chainId: number
}

export interface UploadFilePayload {
  transactionId: string
  file: File
  fileName: string
  mimeType: string
  tags: Tag[]
  requestId: string
}
