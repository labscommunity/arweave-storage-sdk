import { Tag } from 'arweave/web/lib/transaction'
import { v4 as uuidv4 } from 'uuid'
import { ArweaveSigner, createData } from 'arbundles'

import { EntityVisibility } from '../types'
import { arweaveInstance } from '../utils/arweaveInstance'
import { toArweaveTags } from '../utils/arweaveTagsUtils'
import { getUnixTime } from '../utils/UnixTime'
import { BaseModel, BaseModelProps } from './Base.model'
import { getSDKTags } from '../utils/getSDKTags'

export interface IFileProps extends BaseModelProps {
  fileId: string
  parentFolderId: string
  name: string // User defined folder name
  size: number
  lastModifiedDate: number // ms
  dataTxId: string
  dataContentType: string
  pinnedDataOwner?: string
  cipher?: string | undefined
  cipherIv?: string | undefined
}

export interface CreateFileProps {
  name: string // User defined folder name
  driveId: string // UUID of the drive
  parentFolderId: string
  size: number
  dataTxId: string
  dataContentType: string
  pinnedDataOwner?: string
  visibility?: EntityVisibility
}

export type FileMetaData = {
  name: string // User defined file name
  size: number
  lastModifiedDate: number // ms
  dataTxId: string
  dataContentType: string
  pinnedDataOwner?: string
}

export class File extends BaseModel {
  arFS: string
  contentType: string
  driveId: string
  fileId: string
  parentFolderId: string
  entityType: 'file'
  unixTime: ReturnType<typeof getUnixTime>
  cipher?: string | undefined
  cipherIv?: string | undefined

  name: string
  size: number
  lastModifiedDate: number // ms
  dataTxId: string
  dataContentType: string
  pinnedDataOwner?: string

  constructor({
    arFS,
    contentType,
    driveId,
    fileId,
    parentFolderId,
    unixTime,
    name,
    size,
    lastModifiedDate,
    dataTxId,
    dataContentType,
    pinnedDataOwner,
    cipher,
    cipherIv
  }: IFileProps) {
    super()

    this.arFS = arFS
    this.contentType = contentType
    this.driveId = driveId
    this.fileId = fileId
    this.parentFolderId = parentFolderId
    this.unixTime = unixTime
    this.entityType = 'file'
    this.cipher = cipher
    this.cipherIv = cipherIv

    this.name = name
    this.size = size
    this.lastModifiedDate = lastModifiedDate
    this.dataTxId = dataTxId
    this.dataContentType = dataContentType
    this.pinnedDataOwner = pinnedDataOwner
  }

  static create(options: CreateFileProps): File {
    const arFS = '0.13' // Assuming a fixed version for this example
    const contentType = options?.visibility === 'private' ? 'application/octet-stream' : 'application/json' // Default content type
    const fileId = uuidv4() // Generate a unique drive ID
    const unixTime = getUnixTime() // Current Unix time in seconds
    const lastModifiedDate = getUnixTime().valueOf() // Current Unix time in seconds

    return new File({
      arFS,
      contentType,
      unixTime,
      fileId,
      lastModifiedDate,
      ...options
    })
  }

  async toTransaction(customTags: Tag[] = [], data?: string | ArrayBuffer | Uint8Array) {
    const tags = this.toArweaveTags() as Tag[]

    const tx = await arweaveInstance.createTransaction({
      data:
        data ||
        JSON.stringify({
          name: this.name,
          size: this.size,
          lastModifiedDate: this.lastModifiedDate,
          dataTxId: this.dataTxId,
          dataContentType: this.dataContentType,
          pinnedDataOwner: this.pinnedDataOwner
        })
    })
    for (const tag of tags) tx.addTag(tag.name, tag.value)
    for (const tag of customTags) tx.addTag(tag.name, tag.value)

    return tx
  }

  async toDataItem(signer: ArweaveSigner, customTags: Tag[] = [], data?: string | ArrayBuffer | Uint8Array) {
    const tags = this.toArweaveTags() as Tag[]
    const sdkTags = getSDKTags()
    const finalTags = [...tags, ...sdkTags, ...customTags]

    if (data instanceof ArrayBuffer) {
      return createData(new Uint8Array(data), signer, { tags: finalTags })
    }

    const metadata = JSON.stringify(this.getMetaData())

    return createData(data || metadata, signer, { tags: finalTags })
  }

  getMetaData() {
    const { name, size, lastModifiedDate, dataContentType, dataTxId, pinnedDataOwner } = this

    return {
      name,
      size,
      lastModifiedDate,
      dataContentType,
      dataTxId,
      pinnedDataOwner
    }
  }

  toArweaveTags() {
    return toArweaveTags(this) as Tag[]
  }
}
