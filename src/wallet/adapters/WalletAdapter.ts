export interface WalletAdapter {
  initialize(): Promise<void>
  signMessage(message: string): Promise<string>
  getPublicKey?(): Promise<string>
  readonly signer: any
  readonly address: string
}
