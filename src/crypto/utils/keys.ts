import { parse } from 'uuid'

import { Wallet } from '../../types/api'
import { EntityKey } from '../EntityKey'
import { getDeriveKey } from './getDeriveKey'
import { getPrivateHash } from './getPrivateHash'

export async function deriveDriveKey(wallet: Wallet, driveId: string) {
  const entityIdBytes: Buffer = Buffer.from(parse(driveId) as Uint8Array) // The UUID of the driveId is the SALT used for the drive key
  const entityBuffer: Buffer = Buffer.from(new TextEncoder().encode('drive'))

  const dataToHash: Buffer = Buffer.concat([entityBuffer, entityIdBytes] as Uint8Array[])
  const hash: ArrayBuffer = await getPrivateHash(wallet, dataToHash as Uint8Array)

  const baseEntityKey = await getDeriveKey(hash)

  const cryptoKey = await window.crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(),
      info: new Uint8Array()
    },
    baseEntityKey.cryptoKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )

  return { baseEntityKey, aesKey: cryptoKey }
}

export async function deriveFileKey(driveEntityKey: EntityKey, fileId: string): Promise<CryptoKey> {
  const entityIdBytes: Buffer = Buffer.from(parse(fileId) as Uint8Array) // The UUID of the driveId is the SALT used for the drive key
  const entityBuffer: Buffer = Buffer.from(new TextEncoder().encode('file'))

  const info: Buffer = Buffer.concat([entityBuffer, entityIdBytes] as Uint8Array[])
  const driveEntityKeyBuffer = driveEntityKey.keyData.buffer.slice(info.byteOffset, info.byteOffset + info.byteLength)
  const baseEntityKey = await getDeriveKey(driveEntityKeyBuffer as ArrayBuffer, { info })

  const cryptoKey = await window.crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(),
      info: new Uint8Array()
    },
    baseEntityKey.cryptoKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )

  return cryptoKey
}
