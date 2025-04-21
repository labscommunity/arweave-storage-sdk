import { StorageApi, Configuration, Network, Token } from 'arweave-storage-sdk'
import { Tag } from 'arweave/node/lib/transaction'
import * as dotenv from 'dotenv'
// Load environment variables from .env file
dotenv.config()

async function main() {
  const config = new Configuration({
    privateKey: process.env.PRIVATE_KEY,
    appName: 'arfs-js-drive',
    network: Network.BASE_MAINNET,
    token: Token.USDC
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
  //   overrideFileName: true,
  //   visibility: 'private'
  // })
  // console.log({upload})

  // const profile = await storageApiInstance.api.getUser()
  // console.log(profile)
  // const txId = '0aa04113-bb5c-4efe-bbae-42c0039a7827'
  // const isValid = validate(txId)
  // console.log({ isValid })
  // const parsed = parse(txId)
  // console.log({ parsed })
  await storageApiInstance.downloadFile('39405819-3893-4d8b-8cd6-9a88c998301c')
}

main().catch(console.error)
