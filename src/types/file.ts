import { Blob } from 'buffer'

import { BadRequest } from '../utils/errors/bad-request'
import { NotFound } from '../utils/errors/not-found'
import { importDynamic } from '../utils/importDynamic'
import { getMimeTypeFromFileName } from '../utils/mimetypes'
import { DEFAULT_FILE_TYPE } from '../utils/mimetypes'
import { isServer } from '../utils/platform'

export namespace NodeJs {
  export class File extends Blob {
    name: string
    lastModified: number

    constructor(sources: Array<any | Blob>, name: string, mimeType?: string, lastModified?: number) {
      if (!name) {
        throw new BadRequest('File name is required, please provide it in the file options.')
      }
      const type = mimeType || getMimeTypeFromFileName(name)
      super(sources, { type: type })
      this.name = name
      this.lastModified = lastModified
    }

    static async fromReadable(stream: any, name: string, mimeType?: string, lastModified?: number) {
      const chunks = []
      for await (const chunk of stream) chunks.push(chunk)
      return new File(chunks, name, mimeType, lastModified)
    }

    static async fromPath(filePath: string, name?: string, mimeType?: string, lastModified?: number) {
      if (isServer()) {
        const fs = await importDynamic('fs')
        const path = await importDynamic('path')
        const mime = await importDynamic('mime-types')

        if (!fs.existsSync(filePath)) {
          throw new NotFound('Could not find a file in your filesystem: ' + filePath)
        }
        const stats = fs.statSync(filePath)

        const fileName = name || path.basename(filePath)
        const fileType = mimeType || mime.lookup(fileName) || DEFAULT_FILE_TYPE
        const fileLastModified = lastModified || stats.ctime.getTime()

        const file = new File([fs.readFileSync(filePath)], fileName, fileType, fileLastModified) as NodeJs.File
        return file
      } else {
        throw new BadRequest('Method not valid for browsers.')
      }
    }
  }
}

export type FileLike = NodeJs.File | File

export type FileSource = FileLike | ArrayBuffer | Buffer | string | ReadableStream | Array<any> | any
