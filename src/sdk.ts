import { Tag } from 'arweave/web/lib/transaction'

import { Configuration } from './wallet/Configuration'
import { WalletService } from './wallet/WalletService'
import { StorageServiceApi } from './api'
import { throwError } from './utils/errors/error-factory'
import { FileSource } from './types/file'

import { QuickUploadOptions } from './api/upload/upload-client.types'

export class StorageApi {
  public api: StorageServiceApi

  public appName: string | null = null
  public baseTags: Tag[] = []
  public wallet: WalletService

  constructor(public readonly config: Configuration) {
    if (this.config.appName) {
      this.baseTags.push({ name: 'App-Name', value: config.appName } as Tag)
      this.appName = config.appName
    }

    this.wallet = new WalletService(config)
    this.api = new StorageServiceApi(this.wallet, this.baseTags)
  }

  get ready() {
    return this.wallet.ready
  }

  async quickUpload(data: FileSource, options: QuickUploadOptions) {
    if (!this.ready || !this.wallet.signer) {
      throwError(500, 'Wallet not ready')
    }

    return this.api.upload.quickUpload(data, options)
  }

  async downloadFile(uploadId: string) {
    await this.api.upload.downloadFile(uploadId)
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
