import axios from 'axios'
import { STORAGE_SERVICE_API_URL } from '../utils/constants'
import { WalletService } from '../wallet/WalletService'
import { Tag } from 'arweave/web/lib/transaction'
import { TokenStorage } from '../utils/TokenStorage'
import { throwError } from '../utils/errors/error-factory'
import { AuthClient } from './auth/AuthClient'
import { UserClient } from './user/UserClient'
import { UploadClient } from './upload/UploadClient'
import { ArweaveWallet } from '../wallet/ArweaveWallet'

export class StorageServiceApi {
  private wallet: WalletService
  public auth: AuthClient
  public user: UserClient
  public upload: UploadClient
  private arweaveWallet: ArweaveWallet | null = null

  constructor(wallet: WalletService) {
    this.wallet = wallet
    this.auth = new AuthClient()
    this.user = new UserClient()
    this.upload = new UploadClient()
  }

  async login() {
    if (!this.wallet.ready) {
      await this.wallet.ready
    }

    const hasActiveSession = await this.auth.hasActiveSession()

    if (hasActiveSession) {
      const address = await this.auth.getAddress()
      if (!address) {
        this.auth.logout()
        return
      }

      if (address !== this.wallet.address) {
        this.auth.logout()
        return
      }

      try {
        // Verify if the access token is still valid by making a test request
        await this.initializeArweaveWallet()
        return
      } catch (error) {
        if (error.statusCode === 401) {
          await this.auth.refreshAccessToken()
          return
        }

        // Clear invalid tokens and proceed with new login
        this.auth.logout()
      }
    }

    const nonce = await this.auth.generateNonce(this.wallet.address, this.wallet.chainInfo.chainType)

    const message = `
    Nonce: ${nonce}
    `
    const signature = await this.wallet.signer?.signMessage(message)

    const payload = {
      walletAddress: this.wallet.address,
      chainType: this.wallet.chainInfo.chainType,
      signedMessage: message,
      signature
    }

    await this.auth.verify(payload.walletAddress, payload.chainType, payload.signedMessage, payload.signature)

    await this.initializeArweaveWallet()
  }

  async refreshAccessToken() {
    await this.auth.refreshAccessToken()
  }

  async getUser() {
    const user = await this.user.getUser()

    return user
  }

  private async initializeArweaveWallet() {
    const arKeys = await this.user.getUserArweaveWallet()

    this.arweaveWallet = new ArweaveWallet(arKeys.jwk, arKeys.address, arKeys.publicKey)
    this.upload.setArweaveWallet(this.arweaveWallet)
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
  tags: Tag[]
}

export interface UploadFilePayload {
  transactionId: string
  file: File
  fileName: string
  mimeType: string
  tags: Tag[]
  requestId: string
}
