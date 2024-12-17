import React from 'react'
import Drive from './components/Drive'
import useWallet from '../lib/wallet-provider/useWallet'
import Folder from './components/Folder'
import File from './components/File'
import ArFSActionsDropDown from '../components/ArFSActionsDropdown'
import SyncingModal from '../components/SyncingModal'
import { useGlobalStore } from '../store/globalStore'
import ContextMenu from '../components/ContextMenu'
import EntityDetailsModal from '../components/EntityDetailsModal'

export default function ExplorerPage() {
  const [selectedInstance, setSelectedInstance] = React.useState(null)
  const [entityDetailsModalOpen, setEntityDetailsModalOpen] = React.useState(false)
  const { drives, selectedDrive, selectedFolder, folderEntities, isSyncing, pathEntities } = useGlobalStore(
    (state) => state.explorerState
  )
  const {
    syncAllUserDrives,
    syncAllEntitiesInSelectedFolder,
    setSelectedFolder,
    setSelectedDrive,
    removeFromPathEntities
  } = useGlobalStore((state) => state.explorerActions)

  const entityRef = React.useRef()
  const contextMenuRef = React.useRef()

  const { connected } = useWallet()

  // React.useEffect(() => {
  //   const preventDefault = (e) => {
  //     e.preventDefault()
  //   }
  //   window.addEventListener('contextmenu', preventDefault)

  //   const handleCloseContextMenu = (e) => {
  //     if (!contextMenuRef.current.contains(e.target)) {
  //       contextMenuRef.current.classList.add('hidden')
  //     }
  //   }
  //   window.addEventListener('click', handleCloseContextMenu)

  //   return () => {
  //     window.removeEventListener('contextmenu', handleRightClick)
  //     window.removeEventListener('click', handleCloseContextMenu)
  //   }
  // }, [])

  React.useEffect(() => {
    if (connected) {
      syncAllUserDrives()
    }
  }, [connected])

  React.useEffect(() => {
    if (selectedDrive && selectedFolder) {
      syncAllEntitiesInSelectedFolder()
    }
  }, [selectedDrive, selectedFolder])

  function handleRightClick(e, instance) {
    e.preventDefault()
    if (entityRef.current.contains(e.target)) {
      console.log(e.target)
      contextMenuRef.current.classList.remove('hidden')
      contextMenuRef.current.style.left = `${e.clientX}px`
      contextMenuRef.current.style.top = `${e.clientY}px`

      setSelectedInstance(instance)
    } else {
      contextMenuRef.current.classList.add('hidden')
    }
  }

  async function handleDriveClick(drive) {
    setSelectedDrive(drive)
  }

  async function handleFolderClick(folder) {
    setSelectedFolder(folder)
  }

  async function handleFileClick(file) {
    const dataTxId = file.dataTxId

    window.open(`https://arweave.net/${dataTxId}`, '_blank')
  }

  async function handleGoBack() {
    removeFromPathEntities(pathEntities.length - 1)
  }

  function getPathStringFromEntities(entities) {
    let pathString = '> '

    entities.forEach((entity) => {
      if (entity.parentFolderId || entity.entityType === 'drive') {
        pathString += entity.name + ' / '
      }
    })

    return pathString
  }

  return (
    <div className="w-full">
      <div className="m-4 rounded border-2 border-dashed border-slate-600 bg-slate-800">
        <div className="flex py-2 px-2">
          <h1 className="text-xl">{getPathStringFromEntities(pathEntities)}</h1>
        </div>
      </div>
      <div className="w-full flex justify-end p-4 gap-4">
        {selectedFolder && (
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-indigo-50 bg-indigo-500 hover:bg-indigo-500 transition-colors"
          >
            <span className="font-medium text-sm">Go Back</span>
          </button>
        )}
        <ArFSActionsDropDown />
      </div>

      {!selectedFolder && (
        <div
          ref={entityRef}
          className="p-4 min-h-[400px] auto-rows-min grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] mx-4 rounded border-2 border-dashed border-slate-600 bg-slate-800"
        >
          {drives.map((drive, idx) => (
            <Drive handleRigthClick={handleRightClick} handleDriveClick={handleDriveClick} key={idx} instance={drive} />
          ))}
        </div>
      )}
      {selectedFolder && (
        <div
          ref={entityRef}
          className="p-4 min-h-[400px] auto-rows-min grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] m-4 rounded border-2 border-dashed border-slate-600 bg-slate-800"
        >
          {folderEntities.map((entity, idx) =>
            entity.entityType === 'folder' ? (
              <Folder handleRigthClick={handleRightClick} handleFolderClick={handleFolderClick} key={idx} instance={entity} />
            ) : entity.entityType === 'file' ? (
              <File handleRigthClick={handleRightClick} handleFileClick={handleFileClick} key={idx} instance={entity} />
            ) : null
          )}
        </div>
      )}
      {isSyncing && <SyncingModal isOpen={true} setIsOpen={() => {}} />}
      <div className="w-fit absolute hidden" ref={contextMenuRef}>
        <ContextMenu
          handleEntityDetailsClick={() => setEntityDetailsModalOpen(true)}
          selectedInstance={selectedInstance}
        />
      </div>

      <EntityDetailsModal
        selectedEntity={selectedInstance}
        isOpen={entityDetailsModalOpen}
        setIsOpen={setEntityDetailsModalOpen}
      />
    </div>
  )
}
