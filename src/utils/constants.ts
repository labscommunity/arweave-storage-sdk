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

export const STORAGE_SERVICE_API_URL = 'http://localhost:3000'

export const NetworkChainMap: Record<Network, ChainInfo> = {
  [Network.BASE_MAINNET]: {
    chainId: 8453,
    chainName: 'Base Mainnet',
    chainType: ChainType.evm,
    network: ChainNetwork.Mainnet
  },
  [Network.BASE_TESTNET]: {
    chainId: 84532,
    chainName: 'Base Testnet',
    chainType: ChainType.evm,
    network: ChainNetwork.Testnet
  }
}

export interface ChainInfo {
  chainId: number
  chainName: string
  chainType: ChainType
  network: ChainNetwork
}
