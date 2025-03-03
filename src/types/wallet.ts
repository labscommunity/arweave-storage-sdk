export type PrivateKey = string | 'use_web_wallet'

export enum Network {
  BASE_MAINNET = 'BASE_MAINNET',
  BASE_TESTNET = 'BASE_TESTNET'
}

export enum Token {
  USDC = 'USDC'
}

export enum ChainType {
  evm = 'evm',
  solana = 'solana'
}

export enum ChainNetwork {
  Mainnet = 'mainnet',
  Testnet = 'testnet'
}

export interface ConfigurationOptions {
  readonly appName: string
  readonly privateKey: PrivateKey
  readonly network: Network
  readonly token: Token
}
