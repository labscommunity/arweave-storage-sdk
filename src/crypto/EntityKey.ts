export class EntityKey {
  constructor(
    readonly cryptoKey: CryptoKey,
    readonly keyData: Buffer
  ) {
    if (!Buffer.isBuffer(keyData)) {
      throw new Error(`The keyData argument must be of type Buffer, got ${typeof keyData}`)
    }
    if (!(cryptoKey instanceof CryptoKey)) {
      throw new Error(`The cryptoKey argument must be of type CryptoKey, got ${typeof cryptoKey}`)
    }
  }

  toString(): string {
    return this.keyData.toString('base64').replace('=', '')
  }

  toJSON(): string {
    return this.toString()
  }
}
