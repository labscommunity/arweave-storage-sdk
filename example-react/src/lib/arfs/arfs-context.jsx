import * as React from 'react'
import { getArFSClient } from '../../utils/getArFSClient'
import { useConnection } from '@arweave-wallet-kit/react'

const ArFSContext = React.createContext()

export function ArFSProvider({ children }) {
  const [arfsClient, setArfsClient] = React.useState({})
  const { connected } = useConnection()

  React.useEffect(() => {
    if(connected){
      const client = getArFSClient()
      setArfsClient(client)
    }
  }, [connected])

  return <ArFSContext.Provider value={{ arfsClient }}>{children}</ArFSContext.Provider>
}

export function useArFS() {
  const context = React.useContext(ArFSContext)
  if (context === undefined) {
    throw new Error('useArFS must be used within a ArFSProvider')
  }

  return context
}
