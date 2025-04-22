import { WalletService } from '../../wallet/WalletService'
import { TransactionReceipt, PaymentDetails } from './types'
import { PaymentAdapter } from './PaymentAdapter'
import { arweaveInstance } from '../../utils/arweaveInstance'
import { isServer } from '../../utils/platform'
import { JWKInterface } from 'arweave/web/lib/wallet'

export class ArweaveAdapter implements PaymentAdapter {
  constructor(private wallet: WalletService) {}

  async executePayment(paymentDetail: PaymentDetails, amount: bigint): Promise<TransactionReceipt> {
    const tx = await arweaveInstance.createTransaction({ quantity: paymentDetail.amountInSubUnits, target: paymentDetail.payAddress })

    if (isServer()) {
      const signer = this.wallet.signer as unknown as JWKInterface
      await arweaveInstance.transactions.sign(tx, signer)
      const response = await arweaveInstance.transactions.post(tx)

      if (response.status !== 200) {
        throw new Error('Payment transaction for upload failed')
      }

      return {
        hash: tx.id,
        status: 1
      }
    }

    const res = await window.arweaveWallet.dispatch(tx)

    if (!res.id) {
      throw new Error('Payment transaction for upload failed')
    }

    return {
      hash: tx.id,
      status: 1
    }
  }
}
