import { File, Folder } from '../models'

export function getUniqueEntities(entities: (File | Folder)[]): (File | Folder)[] {
  const mapObj = new Map()

  entities.forEach((entity) => {
    let prevValue = null

    if (entity instanceof File) {
      prevValue = mapObj.get(entity.fileId)
    }

    if (entity instanceof Folder) {
      prevValue = mapObj.get(entity.folderId)
    }

    if (!prevValue) {
      if (entity instanceof File) {
        mapObj.set(entity.fileId, entity)
      }

      if (entity instanceof Folder) {
        mapObj.set(entity.folderId, entity)
      }
    }
  })

  return [...mapObj.values()]
}
