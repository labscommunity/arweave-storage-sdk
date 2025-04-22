import { TransactionReceipt, PaymentDetails } from "./types"

export interface PaymentAdapter {
  executePayment(paymentDetail: PaymentDetails, amount: bigint, tokenAddress?: string): Promise<TransactionReceipt>
}
