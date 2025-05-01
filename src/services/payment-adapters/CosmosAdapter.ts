import { WalletService } from '../../wallet/WalletService'
import { TransactionReceipt, PaymentDetails } from './types'
import { PaymentAdapter } from './PaymentAdapter'
import { coin, coins, SigningStargateClient, GasPrice } from '@cosmjs/stargate'
import { Secp256k1Wallet } from '@cosmjs/amino'
import { CosmosChainMap } from '../../utils/constants'

export class CosmosAdapter implements PaymentAdapter {
  constructor(private wallet: WalletService) {}

  async executePayment(paymentDetail: PaymentDetails, amount: bigint): Promise<TransactionReceipt> {
    if (!this.wallet.signer || !this.wallet.address) {
      throw new Error('Cosmos wallet not ready')
    }

    // 2. Grab the SigningStargateClient and sender address
    const signer = this.wallet.signer as Secp256k1Wallet
    const fromAddress = this.wallet.address

    const chainInfo = this.wallet.chainInfo // assume walletService exposes numeric chainId
    if (!chainInfo) {
      throw new Error(`Unsupported Cosmos chainId: ${chainInfo}`)
    }

    const appChainID = CosmosChainMap[chainInfo.chainId]
    if (!appChainID) {
      throw new Error(`Unsupported Cosmos chainId: ${chainInfo.chainId}`)
    }

    const bech32Prefix = appChainID.split('-')[0] // Extract "noble"

    const _amount = coins(paymentDetail.amountInSubUnits, 'uusdc')

    const client = await SigningStargateClient.connectWithSigner(chainInfo.rpcUrl, signer)

    const result = await client.sendTokens(
      fromAddress,
      paymentDetail.payAddress,
      _amount,
      {
        amount: [{ denom: "uusdc", amount: "20000" }],
        gas: "200000",
      },
      'Arweave Storage SDK: Payment for Arweave upload'
    )

    return {
      hash: result.transactionHash,
      status: result.code === undefined ? 0 : result.code === 0 ? 1 : 0
    }
  }
}
