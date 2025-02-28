import { StorageApi, Configuration, Network, Token } from 'arweave-storage-sdk'

export async function getStorageApi() {
  const config = new Configuration({
    privateKey: 'use_web_wallet',
    appName: 'arfs-js-drive',
    network: Network.BASE_MAINNET,
    token: Token.USDC
  })
  const storageApi = new StorageApi(config)

  await storageApi.ready

  return storageApi
}
