import { JWKInterface } from 'arweave/web/lib/wallet'

export interface GetArKeysResponse {
  jwk: JWKInterface
  publicKey: string
  address: string
}

export interface PaymentTransaction {
  id: string
  userWalletAddress: string
  tokenId: string
  amount: string
  amountInSubUnits: string
  status: 'PENDING' | 'SUCCEEDED'
  transactionHash: string | null
  createdAt: string
  updatedAt: string
}

export interface Tag {
  name: string
  value: string
}

export interface Upload {
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
  status: 'NOT_STARTED' | 'COMPLETED'
  uploadType: string
  tags: Tag[]
  userWalletAddress: string
  createdAt: string
  updatedAt: string
}

export interface Receipt {
  id: string
  userWalletAddress: string
  status: 'COMPLETED'
  createdAt: string
  updatedAt: string
  tokenId: string
  uploadId: string
}

export interface GetUserResponse {
  id: number
  walletAddress: string
  chainType: string
  role: string
  nonce: string | null
  domain: string | null
  issuedAt: string
  lastSignature: string
  createdAt: string
  updatedAt: string
  paymentTransactions: PaymentTransaction[]
  uploads: Upload[]
  receipts: Receipt[]
}
