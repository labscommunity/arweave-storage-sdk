import { ChainNetwork, ChainType, Network } from '../types/wallet'

export const gqlTagNameRecord = {
  arFS: 'ArFS',
  tipType: 'Tip-Type',
  contentType: 'Content-Type',
  boost: 'Boost',
  bundleFormat: 'Bundle-Format',
  bundleVersion: 'Bundle-Version',
  entityType: 'Entity-Type',
  unitTime: 'Unix-Time',
  driveId: 'Drive-Id',
  folderId: 'Folder-Id',
  fileId: 'File-Id',
  parentFolderId: 'Parent-Folder-Id',
  drivePrivacy: 'Drive-Privacy',
  cipher: 'Cipher',
  cipherIv: 'Cipher-IV',
  driveAuthMode: 'Drive-Auth-Mode'
}

export const STORAGE_SERVICE_API_URL = 'https://storage.saikranthi.dev'

export const NetworkChainMap: Record<Network, ChainInfo> = {
  [Network.BASE_MAINNET]: {
    chainId: 8453,
    chainName: 'Base Mainnet',
    chainType: ChainType.evm,
    network: ChainNetwork.Mainnet,
    rpcUrl: 'https://mainnet.base.org'
  },
  [Network.BASE_TESTNET]: {
    chainId: 84532,
    chainName: 'Base Testnet',
    chainType: ChainType.evm,
    network: ChainNetwork.Testnet,
    rpcUrl: 'https://sepolia.base.org'
  },
  [Network.ARWEAVE_MAINNET]: {
    chainId: 1,
    chainName: 'Arweave Mainnet',
    chainType: ChainType.arweave,
    network: ChainNetwork.Mainnet
  },
  [Network.COSMOS_NOBLE_MAINNET]: {
    chainId: 1,
    chainName: 'Cosmos Noble Mainnet',
    chainType: ChainType.cosmos,
    network: ChainNetwork.Mainnet,
    rpcUrl: 'https://noble-rpc.polkachu.com'
  }
}

export const CosmosChainMap: Record<number, string> = {
  1: 'noble-1'
}
export interface ChainInfo {
  chainId: number
  chainName: string
  chainType: ChainType
  network: ChainNetwork
  rpcUrl?: string
}

export const BYTES_IN_MB = 1000000
export const DEFAULT_CHUNK_SIZE_IN_BYTES = 10 * BYTES_IN_MB
