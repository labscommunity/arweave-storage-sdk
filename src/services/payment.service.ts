export interface PaymentService {
  /**
   * Executes a token transfer given the payment details.
   *
   * @param paymentDetail Payment detail object for the token
   * @param tokenAddress The token contract (or mint) address
   * @param amount The amount to transfer (in smallest units)
   * @returns A transaction receipt with at least a transaction hash and status
   */
  executePayment(paymentDetail: PaymentDetails, tokenAddress: string, amount: bigint): Promise<TransactionReceipt>
}

// Define supporting types (adapt as needed)
export interface PaymentDetails {
  payAddress: string
  amountInSubUnits: string
}

export interface TransactionReceipt {
  hash: string // For EVM, ethers uses .hash
  status: number
}
