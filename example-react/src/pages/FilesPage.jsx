import React from 'react'
import { useGlobalStore } from '../store/globalStore'
import { format } from 'date-fns'
import clsx from 'clsx'
import { Navbar } from '../components/Navbar'
import { formatSize } from '../utils/formatSize'
export default function FilesPage() {
  const [profile] = useGlobalStore((state) => [state.authState.profile])
  console.log({profile})
  // const { syncAllEntitiesInSelectedFolder, removeFromPathEntities } = useGlobalStore((state) => state.explorerActions)
  // const { selectedDrive, selectedFolder, folderEntities, pathEntities } = useGlobalStore((state) => state.explorerState)

  // React.useEffect(() => {
  //   if (!selectedFolder || !selectedDrive) return
  //   syncAllEntitiesInSelectedFolder()
  // }, [selectedFolder, selectedDrive])

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
    // removeFromPathEntities(idx)
  }


  return (
    <div className="ml-64 p-6 w-full">
      <div className="flex items-center justify-end mb-6">
    
        <Navbar />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center w-1/2">
            <span className="font-medium">Name</span>
            <i className="bi bi-chevron-down ml-1"></i>
          </div>
          <div className="w-1/4">Modified</div>
          <div className="w-1/4">Content Type</div>
          <div className="w-1/4">Size</div>
          <div className="w-1/4">Status</div>

          <div className="w-8"></div>
        </div>

        <div className="divide-y">
          {profile && profile?.uploads && profile?.uploads?.length > 0 && profile?.uploads?.map((entity) => (
            <TableRow key={entity.id} entity={entity} />
          ))}
          {!profile || !profile?.uploads || profile?.uploads?.length === 0 && (
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

  function handleRowClick(ety) {
    if(!ety.arweaveTxId) return
    window.open(`https://arweave.net/${ety.arweaveTxId}`, '_blank')
  }

  return (
    <div className="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50" onClick={() => handleRowClick(entity)}>
      <div className="flex items-center w-1/2">
      <i className="bi bi-file-earmark-text-fill text-[#0061FF] mr-3"></i>
        <span>{entity.fileName}</span>
      </div>
      <div className="w-1/4">{format(new Date(entity.updatedAt), 'dd/MM/yyyy')}</div>
      <div className="w-1/4">{entity.mimeType}</div>
      <div className="w-1/4">{formatSize(entity.size)}</div>
      <div className="w-1/4">{entity.status}</div>
      <div className="w-8 text-center">⋮</div>
    </div>
  )
}
