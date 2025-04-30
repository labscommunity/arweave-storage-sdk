import { ArweaveAdapter } from './ArweaveAdapter'

import { ChainType } from '../../types'
import { EvmAdapter } from './EvmAdapter'
import { PaymentAdapter } from './PaymentAdapter'
import { SolanaAdapter } from './SolanaAdapter'
import { WalletService } from '../../wallet/WalletService'
import { CosmosAdapter } from './CosmosAdapter'

export const ADAPTERS: Record<ChainType, new (wallet: WalletService) => PaymentAdapter> = {
  evm: EvmAdapter,
  arweave: ArweaveAdapter,
  solana: SolanaAdapter,
  cosmos: CosmosAdapter
}
