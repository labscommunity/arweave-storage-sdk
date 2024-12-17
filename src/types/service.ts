import { Tag } from 'arweave/web/lib/transaction'

import { EntityVisibility } from './model'

export type CreateDriveOptions = {
  visibility?: EntityVisibility
  tags?: Tag[]
}
