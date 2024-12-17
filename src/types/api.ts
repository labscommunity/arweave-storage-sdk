import { JWKInterface } from 'arweave/node/lib/wallet'

export type APIOptions = {
  gateway?: string
  wallet: Wallet
  appName?: string | null
}
export type Wallet = JWKInterface | 'use_wallet'
