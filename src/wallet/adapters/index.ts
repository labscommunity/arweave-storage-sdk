import { ArweaveAdapter } from './ArweaveAdapter'

import { ChainType } from '../../types'
import { EvmAdapter } from './EvmAdapter'
import { WalletAdapter } from './WalletAdapter'
import { Configuration } from '../Configuration'
import { SolanaAdapter } from './SolanaAdapter'
import { CosmosAdapter } from './CosmosAdapter'
export const ADAPTERS: Record<ChainType, new (cfg: Configuration) => WalletAdapter> = {
  evm: EvmAdapter,
  arweave: ArweaveAdapter,
  solana: SolanaAdapter,
  cosmos: CosmosAdapter
}
