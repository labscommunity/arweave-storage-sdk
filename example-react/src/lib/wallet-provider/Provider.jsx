import React from 'react'
import { useGlobalStore } from '../../store/globalStore'

export const WalletProviderContext = React.createContext(null)

export default function WalletProvider({ children }) {
  const [activeAddress, setActiveAddress] = React.useState('')
  const [connected, setConnected] = React.useState(false)
  const [status, setStatus] = React.useState('idle')

  React.useEffect(() => {
    if (connected) {
      // getAllUserGists();
    }
  }, [connected])

  async function handleConnectionWithArConnect() {
    if (!window.arweaveWallet) return

    setStatus('connecting')

    try {
      const connectionExists = await reConnect()

      if (connectionExists) return

      await window.arweaveWallet.connect(
        [
          'ACCESS_ADDRESS',
          'ACCESS_PUBLIC_KEY',
          'ACCESS_ALL_ADDRESSES',
          'SIGN_TRANSACTION',
          'ENCRYPT',
          'DECRYPT',
          'SIGNATURE',
          'ACCESS_ARWEAVE_CONFIG',
          'DISPATCH'
        ],
        { name: 'ArFS Demo' }
      )

      const address = await window.arweaveWallet.getActiveAddress()

      setActiveAddress(address)
      setConnected(true)

      useGlobalStore.getState().authActions.login({ isLoggedIn: true, address, method: 'arconnect' })

      setStatus('connected')
    } catch (error) {
      console.error('Failed to connect')
      setStatus('idle')
    }
  }

  async function reConnect() {
    const permissions = await window.arweaveWallet.getPermissions()

    if (permissions.length > 0) {
      const address = await window.arweaveWallet.getActiveAddress()

      setActiveAddress(address)
      setConnected(true)
      setStatus('connected')

      useGlobalStore.getState().authActions.login({ isLoggedIn: true, address, method: 'arconnect' })

      return true
    }

    return false
  }

  async function disconnect() {
    if (!connected) return

    await window.arweaveWallet.disconnect()

    useGlobalStore.getState().authActions.logout()

    setActiveAddress('')
    setConnected(false)
  }

  return (
    <WalletProviderContext.Provider
      value={{
        activeAddress,
        status,
        connected,
        handleConnectionWithArConnect,
        disconnect,
        reConnect
      }}
    >
      {children}
    </WalletProviderContext.Provider>
  )
}
