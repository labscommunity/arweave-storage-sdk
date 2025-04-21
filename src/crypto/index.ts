import { EntityKey } from './EntityKey'
import { deriveDriveKey, deriveFileKey, deriveQuickUploadKey } from './utils/keys'
import { ArweaveWallet } from '../wallet/ArweaveWallet'
import { arrayToBase64, base64ToArray } from '../utils/encoding'

export class Crypto {
  arweaveWallet: ArweaveWallet

  constructor(arweaveWallet: ArweaveWallet) {
    this.arweaveWallet = arweaveWallet
  }

  async encryptEntity(data: BufferSource, key: CryptoKey) {
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(12))
    const encryptedEntityBuffer = await globalThis.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv, tagLength: 128 },
      key,
      data
    )

    return {
      cipher: 'AES256-GCM',
      cipherIV: arrayToBase64(iv as any),
      data: encryptedEntityBuffer
    }
  }

  async decryptEntity(key: CryptoKey, iv: string, data: BufferSource) {
    const cipherIV = base64ToArray(iv)

    const decryptedEntity = await globalThis.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: cipherIV, tagLength: 128 },
      key,
      data
    )

    return decryptedEntity
  }

  async getDriveKey(driveId: string) {
    return deriveDriveKey(this.arweaveWallet.getPrivateKey(), driveId)
  }

  async getFileKey(driveKey: EntityKey, fileId: string) {
    return deriveFileKey(driveKey, fileId)
  }

  async getQuickUploadKey(uploadId: string) {
    return deriveQuickUploadKey(this.arweaveWallet.getPrivateKey(), uploadId)
  }
}
