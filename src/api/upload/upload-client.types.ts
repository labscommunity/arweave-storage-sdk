import { Tag } from 'arweave/web/lib/transaction'
import { ChainNetwork, ChainType } from '../../types'

export interface CreateUploadRequestPayload {
  fileName: string
  mimeType: string
  size: number
  uploadType: string
  tokenTicker: string
  network: string
  chainId: number
  tags: string
}

export interface UploadFilePayload {
  transactionId: string
  file: File
  fileName: string
  mimeType: string
}

export interface GetEstimatesPayload {
  size: number
  tokenTicker: Token
  network: ChainNetwork
  chainId: number
  chainType: ChainType
}

export interface GetEstimatesResponse {
  size: number
  usd: number
  usdc: {
    amount: string
    amountInSubUnits: string
  }
  payAddress: string
}

export interface PaymentTransaction {
  id: string
  userWalletAddress: string
  tokenId: string
  amount: string
  amountInSubUnits: string
  status: string
  transactionHash: string | null
  createdAt: string
  updatedAt: string
}

export interface Token {
  id: string
  address: string
  name: string
  ticker: string
  decimals: number
  chainType: string
  chainId: number
  network: string
  createdAt: string
  updatedAt: string
}

export interface PaymentDetails {
  size: number
  usd: number
  usdc: {
    amount: string
    amountInSubUnits: string
  }
  payAddress: string
}

export interface UploadRequest {
  id: string
  fileName: string
  mimeType: string
  totalChunks: number
  currentChunk: number
  fileLocation: string | null
  arweaveTxId: string | null
  size: number
  uploadEstimate: string
  uploadEstimateUSD: string
  paymentTransactionId: string
  status: string
  uploadType: string
  tags: string[]
  userWalletAddress: string
  createdAt: string
  updatedAt: string
}

export interface CreateUploadRequestResponse {
  uploadRequest: UploadRequest
  paymentTransaction: PaymentTransaction
  paymentDetails: PaymentDetails
  token: Token
}

export interface UploadChunkResponse {
  status: string
  totalChunks: number
  currentChunk: number
  progress: number
  receipt?: any
}
