import { Tag } from 'arweave/web/lib/transaction'
import { throwError } from '../../utils/errors/error-factory'
import { BackendClient } from '../BackendClient'
import {
  CreateUploadRequestPayload,
  CreateUploadRequestResponse,
  DownloadFileOptions,
  DownloadFromArweaveOptions,
  GetEstimatesPayload,
  GetEstimatesResponse,
  QuickUploadOptions,
  UploadChunkResponse,
  UploadDataItemOptions,
  UploadVisibility
} from './upload-client.types'
import { DEFAULT_CHUNK_SIZE_IN_BYTES } from '../../utils/constants'
import { FileLike, FileSource } from '../../types/file'
import { ArweaveWallet } from '../../wallet/ArweaveWallet'
import { Bundle, DataItem, bundleAndSignData, createData } from 'arbundles'
import { EvmPaymentService } from '../../services/evm-payment.service'
import { createFileLike } from '../../utils/createFileLike'
import { applyFileTags, getSDKTags } from '../../utils/getSDKTags'
import { WalletService } from '../../wallet/WalletService'
import { deriveQuickUploadKey } from '../../crypto/utils/keys'
import { Crypto } from '../../crypto'
import { isServer } from '../../utils/platform'
import { importDynamic } from '../../utils/importDynamic'
import { StreamConverter } from '../../utils/stream-converter'

export class UploadClient extends BackendClient {
  private arweaveWallet: ArweaveWallet | null = null
  private payment: EvmPaymentService
  private wallet: WalletService
  private crypto: Crypto

  constructor(payment: EvmPaymentService, wallet: WalletService) {
    super()
    this.payment = payment
    this.wallet = wallet
  }

  setArweaveWallet(arweaveWallet: ArweaveWallet) {
    this.arweaveWallet = arweaveWallet
  }

  setCrypto(crypto: Crypto) {
    this.crypto = crypto
  }

  async downloadFile(options: DownloadFileOptions) {
    const accessToken = await this.getAccessToken()

    const { uploadId, skipSave, path } = options

    const data = await this.getUploadById(uploadId)

    const { arweaveTxId, mimeType, fileName } = data

    return this.downloadFileFromArweave({ uploadId, arweaveTxId, fileName, mimeType, skipSave, path })
  }

  async downloadFileFromArweave(options: DownloadFromArweaveOptions) {
    const { arweaveTxId, fileName, mimeType, skipSave, path, uploadId } = options

    const txDataRes = await fetch(`https://arweave.net/${arweaveTxId}`)
    let dataArrayBuffer = await txDataRes.arrayBuffer()

    const cipherIV = await this.arweaveWallet.queryEngine?.argql.fetchTxTag(arweaveTxId, 'Cipher-IV')

    if (cipherIV) {
      const { aesKey } = await deriveQuickUploadKey(this.arweaveWallet.getPrivateKey(), uploadId)
      const decryptedFileBuffer = await this.crypto.decryptEntity(aesKey, cipherIV, dataArrayBuffer)
      dataArrayBuffer = decryptedFileBuffer
    }

    if (isServer()) {
      const fs = importDynamic('fs')
      return new Promise((resolve, reject) => {
        const filePath = `${path || process.cwd()}/${fileName}`
        fs.writeFile(filePath, Buffer.from(dataArrayBuffer), (error) => {
          if (error) reject(error)
          resolve(filePath)
        })
      })
    } else {
      const blob = new Blob([dataArrayBuffer], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      if (!skipSave) {
        const a = document.createElement('a')
        a.download = path
        a.href = url
        a.click()
      }
      return url
    }
  }

  async getUploads({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
    const accessToken = await this.getAccessToken()

    const response = await this.httpClient.get(`/upload?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (response.status !== 200) {
      throwError(response.status, response?.data?.message)
    }

    return response.data.data
  }

  async getReceipts({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
    const accessToken = await this.getAccessToken()

    const response = await this.httpClient.get(`/receipt?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (response.status !== 200) {
      throwError(response.status, response?.data?.message)
    }

    return response.data.data
  }

  async getUploadById(uploadId: string) {
    const accessToken = await this.getAccessToken()

    const response = await this.httpClient.get(`/upload/${uploadId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (response.status !== 200) {
      throwError(response.status, response?.data?.message)
    }

    return response.data.data
  }

  async getReceiptById(receiptId: string) {
    const accessToken = await this.getAccessToken()

    const response = await this.httpClient.get(`/upload/receipt/${receiptId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (response.status !== 200) {
      throwError(response.status, response?.data?.message)
    }

    return response.data.data
  }

  async quickUpload(data: FileSource, options: QuickUploadOptions) {
    await this.getAccessToken()

    const overridedName = options.overrideFileName ? options.name : undefined
    const fileLike = await createFileLike(data, { ...options, name: overridedName, mimeType: options.dataContentType })

    if (fileLike.size === 0) {
      throwError(400, 'File size is 0')
    }

    const sdkTags = getSDKTags()
    const tags = applyFileTags(fileLike, [...options.tags, ...sdkTags], this.wallet.address)

    let uploadType = 'SINGLE_FILE'
    let totalChunks = 1

    if (fileLike.size > DEFAULT_CHUNK_SIZE_IN_BYTES) {
      uploadType = 'MULTIPART_FILE'
      totalChunks = Math.ceil(fileLike.size / DEFAULT_CHUNK_SIZE_IN_BYTES)
    }

    const requestPayload = {
      fileName: options.name || fileLike.name,
      mimeType: options.dataContentType || fileLike.type || 'application/octet-stream',
      size: fileLike.size,
      uploadType,
      totalChunks,
      tokenTicker: this.wallet.config.token,
      network: this.wallet.chainInfo.network,
      chainId: this.wallet.chainInfo.chainId,
      tags: JSON.stringify(tags)
    }

    const response = await this.createUploadRequest(requestPayload)

    if (!response) {
      throwError(400, 'Failed to create upload request')
    }

    const { paymentDetails, uploadRequest, token } = response
    const tokenLowercase = this.wallet.config.token.toLowerCase()
    const amount = paymentDetails[tokenLowercase].amountInSubUnits
    const amountBn = BigInt(amount)

    const paymentReceipt = await this.payment.executePayment(
      {
        amountInSubUnits: amount,
        payAddress: paymentDetails.payAddress
      },
      token.address,
      amountBn
    )

    tags.push({ name: 'Upload-Request-ID', value: uploadRequest.id } as Tag)

    const uploadResponse = await this.uploadFile(
      fileLike,
      tags,
      uploadRequest.id,
      paymentReceipt.hash,
      options.visibility
    )

    return uploadResponse
  }

  async uploadDataItem(dataItem: DataItem, options: UploadDataItemOptions) {
    await this.getAccessToken()

    if (!dataItem.tags.find((tag) => tag.name === 'Owner')) {
      dataItem.tags.push({ name: 'Owner', value: this.wallet.address })
    }

    const dataBuffer = dataItem.getRaw()
    const size = dataBuffer.byteLength

    let uploadType = 'SINGLE_FILE'
    let totalChunks = 1
    if (size > DEFAULT_CHUNK_SIZE_IN_BYTES) {
      uploadType = 'MULTIPART_FILE'
      totalChunks = Math.ceil(size / DEFAULT_CHUNK_SIZE_IN_BYTES)
    }

    const requestPayload = {
      fileName: options.name,
      mimeType: options.dataContentType,
      size,
      uploadType,
      totalChunks,
      tokenTicker: this.wallet.config.token,
      network: this.wallet.chainInfo.network,
      chainId: this.wallet.chainInfo.chainId,
      tags: JSON.stringify(dataItem.tags)
    }

    const response = await this.createUploadRequest(requestPayload)

    if (!response) {
      throwError(400, 'Failed to create upload request')
    }

    const { paymentDetails, uploadRequest, token } = response
    const tokenLowercase = this.wallet.config.token.toLowerCase()
    const amount = paymentDetails[tokenLowercase].amountInSubUnits
    const amountBn = BigInt(amount)

    const paymentReceipt = await this.payment.executePayment(
      {
        amountInSubUnits: amount,
        payAddress: paymentDetails.payAddress
      },
      token.address,
      amountBn
    )

    dataItem.tags.push({ name: 'Upload-Request-ID', value: uploadRequest.id } as Tag)

    const bundle = await bundleAndSignData([dataItem], this.arweaveWallet.signer)

    await this.uploadChunk(bundle, uploadRequest.id, paymentReceipt.hash)

    return dataItem.id
  }

  async createUploadRequest(payload: CreateUploadRequestPayload): Promise<CreateUploadRequestResponse> {
    if (!payload.tags) {
      payload.tags = JSON.stringify([])
    }

    const accessToken = await this.getAccessToken()

    const response = await this.httpClient.post('/upload/create', payload, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (response.status !== 201) {
      throwError(response.status, response?.data?.message)
    }

    return response.data.data
  }

  async getEstimates(payload: GetEstimatesPayload): Promise<GetEstimatesResponse> {
    const accessToken = await this.getAccessToken()

    const response = await this.httpClient.post('/upload/cost', payload, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (response.status !== 201) {
      throwError(response.status, response?.data?.message)
    }

    return response.data.data
  }

  // expects filelike
  async uploadFile(
    data: FileLike,
    tags: Tag[],
    uploadId: string,
    txId: string,
    visibility: UploadVisibility = 'public'
  ) {
    if (!this.arweaveWallet) {
      throwError(500, 'Arweave wallet not initialized')
    }

    if (visibility === 'private' && !this.crypto) {
      throwError(500, 'Crypto utils not initialized')
    }

    let fileBuffer = await data.arrayBuffer()
    // encrypt the file buffer using the aesKey for quick upload
    if (visibility === 'private') {
      const { aesKey } = await deriveQuickUploadKey(this.arweaveWallet.getPrivateKey(), uploadId)
      const { data: encryptedData, cipher, cipherIV } = await this.crypto.encryptEntity(fileBuffer, aesKey)
      fileBuffer = encryptedData
      tags.push({ name: 'Cipher', value: cipher } as Tag)
      tags.push({ name: 'Cipher-IV', value: cipherIV } as Tag)
    }

    const dataItem = createData(new Uint8Array(fileBuffer), this.arweaveWallet.signer, { tags })
    const bundle = await bundleAndSignData([dataItem], this.arweaveWallet.signer)

    return this.uploadChunk(bundle, uploadId, txId)
  }

  private async uploadChunk(data: Bundle, uploadId: string, txId: string) {
    const accessToken = await this.getAccessToken()

    const arrayBuffer = data.getRaw()
    const size = arrayBuffer.byteLength

    const chunkSize = DEFAULT_CHUNK_SIZE_IN_BYTES
    const totalChunks = Math.ceil(size / chunkSize)

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize
      const end = Math.min(size, start + chunkSize)
      // ArrayBuffer.slice() returns a new ArrayBuffer containing the extracted portion.
      const chunk = arrayBuffer.slice(start, end)

      try {
        const headers = {
          Authorization: `Bearer ${accessToken}`,
          'x-current-chunk': chunkIndex.toString(),
          'x-total-chunks': totalChunks.toString(),
          'x-upload-id': uploadId,
          'x-txn-hash': txId,
          'Content-Type': 'application/octet-stream'
        }
        const response = await this.httpClient.post('/upload/chunk', chunk, {
          headers
        })
        if (response.status !== 201) {
          throwError(response.status, response?.data?.message)
        }
        const data = response.data.data as UploadChunkResponse
        if (data.status === 'COMPLETED' && data.receipt) {
          return data.receipt
        }
      } catch (error) {
        console.error(`Error uploading chunk ${chunkIndex}:`, error)
        throwError(error)
      }
    }

    throwError(500, 'Internal error occured while uploading file chunks.')
  }
}
