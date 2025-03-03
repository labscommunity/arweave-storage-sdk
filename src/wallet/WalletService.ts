import { ChainInfo, NetworkChainMap } from '../utils/constants'
import { Configuration } from './Configuration'
import { Wallet, BrowserProvider, JsonRpcSigner } from 'ethers'

export class WalletService {
  public address: string | null = null
  public signer: Wallet | JsonRpcSigner | null = null
  public ready: Promise<void>
  public chainInfo: ChainInfo

  constructor(public readonly config: Configuration) {
    this.ready = this.initialize()
  }

  private async initialize() {
    this.chainInfo = NetworkChainMap[this.config.network]

    if (this.config.wallet === 'use_web_wallet') {
      const provider = new BrowserProvider(window.ethereum)
      this.signer = await provider.getSigner()
    } else {
      this.signer = new Wallet(this.config.wallet)
    }

    this.address = await this.signer.getAddress()
  }
}
