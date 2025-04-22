import { WalletService } from '../wallet/WalletService'
import { Tag } from 'arweave/web/lib/transaction'
import { AuthClient } from './auth/AuthClient'
import { UserClient } from './user/UserClient'
import { UploadClient } from './upload/UploadClient'
import { ArweaveWallet } from '../wallet/ArweaveWallet'
import { DriveService } from '../services/drive.service'
import { FolderService } from '../services/folder.service'
import { FileService } from '../services/file.service'
import { Crypto } from '../crypto'
import { EvmPaymentService } from '../services/evm-payment.service'

export class StorageServiceApi {
  public auth: AuthClient
  public user: UserClient
  public upload: UploadClient

  private wallet: WalletService
  private arweaveWallet: ArweaveWallet | null = null

  public crypto: Crypto | null = null
  public drive: DriveService | null = null
  public folder: FolderService | null = null
  public file: FileService | null = null
  public payment: EvmPaymentService

  baseTags: Tag[] = []

  constructor(wallet: WalletService, baseTags: Tag[]) {
    this.wallet = wallet
    this.auth = new AuthClient()
    this.user = new UserClient()
    this.payment = new EvmPaymentService(wallet) // TODO: after adding more chains, remove this
    this.upload = new UploadClient(this.payment, this.wallet)

    this.baseTags = baseTags

    // if (wallet.chainInfo.chainType === ChainType.evm) {
    //   this.payment = new EvmPaymentService(wallet)
    // }
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
    const signature = await this.wallet.signMessage(message)
    let publicKey

    try {
      publicKey = await this.wallet.getPublicKey()
    } catch (error) {
      console.warn(error)
    }

    const payload = {
      walletAddress: this.wallet.address,
      chainType: this.wallet.chainInfo.chainType,
      signedMessage: message,
      signature,
      publicKey
    }

    await this.auth.verify(payload)

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

    this.arweaveWallet = new ArweaveWallet(arKeys.jwk, arKeys.address, arKeys.publicKey, this.wallet.config.appName)
    this.crypto = new Crypto(this.arweaveWallet)
    this.upload.setArweaveWallet(this.arweaveWallet)
    this.upload.setCrypto(this.crypto)
    this.drive = new DriveService(this.arweaveWallet, this.baseTags, this.crypto, this.upload)
    this.folder = new FolderService(this.arweaveWallet, this.baseTags, this.crypto, this.upload)
    this.file = new FileService(this.arweaveWallet, this.baseTags, this.crypto, this.upload)
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
