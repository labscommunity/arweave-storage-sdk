import { Secp256k1Wallet } from '@cosmjs/amino'
import { ChainType } from '../types'
import { ChainInfo, NetworkChainMap } from '../utils/constants'
import { ADAPTERS } from './adapters'
import { WalletAdapter } from './adapters/WalletAdapter'
import { Configuration } from './Configuration'
import { Wallet, BrowserProvider, JsonRpcSigner, JsonRpcProvider } from 'ethers'

export class WalletService {
  public address: string | null = null
  public signer: Wallet | JsonRpcSigner | Secp256k1Wallet | null = null
  public ready: Promise<void>
  public chainInfo: ChainInfo

  private adapter: WalletAdapter

  constructor(public readonly config: Configuration) {
    const chainInfo = NetworkChainMap[this.config.network]
    this.chainInfo = chainInfo

    const chainType = chainInfo.chainType
    const WalletAdapter = ADAPTERS[chainType]

    this.adapter = new WalletAdapter(this.config)
    this.ready = this.adapter.initialize().then(() => {
      this.signer = this.adapter.signer
      this.address = this.adapter.address
    })
  }

  async signMessage(message: string) {
    return await this.adapter.signMessage(message)
  }

  async getPublicKey() {
    if (this.chainInfo.chainType !== ChainType.arweave && this.chainInfo.chainType !== ChainType.cosmos) {
      return null
    }

    return await this.adapter.getPublicKey()
  }
}
