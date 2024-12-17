import Transaction, { Tag } from 'arweave/web/lib/transaction'
import { DataItem } from 'warp-arbundles'

import { Drive, File, Folder } from '../models'

export interface IModel {
  toTransaction: () => Promise<Transaction>
  toDataItem: (signer: any) => Promise<DataItem>
  toArweaveTags: () => Tag[]
}

export interface EntityMap {
  [path: string]: Folder | File
}

export type Entity = File | Folder | Drive
export type EntityVisibility = 'public' | 'private'
export { Drive, File, Folder }