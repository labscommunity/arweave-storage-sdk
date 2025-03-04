import { StorageApi, Configuration, Network, Token } from 'arweave-storage-sdk'

let storageApiInstance = null

export async function getStorageApi() {
  if (storageApiInstance) {
    return storageApiInstance
  }

  const config = new Configuration({
    privateKey: 'use_web_wallet',
    appName: 'arfs-js-drive',
    network: Network.BASE_MAINNET,
    token: Token.USDC
  })
  storageApiInstance = new StorageApi(config)

  await storageApiInstance.ready

  return storageApiInstance
}
