import { Contract, JsonRpcSigner } from 'ethers'
import { WalletService } from '../wallet/WalletService'
import { PaymentDetails, TransactionReceipt } from './payment.service'
import { PaymentService } from './payment.service'

export class EvmPaymentService implements PaymentService {
  constructor(private wallet: WalletService) {}

  async executePayment(
    paymentDetail: PaymentDetails,
    tokenAddress: string,
    amount: bigint
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
