import { EntityKey } from '../EntityKey'

export async function getDeriveKey(ikm: ArrayBuffer, option?: { salt?: Buffer; info?: Buffer }) {
  const { salt, info } = option || {}

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    ikm,
    {
      name: 'HKDF',
      hash: 'SHA-256'
    },
    false,
    ['deriveBits', 'deriveKey']
  )

  const keyData = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: salt || new Uint8Array(),
      info: info || new Uint8Array()
    },
    cryptoKey,
    32
  )

  return new EntityKey(cryptoKey, Buffer.from(keyData))
}
