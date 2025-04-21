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
  private readonly ready: Promise<void>
  private db: Level | null = null

  private static instance: TokenStorage | null = null

  private constructor() {
    this.ready = this.initialize()
  }

  public static getInstance(): TokenStorage {
    if (!TokenStorage.instance) {
      TokenStorage.instance = new TokenStorage()
    }
    return TokenStorage.instance
  }

  private async initialize() {
    if (this.db) return

    const dbPath = await TokenStorage.getDBPath()
    if (isServer()) {
      const { mkdirSync } = await importDynamic('fs')
      const { homedir } = await importDynamic('os')
      const { join } = await importDynamic('path')
      mkdirSync(join(homedir(), AUTH_TOKEN_DB_PATH), { recursive: true })

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const db = new Level(dbPath)
          await db.open()
          this.db = db
          return
        } catch (err: any) {
          // if it's the LOCK error, delete and retry once
          if (err.message.includes('IO error') && err.message.includes('LOCK') && attempt === 0) {
            const { unlinkSync } = await importDynamic('fs')
            const { join } = await importDynamic('path')
            const lockFile = join(dbPath, 'LOCK')
            unlinkSync(lockFile)
            continue
          }
          throw err
        }
      }
    }

    const db = new Level(dbPath)
    await db.open()
    this.db = db
  }

  /**
   * Stores the access token
   */
  async setAccessToken(token: string): Promise<void> {
    try {
      await this.ready

      await this.db!.put(this.accessTokenKey, token)
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
      await this.ready

      await this.db!.put(this.refreshTokenKey, token)
    } catch (error) {
      console.error('Failed to store refresh token:', error)
      throw new Error('Failed to store refresh token')
    }
  }

  async setAddress(address: string): Promise<void> {
    try {
      await this.ready

      await this.db!.put(this.addressKey, address)
    } catch (error) {
      console.error('Failed to store address:', error)
      throw new Error('Failed to store address')
    }
  }

  async getAddress(): Promise<string | null> {
    try {
      await this.ready

      const address = await this.db!.get(this.addressKey)
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
      await this.ready

      const token = await this.db!.get(this.accessTokenKey)
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
      await this.ready

      const token = await this.db!.get(this.refreshTokenKey)
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
      await this.ready

      await this.db!.batch([
        { type: 'del', key: this.accessTokenKey },
        { type: 'del', key: this.refreshTokenKey }
      ])
    } catch (error) {
      console.error('Failed to clear tokens:', error)
    }
  }

  private static async getDBPath(): Promise<string> {
    return isServer()
      ? (async () => {
          const { join } = await importDynamic('path')
          const { homedir } = await importDynamic('os')
          return join(homedir(), AUTH_TOKEN_DB_PATH)
        })()
      : AUTH_TOKEN_DB_PATH
  }
}

export const tokenStorage = TokenStorage.getInstance()
