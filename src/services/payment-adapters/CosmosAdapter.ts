import { WalletService } from '../../wallet/WalletService'
import { TransactionReceipt, PaymentDetails } from './types'
import { PaymentAdapter } from './PaymentAdapter'

export class CosmosAdapter implements PaymentAdapter {
  constructor(private wallet: WalletService) {}

  async executePayment(paymentDetail: PaymentDetails, amount: bigint): Promise<TransactionReceipt> {
    return Promise.resolve({
      hash: '123',
      status: 1
    })
  }
}
