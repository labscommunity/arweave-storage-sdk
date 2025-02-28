/**
 * TokenStorage class provides secure storage for access and refresh tokens
 * with support for both browser and Node.js environments
 */
export class TokenStorage {
  private readonly isWebEnvironment: boolean
  private readonly storagePrefix = 'arweave_storage_'
  private readonly accessTokenKey = `${this.storagePrefix}access_token`
  private readonly refreshTokenKey = `${this.storagePrefix}refresh_token`

  // In-memory storage for Node.js environment
  private static nodeStorage: Map<string, string> = new Map()

  constructor(useWebWallet: boolean) {
    this.isWebEnvironment = useWebWallet
  }

  /**
   * Securely stores the access token
   */
  async setAccessToken(token: string): Promise<void> {
    if (this.isWebEnvironment) {
      try {
        // For web environment, use encrypted sessionStorage
        const encryptedToken = await this.encrypt(token)
        sessionStorage.setItem(this.accessTokenKey, encryptedToken)
      } catch (error) {
        console.error('Failed to store access token:', error)
        throw new Error('Failed to store access token')
      }
    } else {
      // For Node.js environment, use in-memory storage
      TokenStorage.nodeStorage.set(this.accessTokenKey, token)
    }
  }

  /**
   * Securely stores the refresh token
   */
  async setRefreshToken(token: string): Promise<void> {
    if (this.isWebEnvironment) {
      try {
        // For web environment, use encrypted sessionStorage
        const encryptedToken = await this.encrypt(token)
        sessionStorage.setItem(this.refreshTokenKey, encryptedToken)
      } catch (error) {
        console.error('Failed to store refresh token:', error)
        throw new Error('Failed to store refresh token')
      }
    } else {
      // For Node.js environment, use in-memory storage
      TokenStorage.nodeStorage.set(this.refreshTokenKey, token)
    }
  }

  /**
   * Retrieves the access token
   */
  async getAccessToken(): Promise<string | null> {
    if (this.isWebEnvironment) {
      const encryptedToken = sessionStorage.getItem(this.accessTokenKey)
      if (!encryptedToken) return null

      try {
        return await this.decrypt(encryptedToken)
      } catch (error) {
        console.error('Failed to retrieve access token:', error)
        return null
      }
    } else {
      return TokenStorage.nodeStorage.get(this.accessTokenKey) || null
    }
  }

  /**
   * Retrieves the refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    if (this.isWebEnvironment) {
      const encryptedToken = sessionStorage.getItem(this.refreshTokenKey)
      if (!encryptedToken) return null

      try {
        return await this.decrypt(encryptedToken)
      } catch (error) {
        console.error('Failed to retrieve refresh token:', error)
        return null
      }
    } else {
      return TokenStorage.nodeStorage.get(this.refreshTokenKey) || null
    }
  }

  /**
   * Clears all stored tokens
   */
  clearTokens(): void {
    if (this.isWebEnvironment) {
      sessionStorage.removeItem(this.accessTokenKey)
      sessionStorage.removeItem(this.refreshTokenKey)
    } else {
      TokenStorage.nodeStorage.delete(this.accessTokenKey)
      TokenStorage.nodeStorage.delete(this.refreshTokenKey)
    }
  }

  /**
   * Simple encryption using SubtleCrypto for browser environment
   * Note: This is a basic implementation. For production, consider using a more robust encryption solution
   */
  private async encrypt(data: string): Promise<string> {
    if (!this.isWebEnvironment) return data

    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)

    // Generate a random key for encryption
    const key = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt']
    )

    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      dataBuffer
    )

    // Convert the encrypted data to base64
    const encryptedArray = new Uint8Array(encryptedData)
    const base64Encrypted = btoa(String.fromCharCode(...encryptedArray))
    const base64Iv = btoa(String.fromCharCode(...iv))

    // Store the key in sessionStorage temporarily
    const exportedKey = await crypto.subtle.exportKey('raw', key)
    const base64Key = btoa(String.fromCharCode(...new Uint8Array(exportedKey)))

    return JSON.stringify({
      encrypted: base64Encrypted,
      iv: base64Iv,
      key: base64Key
    })
  }

  /**
   * Decryption function for browser environment
   */
  private async decrypt(encryptedData: string): Promise<string> {
    if (!this.isWebEnvironment) return encryptedData

    const { encrypted, iv, key } = JSON.parse(encryptedData)

    // Convert base64 strings back to ArrayBuffer
    const encryptedArray = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0))
    const ivArray = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0))
    const keyArray = Uint8Array.from(atob(key), (c) => c.charCodeAt(0))

    // Import the key
    const cryptoKey = await crypto.subtle.importKey('raw', keyArray, 'AES-GCM', true, ['decrypt'])

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivArray
      },
      cryptoKey,
      encryptedArray
    )

    return new TextDecoder().decode(decryptedData)
  }
}
