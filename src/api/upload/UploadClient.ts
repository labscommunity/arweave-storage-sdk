import { Tag } from 'arweave/web/lib/transaction'
import { throwError } from '../../utils/errors/error-factory'
import { BackendClient } from '../BackendClient'
import {
  CreateUploadRequestPayload,
  CreateUploadRequestResponse,
  GetEstimatesPayload,
  GetEstimatesResponse,
  UploadChunkResponse
} from './upload-client.types'
import { jsonToBase64 } from '../../utils/encoding'
import { DEFAULT_CHUNK_SIZE_IN_BYTES } from '../../utils/constants'
import { FileLike } from '../../types/file'
import { ArweaveWallet } from '../../wallet/ArweaveWallet'
import { Bundle, DataItem, bundleAndSignData, createData } from 'arbundles'

export class UploadClient extends BackendClient {
  private arweaveWallet: ArweaveWallet | null = null
  constructor() {
    super()
  }

  setArweaveWallet(wallet: ArweaveWallet) {
    this.arweaveWallet = wallet
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

  // expects DataItem unsigned
  async uploadFile(data: FileLike, tags: Tag[], uploadId: string, txId: string) {
    if (!this.arweaveWallet) {
      throwError(500, 'Arweave wallet not initialized')
    }

    const fileBuffer = await data.arrayBuffer()
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
