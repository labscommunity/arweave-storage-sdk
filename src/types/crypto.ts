export declare function createHash(algorithm?: string): CH.AsyncHash

export declare function createHashJS(algorithm: string): CH.AsyncHash

export declare namespace CH {
  interface AsyncHash {
    update(data: string, encoding?: string): this

    update(data: Uint8Array): this

    digest(): Promise<Uint8Array>

    digest(encoding: string): Promise<string>
  }
  interface SyncHash {
    update(data: string, encoding?: string): this

    update(data: Uint8Array): this

    digest(encoding: string): string

    digest(): Uint8Array
  }
}
