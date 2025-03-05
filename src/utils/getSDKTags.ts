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



  if (!updatedTags.find((tag) => tag.name === 'Content-Type')) {
    updatedTags.push({ name: 'Content-Type', value: file.type } as Tag)
  }

  return updatedTags
}
