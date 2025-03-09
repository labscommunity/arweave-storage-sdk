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

  const tags = [{ name: 'Arweave-Drive-Transaction', value: 'test' }] as Tag[]
  const fileBlob = new Blob(['Hello, world!'], { type: 'text/plain' })

  const drive = await storageApiInstance.api.drive.create('node-arfs-drive', {
    tags: tags
  })

  console.log('Drive created with id:', drive.driveId)

  const folder = await storageApiInstance.api.folder.create('node-arfs-folder', {
    driveId: drive.driveId,
    parentFolderId: drive.rootFolderId,
    visibility: 'public'
  })

  console.log('Folder created with id:', folder.folderId)

  const file = await storageApiInstance.api.file.create({
    driveId: drive.driveId,
    parentFolderId: folder.folderId,
    visibility: 'public',
    name: 'node-arfs-file',
    size: fileBlob.size,
    dataContentType: fileBlob.type,
    file: await fileBlob.arrayBuffer(),
    overridedFileName: true,
  })

  console.log('File created with id:', file.fileId)

  const profile = await storageApiInstance.api.getUser()
  console.log(profile)
}

main().catch(console.error)
