import { Tag } from 'arweave/web/lib/transaction'

import {
  Drive,
  DriveMetaData,
  DriveOptions,
  File,
  FileMetaData,
  Folder,
  FolderMetaData,
  IFileProps,
  IFolderProps
} from '../models'
import { toModelObject } from './arweaveTagsUtils'
import { getEntityTypeFromTags } from './getEntityTypeFromTags'

export async function transactionToEntityInstance(txId: string, tags: Tag[]): Promise<Drive | Folder | File | null> {
  let instance: Drive | Folder | File | null = null

  try {
    const txRes = await fetch(`https://arweave.net/${txId}`)
    const data = (await txRes.json()) as FolderMetaData | FileMetaData | DriveMetaData

    const entityType = getEntityTypeFromTags(tags)

    if (!entityType) throw 'Failed to find entity.'

    const modelObject = toModelObject<IFileProps | IFolderProps | DriveOptions>(tags)
    if (entityType === 'file') {
      instance = new File({ ...(modelObject as IFileProps), ...data })
    } else if (entityType === 'folder') {
      instance = new Folder({ ...(modelObject as IFolderProps), ...data })
    } else if (entityType === 'drive') {
      instance = new Drive({ ...(modelObject as DriveOptions), ...data })
    }

    if (!instance) return null

    instance.setId(txId)
    return instance
  } catch (error) {
    throw new Error('Failed to prepare drive instance.')
  }
}
