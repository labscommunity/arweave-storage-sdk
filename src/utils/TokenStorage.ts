import { Level } from 'level'
import { AUTH_TOKEN_DB_PATH } from '../constants'

/**
 * TokenStorage class provides secure storage for access and refresh tokens
 * with support for both browser and Node.js environments using LevelDB
 */
export class TokenStorage {
  private readonly storagePrefix = 'arweave_storage_'
  private readonly accessTokenKey = `${this.storagePrefix}access_token`
  private readonly refreshTokenKey = `${this.storagePrefix}refresh_token`
  private static db: Level | null = null
  private readonly ready: Promise<void>

  constructor() {
    this.ready = this.initialize()
  }

  private async initialize() {
    if (!TokenStorage.db) {
      if (typeof window === 'undefined') {
        // Node.js environment
        const { mkdirSync } = await import('fs')
        const { join } = await import('path')
        const { homedir } = await import('os')
        mkdirSync(join(homedir(), AUTH_TOKEN_DB_PATH), { recursive: true })
      }
      TokenStorage.db = new Level(await TokenStorage.getDBPath())
    }
  }

  /**
   * Stores the access token
   */
  async setAccessToken(token: string): Promise<void> {
    try {
      if (!TokenStorage.db) {
        await this.ready
      }
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
      if (!TokenStorage.db) {
        await this.ready
      }
      await TokenStorage.db!.put(this.refreshTokenKey, token)
    } catch (error) {
      console.error('Failed to store refresh token:', error)
      throw new Error('Failed to store refresh token')
    }
  }

  /**
   * Retrieves the access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      if (!TokenStorage.db) {
        await this.ready
      }
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
      if (!TokenStorage.db) {
        await this.ready
      }
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
      if (!TokenStorage.db) {
        await this.ready
      }
      await TokenStorage.db!.batch([
        { type: 'del', key: this.accessTokenKey },
        { type: 'del', key: this.refreshTokenKey }
      ])
    } catch (error) {
      console.error('Failed to clear tokens:', error)
    }
  }

  private static async getDBPath(): Promise<string> {
    return typeof window === 'undefined'
      ? (async () => {
          const { join } = await import('path')
          const { homedir } = await import('os')
          return join(homedir(), AUTH_TOKEN_DB_PATH)
        })()
      : AUTH_TOKEN_DB_PATH
  }
}
