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

export class UploadClient extends BackendClient {
  constructor() {
    super()
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

  async uploadFile(data: FileLike, uploadId: string, txId: string) {
    return this.uploadChunk(data, data.size, uploadId, txId)
  }

  private async uploadChunk(data: FileLike, fileSize: number, uploadId: string, txId: string) {
    const accessToken = await this.getAccessToken()
    const chunkSize = DEFAULT_CHUNK_SIZE_IN_BYTES
    const totalChunks = Math.ceil(fileSize / chunkSize)
    const arrayBuffer = await data.arrayBuffer()
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize
      const end = Math.min(arrayBuffer.byteLength, start + chunkSize)
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
