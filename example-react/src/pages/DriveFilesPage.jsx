import React from 'react'
import { useGlobalStore } from '../store/globalStore'
import { format } from 'date-fns'
import clsx from 'clsx'
import { Navbar } from '../components/Navbar'
export default function DriveFilesPage() {
  const { syncAllEntitiesInSelectedFolder, removeFromPathEntities } = useGlobalStore((state) => state.explorerActions)
  const { selectedDrive, selectedFolder, folderEntities, pathEntities } = useGlobalStore((state) => state.explorerState)

  React.useEffect(() => {
    if (!selectedFolder || !selectedDrive) return
    syncAllEntitiesInSelectedFolder()
  }, [selectedFolder, selectedDrive])

  function getPathStringFromEntities(entities) {
    let pathArray = []

    entities.forEach((entity) => {
      if (entity.parentFolderId || entity.entityType === 'drive') {
        pathArray.push(entity.name)
      }
    })

    return pathArray
  }

  function handleGoBack(idx) {
    removeFromPathEntities(idx)
  }


  return (
    <div className="ml-64 p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold capitalize">
          {getPathStringFromEntities(pathEntities).map((path, idx, arr) => (
            <>
              <span
                onClick={() => handleGoBack(idx + 2)}
                className={clsx('cursor-pointer', {
                  'text-gray-500': idx !== arr.length - 1,
                  'hover:underline': idx !== arr.length - 1
                })}
              >
                {path}
              </span>
              {idx !== arr.length - 1 && (
                <span className="px-2" key={idx}>
                  {'>'}
                </span>
              )}
            </>
          ))}
        </h1>
        <Navbar />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center w-1/2">
            <span className="font-medium">Name</span>
            <i className="bi bi-chevron-down ml-1"></i>
          </div>
          <div className="w-1/4">Modified</div>
          <div className="w-1/4">Revisions</div>
          <div className="w-8"></div>
        </div>

        <div className="divide-y">
          {folderEntities.map((entity) => (
            <TableRow key={entity.id} entity={entity} />
          ))}
          {folderEntities.length === 0 && (
            <div className="p-4 w-full text-center text-gray-500 h-20 flex items-center justify-center">
              No files found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TableRow({ entity }) {
  const [setSelectedFolder] = useGlobalStore((state) => [state.explorerActions.setSelectedFolder])

  function handleRowClick(ety) {
    if (ety.entityType === 'folder') {
      setSelectedFolder(ety)
    }

    if (ety.entityType === 'file') {
      window.open(`https://arweave.net/${ety.dataTxId}`, '_blank')
    }
  }

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50" onClick={() => handleRowClick(entity)}>
      <div className="flex items-center w-1/2">
        {entity.entityType === 'folder' && <i className="bi bi-folder-fill text-[#0061FF] mr-3"></i>}
        {entity.entityType === 'file' && <i className="bi bi-file-earmark-text-fill text-[#0061FF] mr-3"></i>}
        <span>{entity.name}</span>
      </div>
      <div className="w-1/4">{format(new Date(entity.unixTime * 1000), 'dd/MM/yyyy')}</div>
      <div className="w-1/4">-</div>
      <div className="w-8 text-center">⋮</div>
    </div>
  )
}
