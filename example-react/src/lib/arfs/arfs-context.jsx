import * as React from 'react'
import { getStorageApi } from '../../utils/getStorageClient'
import { useAccount } from 'wagmi'
import { useGlobalStore } from '../../store/globalStore'
import { ArFSApi } from 'arweave-storage-sdk'
const ArFSContext = React.createContext()

export function ArFSProvider({ children }) {
  const [storageClient, setStorageClient] = React.useState(null)
  const [arfsClient, setArfsClient] = React.useState(null)
  const [loginUser] = useGlobalStore((state) => [state.authActions.login])
  const { isConnected } = useAccount()

  React.useEffect(() => {
    if(isConnected){
     getStorage()
    }
  }, [isConnected])

  React.useEffect(() => {
    if (storageClient && isConnected) {
      login()
    }
  }, [storageClient, isConnected])

  async function getStorage() {
    const client = await getStorageApi()
    setStorageClient(client)
  }

  async function login() {
    await storageClient.api.login()
    const profile = await storageClient.api.getUser()
    loginUser({
      isLoggedIn: true,
      address: profile.walletAddress,
      profile
    })

    const arfs = new ArFSApi({ gateway: 'https://arweave.net', address: profile.walletAddress, appName: 'arfs-example' })
    setArfsClient(arfs)
  }
console.log({storageClient, arfsClient})
  return <ArFSContext.Provider value={{ storageClient, arfsClient }}>{children}</ArFSContext.Provider>
}

export function useArFS() {
  const context = React.useContext(ArFSContext)
  if (context === undefined) {
    throw new Error('useArFS must be used within a ArFSProvider')
  }

  return context
}
