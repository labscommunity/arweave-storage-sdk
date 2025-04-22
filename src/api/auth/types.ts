import { ChainType } from "../../types/wallet"

export interface VerifyAuthOptions {
  walletAddress: string
  chainType: ChainType
  signedMessage: string
  signature: string
  publicKey?: string
}
