import { getArFSClient } from '../../utils/getArFSClient'
import { getStorageApi } from '../../utils/getStorageClient'
import { waitFor } from '../../utils/waitFor'

const initialExplorerState = {
  drives: [],
  selectedDrive: null,
  selectedFolder: null,
  folderEntities: [],
  pathEntities: [],
  isSyncing: false
}

const createExplorerSlice = (set, get) => ({
  explorerState: initialExplorerState,
  explorerActions: {
    syncAllUserDrives: async () => {
      const userAddress = get().authState.address
      const isSyncing = get().explorerState.isSyncing

      if (!userAddress) {
        // TODO: use toast maybe?
        return
      }

      if (!isSyncing) {
        set((state) => {
          state.explorerState.isSyncing = true
        })
      }

      const arfsClient = getArFSClient()

      try {
        const drives = await arfsClient.drive.listAll()
        const selectedCapsuleDrive = drives[drives.length - 1]

        set((state) => {
          state.explorerState.drives = drives || []
        })

        if (selectedCapsuleDrive) {
          await get().explorerActions.setSelectedDrive(selectedCapsuleDrive)
        }
      } catch (error) {
        console.log({ error })
        // TODO: use toast maybe?
      }

      set((state) => {
        state.explorerState.isSyncing = false
      })
    },
    syncAllEntitiesInSelectedFolder: async () => {
      const { selectedDrive, selectedFolder, isSyncing } = get().explorerState

      if (!selectedDrive || !selectedFolder) {
        // TODO: use toast maybe?
        return
      }

      if (!isSyncing) {
        set((state) => {
          state.explorerState.isSyncing = true
        })
      }

      const arfsClient = getArFSClient()

      try {
        const entities = await arfsClient.folder.listAll(selectedFolder.folderId, selectedDrive.driveId)

        set((state) => {
          state.explorerState.folderEntities = entities || []
        })
      } catch (error) {
        console.log({ error })
        // TODO: use toast maybe?
      }

      set((state) => {
        state.explorerState.isSyncing = false
      })
    },
    createDrive: async (name, isPrivate) => {
      const userAddress = get().authState.address

      if (!userAddress) {
        // TODO: use toast maybe?
        return
      }

      const arfsClient = getArFSClient()

      try {
        const drive = await arfsClient.drive.create(name, { visibility: isPrivate ? 'private' : 'public' })

        set((state) => {
          state.explorerState.drives.push(drive)
        })

        await get().explorerActions.setSelectedDrive(drive)
      } catch (error) {
        console.log({ error })
        // TODO: use toast maybe?
      }

      await waitFor(500)
    },
    createFolder: async (name) => {
      const userAddress = get().authState.address
      const { selectedDrive, selectedFolder } = get().explorerState

      if (!userAddress) {
        // TODO: use toast maybe?
        return
      }

      if (!selectedDrive || !selectedFolder) {
        // TODO: use toast maybe?
        return
      }

      const arfsClient = getArFSClient()

      try {
        const folder = await arfsClient.folder.create(name, {
          driveId: selectedDrive.driveId,
          parentFolderId: selectedFolder.folderId,
          visibility: selectedDrive.drivePrivacy === 'private' ? 'private' : 'public'
        })

        set((state) => {
          state.explorerState.folderEntities.push(folder)
        })
      } catch (error) {
        console.log({ error })
        // TODO: use toast maybe?
      }

      await waitFor(500)
    },
    createFile: async (file) => {
      const userAddress = get().authState.address
      const { selectedDrive, selectedFolder } = get().explorerState

      if (!userAddress) {
        // TODO: use toast maybe?
        return
      }

      if (!selectedDrive || !selectedFolder) {
        // TODO: use toast maybe?
        return
      }

      const arfsClient = getArFSClient()
      const fileBuffer = await file.arrayBuffer()

      try {
        const fileEntity = await arfsClient.file.create({
          name: file.name,
          size: file.size,
          dataContentType: file.type,
          driveId: selectedDrive.driveId,
          parentFolderId: selectedFolder.folderId,
          file: fileBuffer,
          visibility: selectedDrive.drivePrivacy === 'private' ? 'private' : 'public'
        })

        set((state) => {
          state.explorerState.folderEntities.push(fileEntity)
        })
      } catch (error) {
        console.log({ error })
        // TODO: use toast maybe?
      }

      await waitFor(500)
    },
    uploadFile: async (file) => {
      const userAddress = get().authState.address

      if (!userAddress) {
        // TODO: use toast maybe?
        return
      }
    
      const storageApi = await getStorageApi()

      try {
        const {success} = await storageApi.quickUpload(file,{
          name: file.name,
          size: file.size,
          dataContentType: file.type,
          tags: [{ name: 'Content-Type', value: file.type }]
        })

       return success
      } catch (error) {
        console.log({ error })
        // TODO: use toast maybe?
      }

      await waitFor(500)
    },
    getEstimates: async (size) => {
      const storageApi = await getStorageApi()
      const response = await storageApi.getEstimates(size)
      return response
    },
    addToPathEntities: (entity) => {
      set((state) => {
        state.explorerState.pathEntities.push(entity)
      })
    },
    removeFromPathEntities: (uptoIdx) => {
      let updatedPathEntities = get().explorerState.pathEntities.slice(0, uptoIdx)
      let selectedFolder = null

      if (updatedPathEntities.length > 0) {
        const lastItem = updatedPathEntities[updatedPathEntities.length - 1]

        if (lastItem.entityType === 'folder') {
          selectedFolder = lastItem
        }

        if (lastItem.entityType === 'drive') {
          updatedPathEntities = []
        }
      }

      if (updatedPathEntities.length === 0) {
        set((state) => {
          state.explorerState.selectedDrive = null
        })
      }

      set((state) => {
        state.explorerState.pathEntities = updatedPathEntities
        state.explorerState.selectedFolder = selectedFolder
      })
    },
    setSelectedFolder: (folder) => {
      set((state) => {
        state.explorerState.selectedFolder = folder
        state.explorerState.pathEntities.push(folder)
      })
    },
    setSelectedDrive: async (drive) => {
      const { isSyncing } = get().explorerState

      if (!isSyncing) {
        set((state) => {
          state.explorerState.isSyncing = true
        })
      }
      const arfsClient = getArFSClient()

      try {
        const folderInstance = await arfsClient.folder.get(drive.rootFolderId, drive.driveId)

        if (!folderInstance) {
          // TODO: use toast maybe?
          throw 'Failed to get root folder instance'
        }

        set((state) => {
          state.explorerState.selectedDrive = drive
          state.explorerState.selectedFolder = folderInstance

          state.explorerState.pathEntities.push(drive)
          state.explorerState.pathEntities.push(folderInstance)
        })
      } catch (error) {
        console.log({ error })
        // TODO: use toast maybe?
      }

      set((state) => {
        state.explorerState.isSyncing = false
      })
    },
    setIsSyncing: (value) => {
      set((state) => {
        state.explorerState.isSyncing = value
      })
    }
  }
})

export default createExplorerSlice
