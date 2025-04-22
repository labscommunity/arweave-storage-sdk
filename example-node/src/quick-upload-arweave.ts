import { StorageApi, Configuration, Network, Token } from 'arweave-storage-sdk'
import { Tag } from 'arweave/node/lib/transaction'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

async function main() {
  const config = new Configuration({
    privateKey: process.env.ARWEAVE_PRIVATE_KEY,
    appName: 'arfs-js-drive',
    network: Network.ARWEAVE_MAINNET,
    token: Token.AR
  })
  const storageApiInstance = new StorageApi(config)
  await storageApiInstance.ready

  //Login
  await storageApiInstance.api.login()

  // const tags = [
  //   { name: 'Content-Type', value: 'text/plain' },
  //   { name: 'Arweave-Transaction', value: 'test' }
  // ] as Tag[]

  // const file = new Blob(['A demo file!'], { type: 'text/plain' })
  // const upload = await storageApiInstance.quickUpload(await file.arrayBuffer(), {
  //   name: 'demo.txt',
  //   dataContentType: 'text/plain',
  //   tags,
  //   size: file.size,
  //   overrideFileName: true
  // })

  const profile = await storageApiInstance.api.getUser()
  console.log(profile)
}

main().catch(console.error)
