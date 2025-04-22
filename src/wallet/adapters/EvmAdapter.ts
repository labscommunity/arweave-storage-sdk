// EvmAdapter.ts
import { WalletAdapter } from './WalletAdapter'
import { Configuration } from '../Configuration'
import { BrowserProvider, JsonRpcProvider, JsonRpcSigner, Wallet as EthersWallet } from 'ethers'
import { NetworkChainMap } from '../../utils/constants'

export class EvmAdapter implements WalletAdapter {
  public signer!: EthersWallet | JsonRpcSigner
  public address!: string

  constructor(private readonly config: Configuration) {}

  async initialize() {
    const chainInfo = NetworkChainMap[this.config.network]
    if (this.config.wallet === 'use_web_wallet') {
      const provider = new BrowserProvider(window.ethereum)
      this.signer    = await provider.getSigner()
    } else {
      const provider = new JsonRpcProvider(chainInfo.rpcUrl)
      this.signer    = new EthersWallet(this.config.wallet, provider)
    }
    this.address = await this.signer.getAddress()
  }

  async signMessage(message: string) {
    return await this.signer.signMessage(message)
  }
}
