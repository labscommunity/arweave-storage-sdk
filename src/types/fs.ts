import { Entity } from "./model"

export interface IBackend {
  // highly recommended - usually necessary for apps to work
  readFile(filepath: string, opts: EncodingOpts): Promise<Uint8Array | string | null> // throws ENOENT
  writeFile(filepath: string, data: Uint8Array | string, opts: EncodingOpts): void // throws ENOENT
  unlink(filepath: string, opts: any): void // throws ENOENT
  readdir(filepath: string, opts: any): Awaited<string[]> // throws ENOENT, ENOTDIR
  mkdir(filepath: string, opts: any): void // throws ENOENT, EEXIST
  rmdir(filepath: string, opts: any): void // throws ENOENT, ENOTDIR, ENOTEMPTY

  // recommended - often necessary for apps to work
  stat(filepath: string, opts: any): Awaited<StatLike> // throws ENOENT
  lstat(filepath: string, opts: any): Awaited<StatLike> // throws ENOENT

  // suggested - used occasionally by apps
  rename(oldFilepath: string, newFilepath: string): void // throws ENOENT
  readlink(filepath: string, opts: any): Awaited<string> // throws ENOENT
  symlink(target: string, filepath: string): void // throws ENOENT

  // bonus - not part of the standard `fs` module
  backFile(filepath: string, opts: any): void
  du(filepath: string): Awaited<number>

  // lifecycle - useful if your backend needs setup and teardown
  init?(name: string, opts: BackendInitOptions): Awaited<void> // passes initialization options
  activate?(): Awaited<void> // called before fs operations are started
  deactivate?(): Awaited<void> // called after fs has been idle for a while
  destroy?(): Awaited<void> // called before hotswapping backends
}

export type EncodingOpts = {
  encoding?: 'utf8'
  mode?: number
  writeToArFS?: boolean
  dataTxId?: string
  dataContentType?: string
  fileEntity?: Entity
}

export type StatLike = {
  type: 'file' | 'dir' | 'symlink'
  mode: number
  size: number
  ino: number | string | BigInt
  mtimeMs: number
  ctimeMs?: number
  target?: string
}

export type BackendInitOptions = {
  wipe?: boolean
  /**
   * Let readFile requests fall back to an HTTP request to this base URL
   * @default false
   */
  url?: string
  /**
   * Fall back to HTTP for every read of a missing file, even if unbacked
   * @default false
   */
  urlauto?: boolean
  /**
   * Customize the database name
   */
  fileDbName?: string
  /**
   * Customize the store name
   */
  fileStoreName?: string
  /**
   * Customize the database name for the lock mutex
   */
  lockDbName?: string
  /**
   * Customize the store name for the lock mutex
   */
  lockStoreName?: string
  /**
   * If true, avoids mutex contention during initialization
   * @default false
   */
  defer?: boolean
  /**
   * Custom database instance
   * @default null
   */
  db?: IDB | null
}

export interface IDB {
  saveSuperblock(sb: Uint8Array): TypeOrPromise<void>
  loadSuperblock(): TypeOrPromise<SuperBlock>
  loadFile(inode: number): TypeOrPromise<Uint8Array>
  writeFile(inode: number, data: Uint8Array): TypeOrPromise<void>
  wipe(): TypeOrPromise<void>
  close(): TypeOrPromise<void>
}
export type TypeOrPromise<T> = T | Promise<T>
export type SuperBlock = Map<string | number, any>
