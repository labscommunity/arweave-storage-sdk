import { Tag } from 'arweave/web/lib/transaction'

// import { ArFSApi } from './api'
// import { Crypto } from './crypto'
// import { DriveService } from './services/drive.service'
// import { FileService } from './services/file.service'
// import { FolderService } from './services/folder.service'
import { Configuration } from './wallet/Configuration'
import { WalletService } from './wallet/WalletService'
import { StorageServiceApi } from './api'
import { PaymentService } from './services/payment.service'
import { ChainType } from './types'
import { EvmPaymentService } from './services/evm-payment.service'

export class StorageApi {
  public api: StorageServiceApi
  public paymentService: PaymentService
  // public crypto: Crypto
  // public drive: DriveService
  // public folder: FolderService
  // public file: FileService
  public appName: string | null = null
  public baseTags: Tag[] = []
  public wallet: WalletService

  constructor(public readonly config: Configuration) {
    if (this.config.appName) {
      this.baseTags.push({ name: 'App-Name', value: config.appName } as Tag)
      this.appName = config.appName
    }

    const wallet = new WalletService(config)
    this.wallet = wallet
    this.api = new StorageServiceApi(wallet)

    if (wallet.chainInfo.chainType === ChainType.evm) {
      this.paymentService = new EvmPaymentService(this.wallet)
    }
    // this.api = new ArFSApi({ gateway, wallet, appName: this.appName })
    // this.crypto = new Crypto(this.api)

    // this.drive = new DriveService(this.api, this.baseTags, this.crypto)
    // this.folder = new FolderService(this.api, this.baseTags, this.crypto)
    // this.file = new FileService(this.api, this.baseTags, this.crypto)
  }

  get ready() {
    return this.wallet.ready
  }

  async quickUpload(data: File, options: QuickUploadOptions) {
    //
    if (!this.ready || !this.wallet.signer) {
      return {
        success: false,
        data: null
      }
    }

    const requestPayload = {
      fileName: options.name,
      mimeType: options.dataContentType,
      size: options.size,
      uploadType: 'SINGLE_FILE',
      totalChunks: 1,
      tokenTicker: this.config.token,
      network: this.wallet.chainInfo.network,
      chainId: this.wallet.chainInfo.chainId
    }

    const response = await this.api.createUploadRequest(requestPayload)

    if (!response.success) {
      return response
    }

    const { paymentDetails, uploadRequest, token } = response.data
    const tokenLowercase = this.config.token?.toLowerCase()
    const amount = paymentDetails[tokenLowercase].amountInSubUnits
    const amountBn = BigInt(amount)

    const paymentReceipt = await this.paymentService.executePayment({
      amountInSubUnits: amount,
      payAddress: paymentDetails.payAddress
    }, token.address, amountBn)

    const uploadResponse = await this.api.uploadFile({
      transactionId: paymentReceipt.hash,
      file: data,
      fileName: options.name,
      mimeType: options.dataContentType,
      tags: options.tags,
      requestId: uploadRequest.id
    })

    return uploadResponse
  }
}

export interface QuickUploadOptions {
  name: string
  dataContentType: string
  tags: Tag[]
  size: number
}
