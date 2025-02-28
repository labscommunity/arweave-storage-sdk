import { ChainType, Network } from '../types/wallet'

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

export const ChainTypes: Record<Network, ChainType> = {
  [Network.BASE_MAINNET]: ChainType.evm,
  [Network.BASE_TESTNET]: ChainType.evm
}
