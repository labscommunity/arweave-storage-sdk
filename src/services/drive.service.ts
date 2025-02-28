import { Tag } from 'arweave/web/lib/transaction'

import { ArFSApi } from '../api'
import { Crypto } from '../crypto'
import { Drive, DriveMetaData, DriveOptions, Folder } from '../models'
import { CreateDriveOptions } from '../types/service'
import { toModelObject } from '../utils/arweaveTagsUtils'

export class DriveService {
  api: ArFSApi
  crypto: Crypto
  tags: Tag[] = []

  constructor(api: ArFSApi, tags: Tag[] = [], crypto: Crypto) {
    this.api = api
    this.tags = tags
    this.crypto = crypto
  }

  async create(name: string, options?: CreateDriveOptions) {
    const { visibility = 'public' } = options || {}

    const drive = Drive.create(name, { visibility })
    const rootFolder = Folder.create({ name, driveId: drive.driveId, visibility })
    drive.rootFolderId = rootFolder.folderId

    let driveMetaData: string | ArrayBuffer = JSON.stringify(drive.getMetaData())
    let rootFolderMetaData: string | ArrayBuffer = JSON.stringify(rootFolder.getMetaData())

    if (visibility === 'private') {
      const { aesKey } = await this.crypto.getDriveKey(drive.driveId) as any

      const encryptedDriveMetaData = await this.crypto.encryptEntity(Buffer.from(driveMetaData), aesKey)
      const encryptedRootFolderMetaData = await this.crypto.encryptEntity(Buffer.from(rootFolderMetaData), aesKey)

      driveMetaData = encryptedDriveMetaData.data
      rootFolderMetaData = encryptedRootFolderMetaData.data

      drive.cipher = encryptedDriveMetaData.cipher
      drive.cipherIv = encryptedDriveMetaData.cipherIV

      rootFolder.cipher = encryptedRootFolderMetaData.cipher
      rootFolder.cipherIv = encryptedRootFolderMetaData.cipherIV
    }

    const driveDataItem = await drive.toTransaction(this.tags, driveMetaData)
    const rootFolderDataItem = await rootFolder.toTransaction(this.tags, rootFolderMetaData)

    const response = await this.api.signAndSendAllTransactions([driveDataItem, rootFolderDataItem])

    if (response.failedTxIndex.length !== 0) {
      throw new Error('Failed to create a new drive.')
    }

    drive.setId(response.successTxIds[0])

    return drive
  }

  async listAll() {
    await this.api.ready

    if (!this.api.ready || !this.api.queryEngine) {
      return null
    }

    let response: Drive[] = []

    try {
      const drivesGql = await this.api.queryEngine.query('GET_ALL_USER_DRIVES')

      for (const driveGql of drivesGql) {
        const driveInstance = await this.#transactionToDriveInstance(driveGql.node.id, driveGql.node.tags as Tag[])

        response.push(driveInstance)
      }
    } catch (error) {
      throw new Error('Failed to get user drives.')
    }

    response = response.filter((v, i, a) => a.findIndex((v2) => v2.driveId === v.driveId) === i)

    return response
  }

  async get(driveId: string) {
    await this.api.ready

    if (!this.api.ready || !this.api.queryEngine) {
      return null
    }

    let response: Drive | null = null

    try {
      const entitiesGql = await this.api.queryEngine.query('GET_USER_DRIVE_BY_ID', { driveId })

      if (!entitiesGql.length) {
        return null
      }

      const driveInstance = await this.#transactionToDriveInstance(
        entitiesGql[0].node.id,
        entitiesGql[0].node.tags as Tag[]
      ) // most recent folder update

      response = driveInstance as Drive
    } catch (error) {
      throw new Error('Failed to get folder.')
    }

    return response
  }

  async #transactionToDriveInstance(txId: string, tags: Tag[]): Promise<Drive> {
    try {
      const modelObject = toModelObject<DriveOptions>(tags)

      const txRes = await fetch(`https://arweave.net/${txId}`)

      let data: DriveMetaData | null = null

      if (modelObject.drivePrivacy && modelObject.drivePrivacy === 'private') {
        const driveArrayBuffer = await txRes.arrayBuffer()

        const { aesKey } = await this.crypto.getDriveKey(modelObject.driveId) as any

        const decryptedDriveBuffer = await this.crypto.decryptEntity(
          aesKey,
          modelObject.cipherIv!,
          Buffer.from(driveArrayBuffer)
        )

        data = JSON.parse(Buffer.from(decryptedDriveBuffer).toString()) as DriveMetaData
      } else {
        data = (await txRes.json()) as DriveMetaData
      }

      const instance = new Drive({ ...modelObject, name: data.name, rootFolderId: data.rootFolderId })
      instance.setId(txId)

      return instance
    } catch (error) {
      throw new Error('Failed to prepare drive instance.')
    }
  }
}
