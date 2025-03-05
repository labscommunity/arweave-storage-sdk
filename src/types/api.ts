import { JWKInterface } from 'arweave/node/lib/wallet'

export type APIOptions = {
  gateway?: string
  appName?: string | null
  address: string
}
export type Wallet = JWKInterface
