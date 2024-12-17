import { Tag } from 'arweave/web/lib/transaction'

import { ArFSApi } from '../api'
import { Crypto } from '../crypto'
import { File, FileMetaData, Folder, FolderMetaData, IFileProps } from '../models'
import { EntityVisibility } from '../types'
import { arweaveInstance } from '../utils/arweaveInstance'
import { toModelObject } from '../utils/arweaveTagsUtils'
import { getEntityTypeFromTags } from '../utils/getEntityTypeFromTags'
import { getUnixTime } from '../utils/UnixTime'

export class FileService {
  api: ArFSApi
  crypto: Crypto
  tags: Tag[] = []

  constructor(api: ArFSApi, tags: Tag[] = [], crypto: Crypto) {
    this.api = api
    this.tags = tags
    this.crypto = crypto
  }

  async create({ file, visibility = 'public', ...rest }: CreateFileOptions) {
    const dataTxId = ''
    let pinnedDataOwner

    const fileInstance = File.create({ ...rest, dataTxId, pinnedDataOwner, visibility })

    if (file instanceof ArrayBuffer) {
      const localTags: Tag[] = []

      if (visibility === 'private') {
        const { baseEntityKey } = await this.crypto.getDriveKey(rest.driveId)
        const fileKey = await this.crypto.getFileKey(baseEntityKey, fileInstance.fileId)

        const encryptedFile = await this.crypto.encryptEntity(Buffer.from(file), fileKey)
        file = encryptedFile.data

        localTags.push({ name: 'Cipher', value: encryptedFile.cipher } as Tag)
        localTags.push({ name: 'Cipher-IV', value: encryptedFile.cipherIV } as Tag)

        rest.dataContentType = 'application/octet-stream'
      }
      // handle self upload and set the dataTxId
      const timeStamp = getUnixTime().toString()
      const dataTx = await this.prepareFileTransaction(file, rest.dataContentType, timeStamp, [
        ...this.tags,
        ...localTags
      ])
      const { failedTxIndex: failedDataTxIndex, successTxIds: successDataTxIds } =
        await this.api.signAndSendAllTransactions([dataTx])

      if (failedDataTxIndex.length !== 0) {
        throw new Error('Failed to create file data tx.')
      }

      const [txid] = successDataTxIds

      if (!txid) {
        throw new Error('Failed to create a new file.')
      }

      fileInstance.dataTxId = txid
    }

    if (typeof file === 'object' && Object.hasOwn(file, 'dataTxId')) {
      fileInstance.dataTxId = (file as FileData).dataTxId
      fileInstance.pinnedDataOwner = (file as FileData).pinnedDataOwner
    }

    let fileMetaData: string | ArrayBuffer = JSON.stringify(fileInstance.getMetaData())

    if (visibility === 'private') {
      const { baseEntityKey } = await this.crypto.getDriveKey(rest.driveId)
      const fileKey = await this.crypto.getFileKey(baseEntityKey, fileInstance.fileId)

      const encryptedFileMetaData = await this.crypto.encryptEntity(Buffer.from(fileMetaData), fileKey)
      fileMetaData = encryptedFileMetaData.data

      fileInstance.cipher = encryptedFileMetaData.cipher
      fileInstance.cipherIv = encryptedFileMetaData.cipherIV
    }

    const fileTransaction = await fileInstance.toTransaction(this.tags, fileMetaData)

    const response = await this.api.signAndSendAllTransactions([fileTransaction])

    if (response.failedTxIndex.length !== 0) {
      throw new Error('Failed to create a new file.')
    }

    fileInstance.setId(response.successTxIds[0])
    return fileInstance
  }

  async get(fileId: string, driveId: string) {
    await this.api.ready

    if (!this.api.ready || !this.api.queryEngine) {
      return null
    }

    let response: File | null = null

    try {
      const entitiesGql = await this.api.queryEngine.query('GET_FILE_BY_ID', { fileId, driveId })

      if (!entitiesGql.length) {
        return null
      }

      const fileInstance = await this.#transactionToEntityInstance(
        entitiesGql[0].node.id,
        entitiesGql[0].node.tags as Tag[]
      ) // most recent folder update

      response = fileInstance as File
    } catch (error) {
      throw new Error('Failed to get file.')
    }

    return response
  }

  async decryptFile(fileEntity: File) {
    if (!fileEntity.dataTxId) throw new Error('Invalid File Entity. dataTxId missing.')
    if (!fileEntity.cipher || !fileEntity.cipherIv) {
      throw new Error('File entity is not encrypted.')
    }

    try {
      const txDataRes = await fetch(`https://arweave.net/${fileEntity.dataTxId}`)
      const dataArrayBuffer = await txDataRes.arrayBuffer()

      await this.api.ready

      const cipherIV = await this.api.queryEngine?.argql.fetchTxTag(fileEntity.dataTxId, 'Cipher-IV')

      if (!cipherIV) throw new Error('CipherIV Missing. Failed to decrypt.')

      const { baseEntityKey } = await this.crypto.getDriveKey(fileEntity.driveId)
      const fileKey = await this.crypto.getFileKey(baseEntityKey, fileEntity.fileId)

      const decryptedFileBuffer = await this.crypto.decryptEntity(fileKey, cipherIV, Buffer.from(dataArrayBuffer))

      return new Blob([decryptedFileBuffer])
    } catch (error) {
      console.error(error)
      throw new Error('Failed to decrypt file.')
    }
  }

  async #transactionToEntityInstance(txId: string, tags: Tag[]): Promise<Folder | File | null> {
    try {
      const txRes = await fetch(`https://arweave.net/${txId}`)
      const modelObject = toModelObject<IFileProps>(tags)

      let data: FolderMetaData | FileMetaData | null = null

      if (modelObject.cipher && modelObject.cipherIv) {
        const dataArrayBuffer = await txRes.arrayBuffer()

        const { baseEntityKey } = await this.crypto.getDriveKey(modelObject.driveId)
        const fileKey = await this.crypto.getFileKey(baseEntityKey, modelObject.fileId)

        const decryptedEntityDataBuffer = await this.crypto.decryptEntity(
          fileKey,
          modelObject.cipherIv!,
          Buffer.from(dataArrayBuffer)
        )

        data = JSON.parse(Buffer.from(decryptedEntityDataBuffer).toString()) as FolderMetaData | FileMetaData
      } else {
        data = (await txRes.json()) as FolderMetaData | FileMetaData
      }

      const entityType = getEntityTypeFromTags(tags)

      if (!entityType) throw 'Failed to find entity.'

      if (entityType === 'file') {
        const instance = new File({ ...modelObject, ...data })
        instance.setId(txId)

        return instance
      }

      return null
    } catch (error) {
      throw new Error('Failed to prepare drive instance.')
    }
  }

  async prepareFileTransaction(file: ArrayBuffer, contentType: string, timestamp: string, customTags: Tag[] = []) {
    const transaction = await arweaveInstance.createTransaction({
      data: file
    })

    transaction.addTag('Unix-Time', timestamp)
    transaction.addTag('Content-Type', contentType)

    for (const tag of customTags) transaction.addTag(tag.name, tag.value)

    return transaction
  }
}

export type CreateFileOptions = {
  name: string // User defined folder name
  driveId: string // UUID of the drive
  parentFolderId: string
  size: number
  dataContentType: string
  file: ArrayBuffer | FileData
  visibility?: EntityVisibility
}

export type FileData = {
  dataTxId: string
  pinnedDataOwner?: string
}
