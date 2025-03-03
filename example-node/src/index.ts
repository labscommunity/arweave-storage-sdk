import { StorageApi, Configuration, Network, Token } from 'arweave-storage-sdk'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

async function main() {
  const config = new Configuration({
    privateKey: process.env.PRIVATE_KEY || 'use_web_wallet',
    appName: 'arfs-js-drive',
    network: Network.BASE_MAINNET,
    token: Token.USDC
  })
  const storageApiInstance = new StorageApi(config)
  await storageApiInstance.ready

  //Login
  await storageApiInstance.api.login()
  const profile = await storageApiInstance.api.getProfile()
  console.log(profile)
}

main().catch(console.error)
