import axios from 'axios'
import { STORAGE_SERVICE_API_URL } from '../utils/constants'
import { WalletService } from '../wallet/WalletService'
import { Tag } from 'arweave/web/lib/transaction'

export class StorageServiceApi {
  private readonly apiBaseUrl: string = STORAGE_SERVICE_API_URL
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private wallet: WalletService

  constructor(wallet: WalletService) {
    this.wallet = wallet
  }

  async login() {
    if (!this.wallet.ready) {
      throw new Error('Wallet not ready')
    }

    const nonceResponse = await axios.post(`${this.apiBaseUrl}/auth/nonce`, {
      walletAddress: this.wallet.address,
      chainType: this.wallet.chainType
    })

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

    this.accessToken = verifyResponse?.data?.data?.accessToken
    this.refreshToken = verifyResponse?.data?.data?.refreshToken
  }

  async refreshAccessToken() {
    const response = await axios.post(`${this.apiBaseUrl}/auth/refresh`, {
      refreshToken: this.refreshToken
    })

    this.accessToken = response?.data?.data?.accessToken
    this.refreshToken = response?.data?.data?.refreshToken
  }

  async createUploadRequest(payload: CreateUploadRequestPayload) {
    if (!this.accessToken) {
      throw new Error('Access token not found')
    }

    const response = await axios.post(`${this.apiBaseUrl}/upload/create`, payload, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`
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
    if (!this.accessToken) {
      throw new Error('Access token not found')
    }

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
        Authorization: `Bearer ${this.accessToken}`,
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
    if (!this.accessToken) {
      throw new Error('Access token not found')
    }

    const response = await axios.get(`${this.apiBaseUrl}/users/me`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`
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
