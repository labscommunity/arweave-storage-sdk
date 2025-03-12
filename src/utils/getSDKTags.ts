import { Tag } from 'arweave/web/lib/transaction'
import { FileLike } from '../types/file'

export function getSDKTags() {
  return [
    { name: 'SDK-Name', value: 'Arweave Storage SDK' },
    { name: 'SDK-Version', value: '0.1' }
  ] as Tag[]
}

export function applyFileTags(file: FileLike, tags: Tag[], address: string) {
  const updatedTags: Tag[] = [
    ...tags,
    { name: 'File-Name', value: file.name },
    { name: 'Upload-Method', value: 'Quick-Upload' }
  ] as Tag[]

  const contentTypeTagIndex = updatedTags.findIndex((tag) => tag.name === 'Content-Type')

  if (contentTypeTagIndex === -1) {
    updatedTags.push({ name: 'Content-Type', value: file.type || 'application/octet-stream' } as Tag)
  } else if (contentTypeTagIndex !== -1) {
    const type = updatedTags[contentTypeTagIndex].value
    if (!type) {
      updatedTags[contentTypeTagIndex] = { name: 'Content-Type', value: file.type || 'application/octet-stream' } as Tag
    }
  }

  return updatedTags
}
