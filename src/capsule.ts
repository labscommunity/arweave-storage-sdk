import { Tag } from 'arweave/web/lib/transaction'

import { ArFSApi } from './api'
import { Crypto } from './crypto'
import { DriveService } from './services/drive.service'
import { FileService } from './services/file.service'
import { FolderService } from './services/folder.service'
import { APIOptions } from './types/api'

export class Capsule {
  public api: ArFSApi
  public crypto: Crypto
  public drive: DriveService
  public folder: FolderService
  public file: FileService
  public appName: string | null = null
  public baseTags: Tag[] = []

  constructor({ gateway, wallet, appName }: APIOptions) {
    if (appName) {
      this.baseTags.push({ name: 'App-Name', value: appName } as Tag)
      this.appName = appName
    }

    this.api = new ArFSApi({ gateway, wallet, appName: this.appName })
    this.crypto = new Crypto(this.api)

    this.drive = new DriveService(this.api, this.baseTags, this.crypto)
    this.folder = new FolderService(this.api, this.baseTags, this.crypto)
    this.file = new FileService(this.api, this.baseTags, this.crypto)
  }
}
