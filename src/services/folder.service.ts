import { Tag } from 'arweave/web/lib/transaction'

import { ArFSApi } from '../api'
import { Crypto } from '../crypto'
import { File, FileMetaData, Folder, FolderMetaData, IFileProps, IFolderProps } from '../models'
import { EntityVisibility } from '../types'
import { toModelObject } from '../utils/arweaveTagsUtils'
import { getEntityTypeFromTags } from '../utils/getEntityTypeFromTags'
import { getUniqueEntities } from '../utils/getUniqueEntities'
import { ArweaveWallet } from '../wallet/ArweaveWallet'
import { UploadClient } from '../api/upload/UploadClient'
import { throwError } from '../utils/errors/error-factory'

export class FolderService {
  arweaveWallet: ArweaveWallet
  uploadClient: UploadClient
  crypto: Crypto
  tags: Tag[] = []

  constructor(arweaveWallet: ArweaveWallet, tags: Tag[] = [], crypto: Crypto, uploadClient: UploadClient) {
    this.arweaveWallet = arweaveWallet
    this.uploadClient = uploadClient
    this.crypto = crypto
    this.tags = tags
  }

  async create(name: string, { parentFolderId, driveId, visibility = 'public', ...options }: CreateFolderOptions) {
    const folder = Folder.create({ name, driveId: driveId, parentFolderId, visibility })
    let folderMetaData: string | ArrayBuffer = JSON.stringify(folder.getMetaData())

    if (visibility === 'private') {
      const { aesKey } = (await this.crypto.getDriveKey(driveId)) as any

      const encryptedFolderMetaData = await this.crypto.encryptEntity(Buffer.from(folderMetaData), aesKey)
      folderMetaData = encryptedFolderMetaData.data

      folder.cipher = encryptedFolderMetaData.cipher
      folder.cipherIv = encryptedFolderMetaData.cipherIV
    }

    const tags = [...this.tags, ...(options?.tags || [])]
    const folderDataItem = await folder.toDataItem(this.arweaveWallet.signer, tags, folderMetaData)

    const folderTxId = await this.uploadClient.uploadDataItem(folderDataItem, {
      name: `${folder.name}.json`,
      dataContentType: folder.contentType
    })

    if (!folderTxId) {
      throwError(400, 'Failed to create a new folder.')
    }

    folder.setId(folderTxId)
    return folder
  }

  async listAll(folderId: string, driveId: string) {
    if (!this.arweaveWallet.queryEngine) {
      return null
    }

    let response: (File | Folder)[] = []

    try {
      const entitiesGql = await this.arweaveWallet.queryEngine.query('GET_ALL_ENTITIES_IN_FOLDER', {
        folderId,
        driveId
      })

      for (const entityGql of entitiesGql) {
        const entityInstance = await this.#transactionToEntityInstance(entityGql.node.id, entityGql.node.tags as Tag[])

        if (!entityInstance) throw 'Failed to contruct entity instance'

        response.push(entityInstance)
      }
    } catch (error) {
      throw new Error('Failed to get user folders and files.')
    }

    response = getUniqueEntities(response)

    return response
  }

  async get(folderId: string, driveId: string) {
    if (!this.arweaveWallet.queryEngine) {
      return null
    }

    let response: Folder | null = null

    try {
      const entitiesGql = await this.arweaveWallet.queryEngine.query('GET_FOLDER_BY_ID', { folderId, driveId })

      if (!entitiesGql.length) {
        return null
      }

      const folderInstance = await this.#transactionToEntityInstance(
        entitiesGql[0].node.id,
        entitiesGql[0].node.tags as Tag[]
      ) // most recent folder update

      response = folderInstance as Folder
    } catch (error) {
      throwError(400, 'Failed to get folder.')
    }

    return response
  }

  async #transactionToEntityInstance(txId: string, tags: Tag[]): Promise<Folder | File | null> {
    try {
      const txRes = await fetch(`https://arweave.net/${txId}`)
      const modelObject = toModelObject<IFolderProps | IFileProps>(tags)

      let data: FolderMetaData | FileMetaData | null = null

      if (modelObject.cipher && modelObject.cipherIv) {
        const dataArrayBuffer = await txRes.arrayBuffer()

        const { aesKey, baseEntityKey } = (await this.crypto.getDriveKey(modelObject.driveId)) as any
        let key = aesKey

        if (modelObject.entityType === 'file') {
          key = await this.crypto.getFileKey(baseEntityKey, (modelObject as IFileProps).fileId)
        }

        const decryptedEntityDataBuffer = await this.crypto.decryptEntity(
          key,
          modelObject.cipherIv!,
          Buffer.from(dataArrayBuffer)
        )

        data = JSON.parse(Buffer.from(decryptedEntityDataBuffer).toString()) as FolderMetaData | FileMetaData
      } else {
        data = (await txRes.json()) as FolderMetaData | FileMetaData
      }

      const entityType = getEntityTypeFromTags(tags)

      if (!entityType) throw 'Failed to find entity.'

      if (entityType === 'folder' && modelObject.entityType === 'folder') {
        const instance = new Folder({ ...(modelObject as IFolderProps), name: data.name })
        instance.setId(txId)

        return instance
      }

      if (entityType === 'file' && modelObject.entityType === 'file') {
        const instance = new File({ ...(modelObject as IFileProps), ...data })
        instance.setId(txId)

        return instance
      }

      return null
    } catch (error) {
      throw new Error('Failed to prepare drive instance.')
    }
  }
}

export type CreateFolderOptions = {
  parentFolderId: string
  driveId: string
  visibility?: EntityVisibility
  tags?: Tag[]
}
