// ArweaveAdapter.ts
import { WalletAdapter } from './WalletAdapter'
import { Configuration } from '../Configuration'
import Arweave from 'arweave'
import { arweaveInstance } from '../../utils/arweaveInstance'
import { isServer } from '../../utils/platform'
import { JWKInterface } from 'arweave/web/lib/wallet'
import { arrayToBase64 } from '../../utils/encoding'

export class ArweaveAdapter implements WalletAdapter {
  public signer!: JWKInterface | 'use_wallet' // arweave instance + key
  public address!: string

  constructor(private readonly config: Configuration) {}

  async initialize() {
    if (isServer() && this.config.wallet !== 'use_web_wallet') {
      const walletJWK = JSON.parse(this.config.wallet)
      this.signer = walletJWK as JWKInterface
      this.address = await arweaveInstance.wallets.jwkToAddress(walletJWK)
    } else {
      this.signer = 'use_wallet'
      this.address = await arweaveInstance.wallets.jwkToAddress('use_wallet')
    }
  }

  async signMessage(message: string) {
    if (this.signer === 'use_wallet') {
      const signature = await window.arweaveWallet.signMessage(message)
      const base64Signature = arweaveInstance.utils.bufferTob64(signature)

      return base64Signature
    }

    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      this.signer,
      {
        name: 'RSA-PSS',
        hash: 'SHA-256'
      },
      false,
      ['sign']
    )

    const hash = await crypto.subtle.digest('SHA-256', arweaveInstance.utils.stringToBuffer(message))
    const signature = await crypto.subtle.sign({ name: 'RSA-PSS', saltLength: 32 }, cryptoKey, hash)
    const base64Signature = arrayToBase64(signature)

    return base64Signature
  }

  async getPublicKey() {
    if (this.signer === 'use_wallet') {
      return await window.arweaveWallet.getActivePublicKey()
    }

    return this.signer.n
  }
}
