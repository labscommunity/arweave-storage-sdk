import { Wallet } from '../../types/api'
import { arweaveInstance } from '../../utils/arweaveInstance'

export async function getPrivateHash(wallet: Wallet, data: Uint8Array): Promise<ArrayBuffer> {
  const hash = await globalThis.crypto.subtle.digest(
    'SHA-256',
    arweaveInstance.utils.concatBuffers([data, new TextEncoder().encode(wallet.d)])
  )

  return hash
}
