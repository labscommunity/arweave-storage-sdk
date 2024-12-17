import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ArFSProvider } from './lib/arfs/arfs-context.jsx'
import { ArweaveWalletKit } from '@arweave-wallet-kit/react'
import ArConnectStrategy from '@arweave-wallet-kit/arconnect-strategy'
import OthentStrategy from '@arweave-wallet-kit/othent-strategy'
import BrowserWalletStrategy from '@arweave-wallet-kit/browser-wallet-strategy'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ArweaveWalletKit
      config={{
        permissions: [
          'ACCESS_ADDRESS',
          'ACCESS_ALL_ADDRESSES',
          'ACCESS_PUBLIC_KEY',
          'DECRYPT',
          'DISPATCH',
          'ENCRYPT',
          'SIGN_TRANSACTION'
        ],
        ensurePermissions: true,
        strategies: [new ArConnectStrategy(), new OthentStrategy(), new BrowserWalletStrategy()]
      }}
    >
      <ArFSProvider>
        <App />
      </ArFSProvider>
    </ArweaveWalletKit>
  </React.StrictMode>
)
