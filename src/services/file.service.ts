import { Tag } from 'arweave/web/lib/transaction'

import { Crypto } from '../crypto'
import { File, FileMetaData, Folder, FolderMetaData, IFileProps } from '../models'
import { EntityVisibility } from '../types'
import { toModelObject } from '../utils/arweaveTagsUtils'
import { getEntityTypeFromTags } from '../utils/getEntityTypeFromTags'
import { getUnixTime } from '../utils/UnixTime'
import { ArweaveWallet } from '../wallet/ArweaveWallet'
import { UploadClient } from '../api/upload/UploadClient'
import { FileLike, FileSource } from '../types/file'
import { createFileLike } from '../utils/createFileLike'
import { createData } from 'arbundles'
import { applyFileTags, getSDKTags } from '../utils/getSDKTags'
import { throwError } from '../utils/errors/error-factory'

export class FileService {
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

  async create({ file, visibility = 'public', ...rest }: CreateFileOptions) {
    const fileInstance = File.create({ ...rest, dataTxId: '', visibility })
    const overridedName = rest.overridedFileName ? rest.name : undefined
    const fileLike = await createFileLike(file, { name: overridedName, mimeType: rest.dataContentType })
    const localTags: Tag[] = []

    if (visibility === 'private') {
      const { baseEntityKey } = (await this.crypto.getDriveKey(rest.driveId)) as any
      const fileKey = await this.crypto.getFileKey(baseEntityKey, fileInstance.fileId)

      const encryptedFile = await this.crypto.encryptEntity(Buffer.from(file), fileKey)
      file = encryptedFile.data

      localTags.push({ name: 'Cipher', value: encryptedFile.cipher } as Tag)
      localTags.push({ name: 'Cipher-IV', value: encryptedFile.cipherIV } as Tag)

      rest.dataContentType = 'application/octet-stream'
    }
    // handle self upload and set the dataTxId
    const timeStamp = getUnixTime().toString()
    const fileDataItem = await this.prepareFileDataItem(fileLike, timeStamp, [...this.tags, ...localTags])
    const dataTxId = await this.uploadClient.uploadDataItem(fileDataItem, {
      name: rest.name || fileLike.name,
      dataContentType: rest.dataContentType
    })

    if (!dataTxId) {
      throw new Error('Failed to create file data tx.')
    }

    fileInstance.dataTxId = dataTxId

    let fileMetaData: string | ArrayBuffer = JSON.stringify(fileInstance.getMetaData())

    if (visibility === 'private') {
      const { baseEntityKey } = (await this.crypto.getDriveKey(rest.driveId)) as any
      const fileKey = await this.crypto.getFileKey(baseEntityKey, fileInstance.fileId)

      const encryptedFileMetaData = await this.crypto.encryptEntity(Buffer.from(fileMetaData), fileKey)
      fileMetaData = encryptedFileMetaData.data

      fileInstance.cipher = encryptedFileMetaData.cipher
      fileInstance.cipherIv = encryptedFileMetaData.cipherIV
    }

    const tags = [...this.tags, ...(rest?.tags || [])]
    const fileInstanceDataItem = await fileInstance.toDataItem(this.arweaveWallet.signer, tags, fileMetaData)

    const fileTxId = await this.uploadClient.uploadDataItem(fileInstanceDataItem, {
      name: `${fileInstance.name}.json`,
      dataContentType: fileInstance.contentType
    })

    if (!fileTxId) {
      throwError(400, 'Failed to create a new file.')
    }

    fileInstance.setId(fileTxId)
    return fileInstance
  }

  async get(fileId: string, driveId: string) {
    if (!this.arweaveWallet.queryEngine) {
      return null
    }

    let response: File | null = null

    try {
      const entitiesGql = await this.arweaveWallet.queryEngine.query('GET_FILE_BY_ID', { fileId, driveId })

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
    if (!this.arweaveWallet.queryEngine) {
      throw new Error('Query engine not initialized.')
    }

    try {
      const txDataRes = await fetch(`https://arweave.net/${fileEntity.dataTxId}`)
      const dataArrayBuffer = await txDataRes.arrayBuffer()

      const cipherIV = await this.arweaveWallet.queryEngine?.argql.fetchTxTag(fileEntity.dataTxId, 'Cipher-IV')

      if (!cipherIV) throw new Error('CipherIV Missing. Failed to decrypt.')

      const { baseEntityKey } = (await this.crypto.getDriveKey(fileEntity.driveId)) as any
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

        const { baseEntityKey } = (await this.crypto.getDriveKey(modelObject.driveId)) as any
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

  async prepareFileDataItem(file: FileLike, timestamp: string, customTags: Tag[] = []) {
    const sdkTags = getSDKTags()
    const tags = [{ name: 'Unix-Time', value: timestamp }, ...customTags, ...sdkTags] as Tag[]
    const fileTags = applyFileTags(file, tags, this.arweaveWallet.address)

    const dataBuffer = await file.arrayBuffer()
    const dataItem = createData(new Uint8Array(dataBuffer), this.arweaveWallet.signer, { tags: fileTags })

    return dataItem
  }
}

export type CreateFileOptions = {
  name: string // User defined folder name
  driveId: string // UUID of the drive
  parentFolderId: string
  size: number
  dataContentType: string
  file: FileSource
  visibility?: EntityVisibility
  overridedFileName?: boolean
  tags?: Tag[]
}
