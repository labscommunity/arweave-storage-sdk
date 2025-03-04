import { FileLike } from '../types/file'
import { BadRequest } from './errors/bad-request'
import { FileSource } from '../types/file'
import { isServer } from './platform'
import { getMimeTypeFromFileName } from './mimetypes'

export async function createFileLike(source: FileSource, options: FileOptions = {}): Promise<FileLike> {
  const name = options.name || (source as any).name
  if (!isServer()) {
    if (source instanceof File) {
      return source
    }
    if (!name) {
      throw new BadRequest('File name is required, please provide it in the file options.')
    }
    const mimeType = options.mimeType || getMimeTypeFromFileName(name)
    if (!mimeType) {
      console.warn('Missing file mime type. If this is unintentional, please provide it in the file options.')
    }
    if (source instanceof Uint8Array || source instanceof ArrayBuffer || source instanceof Blob) {
      return new File([source as any], name, { type: mimeType, lastModified: options.lastModified })
    } else if (source instanceof Array) {
      return new File(source, name, { type: mimeType, lastModified: options.lastModified })
    }
  } else {
    const nodeJsFile = (await import('../types/file')).NodeJs.File
    if (typeof source?.read === 'function') {
      return nodeJsFile.fromReadable(source, name, options.mimeType, options.lastModified)
    } else if (source instanceof Uint8Array || source instanceof Buffer || source instanceof ArrayBuffer) {
      return new nodeJsFile([source as any], name, options.mimeType, options.lastModified)
    } else if (source instanceof nodeJsFile) {
      return source
    } else if (typeof source === 'string') {
      return nodeJsFile.fromPath(source, name, options.mimeType, options.lastModified)
    } else if (source instanceof Array) {
      return new nodeJsFile(source, name, options.mimeType, options.lastModified)
    }
  }

  throw new BadRequest(
    'File source is not supported. Please provide a valid source: web File object, file path, buffer or stream.'
  )
}

export type FileOptions = {
  name?: string
  mimeType?: string
  lastModified?: number
}
