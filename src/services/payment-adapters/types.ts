export interface PaymentDetails {
  payAddress: string
  amountInSubUnits: string
}

export interface TransactionReceipt {
  hash: string
  status: number
}
