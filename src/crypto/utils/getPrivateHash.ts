import { Wallet } from '../../types/api'
import { arweaveInstance } from '../../utils/arweaveInstance'

export async function getPrivateHash(wallet: Wallet, data: Uint8Array): Promise<ArrayBuffer> {
  if (wallet === 'use_wallet') {
    return await window.arweaveWallet.privateHash(data, { hashAlgorithm: 'SHA-256' })
  }

  const hash = await crypto.subtle.digest(
    'SHA-256',
    arweaveInstance.utils.concatBuffers([data, new TextEncoder().encode(wallet.d)])
  )

  return hash
}
