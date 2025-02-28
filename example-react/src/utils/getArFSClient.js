import { ArFSApi } from 'arweave-storage-sdk'
import { useGlobalStore } from '../store/globalStore'

export async function getArFSClient() {
  const { address } = useGlobalStore.getState().authState
  if (!address) {
    throw new Error('No address found')
  }
  
  const arfs = new ArFSApi({ gateway: 'https://arweave.net', address, appName: 'arfs-example' })
  return arfs
}
