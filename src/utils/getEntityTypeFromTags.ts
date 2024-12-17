import { Tag } from 'arweave/web/lib/transaction'

import { EntityType } from '../models/Base.model'

export function getEntityTypeFromTags(tags: Tag[]): EntityType | null {
  const entityTag = tags.find((tag) => tag.name === 'Entity-Type')

  if (!entityTag) {
    return null
  }

  return entityTag.value as EntityType
}
