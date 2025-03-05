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
import { throwError } from './utils/errors/error-factory'
import { FileSource } from './types/file'
import { createFileLike } from './utils/createFileLike'
import { getSDKTags, applyFileTags } from './utils/getSDKTags'
import { DEFAULT_CHUNK_SIZE_IN_BYTES } from './utils/constants'

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

  async quickUpload(data: FileSource, options: QuickUploadOptions) {
    //
    if (!this.ready || !this.wallet.signer) {
      return {
        success: false,
        data: null
      }
    }
    const overridedName = options.overrideFileName ? options.name : undefined
    const fileLike = await createFileLike(data, { ...options, name: overridedName, mimeType: options.dataContentType })
    if (fileLike.size === 0) {
      throwError(400, 'File size is 0')
    }

    const sdkTags = getSDKTags()

    const tags = applyFileTags(fileLike, [...options.tags, ...sdkTags, ...this.baseTags], this.wallet.address)

    let uploadType = 'SINGLE_FILE'
    let totalChunks = 1

    if (fileLike.size > DEFAULT_CHUNK_SIZE_IN_BYTES) {
      uploadType = 'MULTIPART_FILE'
      totalChunks = Math.ceil(fileLike.size / DEFAULT_CHUNK_SIZE_IN_BYTES)
    }

    const requestPayload = {
      fileName: options.name,
      mimeType: options.dataContentType,
      size: fileLike.size,
      uploadType,
      totalChunks,
      tokenTicker: this.config.token,
      network: this.wallet.chainInfo.network,
      chainId: this.wallet.chainInfo.chainId,
      tags: JSON.stringify(tags)
    }

    const response = await this.api.upload.createUploadRequest(requestPayload)

    if (!response) {
      throwError(400, 'Failed to create upload request')
    }

    const { paymentDetails, uploadRequest, token } = response
    const tokenLowercase = this.config.token?.toLowerCase()
    const amount = paymentDetails[tokenLowercase].amountInSubUnits
    const amountBn = BigInt(amount)

    const paymentReceipt = await this.paymentService.executePayment(
      {
        amountInSubUnits: amount,
        payAddress: paymentDetails.payAddress
      },
      token.address,
      amountBn
    )

    const uploadResponse = await this.api.upload.uploadFile(fileLike, tags, uploadRequest.id, paymentReceipt.hash)

    return uploadResponse
  }

  async getEstimates(size: number) {
    const response = await this.api.upload.getEstimates({
      size,
      chainId: this.wallet.chainInfo.chainId,
      chainType: this.wallet.chainInfo.chainType,
      network: this.wallet.chainInfo.network,
      tokenTicker: this.config.token
    })

    return response
  }
}

export interface QuickUploadOptions {
  name: string
  dataContentType: string
  tags: Tag[]
  size: number
  overrideFileName?: boolean
}
