import { JWKInterface } from 'arweave/web/lib/wallet'

export async function getSignature(jwk: JWKInterface, data: Uint8Array): Promise<Uint8Array> {
  // Import the JWK as a CryptoKey
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'RSA-PSS',
      hash: { name: 'SHA-256' }
    },
    false,
    ['sign']
  )

  // Sign the data using RSA-PSS with saltLength = 0
  const signature = await globalThis.crypto.subtle.sign(
    {
      name: 'RSA-PSS',
      saltLength: 0 // Matching your Node.js implementation
    },
    cryptoKey,
    data
  )

  return new Uint8Array(signature)
}
