import { Tag } from 'arweave/web/lib/transaction'

import { Crypto } from '../crypto'
import { Drive, DriveMetaData, DriveOptions, Folder } from '../models'
import { CreateDriveOptions } from '../types/service'
import { toModelObject } from '../utils/arweaveTagsUtils'
import { ArweaveWallet } from '../wallet/ArweaveWallet'
import { UploadClient } from '../api/upload/UploadClient'
import { throwError } from '../utils/errors/error-factory'

export class DriveService {
  arweaveWallet: ArweaveWallet
  crypto: Crypto
  tags: Tag[] = []
  uploadClient: UploadClient

  constructor(arweaveWallet: ArweaveWallet, tags: Tag[] = [], crypto: Crypto, uploadClient: UploadClient) {
    this.arweaveWallet = arweaveWallet
    this.tags = tags
    this.crypto = crypto
    this.uploadClient = uploadClient
  }

  async create(name: string, options?: CreateDriveOptions) {
    const { visibility = 'public' } = options || {}

    const drive = Drive.create(name, { visibility })
    const rootFolder = Folder.create({ name, driveId: drive.driveId, visibility })
    drive.rootFolderId = rootFolder.folderId

    let driveMetaData: string | ArrayBuffer = JSON.stringify(drive.getMetaData())
    let rootFolderMetaData: string | ArrayBuffer = JSON.stringify(rootFolder.getMetaData())

    if (visibility === 'private') {
      const { aesKey } = (await this.crypto.getDriveKey(drive.driveId)) as any

      const encryptedDriveMetaData = await this.crypto.encryptEntity(Buffer.from(driveMetaData), aesKey)
      const encryptedRootFolderMetaData = await this.crypto.encryptEntity(Buffer.from(rootFolderMetaData), aesKey)

      driveMetaData = encryptedDriveMetaData.data
      rootFolderMetaData = encryptedRootFolderMetaData.data

      drive.cipher = encryptedDriveMetaData.cipher
      drive.cipherIv = encryptedDriveMetaData.cipherIV

      rootFolder.cipher = encryptedRootFolderMetaData.cipher
      rootFolder.cipherIv = encryptedRootFolderMetaData.cipherIV
    }

    const tags = [...this.tags, ...(options?.tags || [])]
    const driveDataItem = await drive.toDataItem(this.arweaveWallet.signer, tags, driveMetaData)
    const rootFolderDataItem = await rootFolder.toDataItem(this.arweaveWallet.signer, tags, rootFolderMetaData)

    const driveTxId = await this.uploadClient.uploadDataItem(driveDataItem, {
      name: `${drive.name}.json`,
      dataContentType: drive.contentType
    })

    if (!driveTxId) {
      throwError(400, 'Failed to create drive.')
    }

    const rootFolderTxId = await this.uploadClient.uploadDataItem(rootFolderDataItem, {
      name: `${rootFolder.name}.json`,
      dataContentType: rootFolder.contentType
    })

    if (!rootFolderTxId) {
      throwError(400, 'Failed to create root folder.')
    }

    drive.setId(driveTxId)
    return drive
  }

  async listAll() {
    if (!this.arweaveWallet.queryEngine) {
      return null
    }

    let response: Drive[] = []

    try {
      const drivesGql = await this.arweaveWallet.queryEngine.query('GET_ALL_USER_DRIVES')

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
    if (!this.arweaveWallet.queryEngine) {
      return null
    }

    let response: Drive | null = null

    try {
      const entitiesGql = await this.arweaveWallet.queryEngine.query('GET_USER_DRIVE_BY_ID', { driveId })

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

        const { aesKey } = (await this.crypto.getDriveKey(modelObject.driveId)) as any

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
