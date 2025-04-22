import { Contract } from "ethers";
import { JsonRpcSigner } from 'ethers'
import { WalletService } from '../../wallet/WalletService'
import { TransactionReceipt, PaymentDetails } from './types'
import { PaymentAdapter } from './PaymentAdapter'

export class EvmAdapter implements PaymentAdapter {
  constructor(private wallet: WalletService) {}

  async executePayment(
    paymentDetail: PaymentDetails,
    amount: bigint,
    tokenAddress: string
  ): Promise<TransactionReceipt> {
    const ERC20_ABI = ['function transfer(address recipient, uint256 amount) external returns (bool)']
    const signer = this.wallet.signer as JsonRpcSigner
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer)
    // Use the contract to transfer tokens
    const contractSigner = tokenContract.connect(signer) as any

    const tx = await contractSigner.transfer(paymentDetail.payAddress, amount)
    const receipt = await tx.wait()
    if (!receipt || receipt.status !== 1) {
      throw new Error('Payment transaction for upload failed')
    }

    return {
      hash: tx.hash,
      status: receipt.status
    }
  }
}
