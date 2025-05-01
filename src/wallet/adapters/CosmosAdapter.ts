// ArweaveAdapter.ts
import { WalletAdapter } from './WalletAdapter'
import { Configuration } from '../Configuration'
import { isServer } from '../../utils/platform'
import { makeSignDoc, Secp256k1Wallet } from '@cosmjs/amino'
import { CosmosChainMap, NetworkChainMap } from '../../utils/constants'
import { throwError } from '../../utils/errors/error-factory'
import { encodeBase64 } from 'ethers'

export class CosmosAdapter implements WalletAdapter {
  public signer!: Secp256k1Wallet // arweave instance + key
  public address!: string
  public publicKey!: string
  constructor(private readonly config: Configuration) {}

  async initialize() {
    const network = this.config.network
    const cosmosChain = NetworkChainMap[network]
    const appChainId = CosmosChainMap[cosmosChain.chainId] // e.g., "noble-1"
    const bech32Prefix = appChainId.split('-')[0] // Extract "noble"

    if (isServer() && this.config.wallet !== 'use_web_wallet') {
      if (!/^[0-9a-fA-F]{64}$/.test(this.config.wallet.slice(2))) {
        throwError(500, 'CosmosAdapter: expected 64-char hex private key')
      }
      const privBytes = Uint8Array.from(Buffer.from(this.config.wallet.slice(2), 'hex'))
      const walletObj = await Secp256k1Wallet.fromKey(privBytes, bech32Prefix)

      this.signer = walletObj
      const [acct] = await walletObj.getAccounts()
      this.address = acct.address
      this.publicKey = encodeBase64(acct.pubkey)
    } else {
      throwError(500, 'CosmosAdapter: use_web_wallet not supported')
    }
  }

  async signMessage(message: string): Promise<string> {
    const signDoc = makeSignDoc(
      [
        {
          type: 'sign/MsgSignData',
          value: {
            signer: this.address,
            data: message
          }
        }
      ],
      { gas: '0', amount: [] }, // StdFee
      '', // chainId
      '', // memo
      0, // accountNumber
      0 // sequence
    )
    const signRes = await this.signer.signAmino(this.address, signDoc)

    return signRes.signature.signature
  }

  async getPublicKey() {
    return this.publicKey
  }
}
