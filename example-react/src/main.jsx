import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ArFSProvider } from './lib/arfs/arfs-context.jsx'
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {

  base,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import '@rainbow-me/rainbowkit/styles.css';
import { Toaster } from 'react-hot-toast';
const config = getDefaultConfig({
  appName: 'Capsule Storage',
  projectId: 'YOUR_PROJECT_ID',
  chains: [base],
  ssr: false, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')).render(
      <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider config={config}>
          <ArFSProvider>
            <App />
            <Toaster />
          </ArFSProvider>
        </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
)
