import { Tag } from 'arweave/web/lib/transaction'

import { TAG_NAMES_TO_KEYS } from '../constants'
import { Drive, File, Folder } from '../models'

export function toArweaveTags(model: Drive | Folder | File): { name: string; value: string }[] {
  const tags: { name: string; value: string }[] = [
    { name: 'ArFS', value: model.arFS },
    { name: 'Content-Type', value: model.contentType },
    { name: 'Drive-Id', value: model.driveId },
    { name: 'Entity-Type', value: model.entityType },
    { name: 'Unix-Time', value: model.unixTime.toString() }
  ]

  if (model instanceof Drive) {
    // Handle Drive model
    tags.push({ name: 'Drive-Privacy', value: model.drivePrivacy })
  } else if (model instanceof Folder) {
    // Handle Folder model
    tags.push({ name: 'Folder-Id', value: model.folderId })

    if (model.parentFolderId) {
      tags.push({ name: 'Parent-Folder-Id', value: model.parentFolderId })
    }
  } else if (model instanceof File) {
    // Handle File model
    tags.push({ name: 'File-Id', value: model.fileId })
    tags.push({ name: 'Parent-Folder-Id', value: model.parentFolderId })
  }

  if (model.cipher && model.cipherIv) {
    tags.push({ name: 'Cipher', value: model.cipher })
    tags.push({ name: 'Cipher-IV', value: model.cipherIv })
  }

  return tags
}

export function toModelObject<T>(tags: Tag[]): T {
  const result: Record<string, unknown> = {}

  tags.forEach((tag) => {
    const key = TAG_NAMES_TO_KEYS[tag.name as keyof typeof TAG_NAMES_TO_KEYS]

    result[key] = tag.value
  })

  return result as T
}
