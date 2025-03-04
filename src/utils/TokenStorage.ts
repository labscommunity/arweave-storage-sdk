import { Level } from 'level'
import { AUTH_TOKEN_DB_PATH } from '../constants'
import { isServer } from './platform'
import { importDynamic } from './importDynamic'

/**
 * TokenStorage class provides secure storage for access and refresh tokens
 * with support for both browser and Node.js environments using LevelDB
 */
export class TokenStorage {
  private readonly storagePrefix = 'arweave_storage_'
  private readonly accessTokenKey = `${this.storagePrefix}access_token`
  private readonly refreshTokenKey = `${this.storagePrefix}refresh_token`
  private readonly addressKey = `${this.storagePrefix}address`
  private static db: Level | null = null

  constructor() {
    this.initialize()
  }

  private initialize() {
    if (!TokenStorage.db) {
      if (isServer()) {
        // Node.js environment
        const { mkdirSync } = importDynamic('fs')
        const { join } = importDynamic('path')
        const { homedir } = importDynamic('os')
        mkdirSync(join(homedir(), AUTH_TOKEN_DB_PATH), { recursive: true })
      }
      TokenStorage.db = new Level(TokenStorage.getDBPath())
    }
  }

  /**
   * Stores the access token
   */
  async setAccessToken(token: string): Promise<void> {
    try {
      await TokenStorage.db!.put(this.accessTokenKey, token)
    } catch (error) {
      console.error('Failed to store access token:', error)
      throw new Error('Failed to store access token')
    }
  }

  /**
   * Stores the refresh token
   */
  async setRefreshToken(token: string): Promise<void> {
    try {
      await TokenStorage.db!.put(this.refreshTokenKey, token)
    } catch (error) {
      console.error('Failed to store refresh token:', error)
      throw new Error('Failed to store refresh token')
    }
  }

  async setAddress(address: string): Promise<void> {
    try {
      await TokenStorage.db!.put(this.addressKey, address)
    } catch (error) {
      console.error('Failed to store address:', error)
      throw new Error('Failed to store address')
      }
  }

  async getAddress(): Promise<string | null> {
    try {
      const address = await TokenStorage.db!.get(this.addressKey)
      return address
    } catch (error) {
      console.error('Failed to retrieve address:', error)
      return null
    }
  }

  /**
   * Retrieves the access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await TokenStorage.db!.get(this.accessTokenKey)
      return token
    } catch (error) {
      if ((error as any).code === 'LEVEL_NOT_FOUND') {
        return null
      }
      console.error('Failed to retrieve access token:', error)
      return null
    }
  }

  /**
   * Retrieves the refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const token = await TokenStorage.db!.get(this.refreshTokenKey)
      return token
    } catch (error) {
      if ((error as any).code === 'LEVEL_NOT_FOUND') {
        return null
      }
      console.error('Failed to retrieve refresh token:', error)
      return null
    }
  }

  /**
   * Clears all stored tokens
   */
  async clearTokens(): Promise<void> {
    try {
      await TokenStorage.db!.batch([
        { type: 'del', key: this.accessTokenKey },
        { type: 'del', key: this.refreshTokenKey }
      ])
    } catch (error) {
      console.error('Failed to clear tokens:', error)
    }
  }

  private static getDBPath(): string {
    return isServer()
      ? (() => {
          const { join } = importDynamic('path')
          const { homedir } = importDynamic('os')
          return join(homedir(), AUTH_TOKEN_DB_PATH)
        })()
      : AUTH_TOKEN_DB_PATH
  }
}
