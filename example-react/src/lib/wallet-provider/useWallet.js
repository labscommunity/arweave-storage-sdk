import React from 'react'

import { WalletProviderContext } from './Provider'

export default function useWallet() {
  const wallet = React.useContext(WalletProviderContext)

  if (!wallet) {
    throw new Error('useWallet must be used within WalletProvider')
  }

  return wallet
}
