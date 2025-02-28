import { Tag } from 'arweave/web/lib/transaction'

// import { ArFSApi } from './api'
// import { Crypto } from './crypto'
// import { DriveService } from './services/drive.service'
// import { FileService } from './services/file.service'
// import { FolderService } from './services/folder.service'
import { Configuration } from './wallet/Configuration'
import { WalletService } from './wallet/WalletService'
import { StorageServiceApi } from './api'
import { Contract, JsonRpcSigner, parseUnits } from 'ethers'

export class StorageApi {
  public api: StorageServiceApi
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
      network: 'mainnet',
      chainId: 8453
    }

    const response = await this.api.createUploadRequest(requestPayload)

    if (!response.success) {
      return {
        success: false,
        data: null
      }
    }

    const { paymentDetails, uploadRequest } = response.data
    const ERC20_ABI = ['function transfer(address recipient, uint256 amount) external returns (bool)']
    const signer = this.wallet.signer as JsonRpcSigner
    const tokenContract = new Contract(options.tokenAddress, ERC20_ABI, signer)
    const tokenLowercase = this.config.token?.toLowerCase()
    const amount = paymentDetails[tokenLowercase].amount
    const amountBn = parseUnits(amount, 6)
    // const contractData = tokenContract.interface.encodeFunctionData('transfer', [paymentDetails.payAddress, amountBn])
    const contractSigner = tokenContract.connect(signer) as any;
    
    const tx = await contractSigner.transfer(paymentDetails.payAddress, amountBn)

    const receipt = await tx.wait()

    if (!receipt || receipt.status !== 1) {
      throw new Error('Upload transaction failed')
    }
    await new Promise(resolve => setTimeout(resolve, 5000))

    const uploadResponse = await this.api.uploadFile({
      transactionId: tx.hash,
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
  tokenAddress: string
}
