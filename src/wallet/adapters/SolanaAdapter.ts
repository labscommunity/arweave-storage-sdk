// ArweaveAdapter.ts
import { WalletAdapter } from './WalletAdapter'
import { Configuration } from '../Configuration'
import { arweaveInstance } from '../../utils/arweaveInstance'
import { isServer } from '../../utils/platform'
import { JWKInterface } from 'arweave/web/lib/wallet'

export class SolanaAdapter implements WalletAdapter {
  public signer!: JWKInterface // arweave instance + key
  public address!: string

  constructor(private readonly config: Configuration) {}

  async initialize() {
    if (isServer() && this.config.wallet !== 'use_web_wallet') {
      const walletJWK = JSON.parse(this.config.wallet)
      this.signer = walletJWK as JWKInterface
      this.address = await arweaveInstance.wallets.jwkToAddress(walletJWK)
    } else {
      this.signer = await arweaveInstance.wallets.generate()
      this.address = await arweaveInstance.wallets.jwkToAddress(this.signer)
    }
  }

  signMessage(message: string): Promise<string> {
    return Promise.resolve('')
  }
}
