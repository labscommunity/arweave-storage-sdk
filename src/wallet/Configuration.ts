import { ConfigurationOptions, PrivateKey, Token, Network } from '../types/wallet'

export class Configuration {
  public appName: string
  public privateKey: PrivateKey
  public network: Network
  public token: Token

  constructor(config: ConfigurationOptions) {
    this.appName = config.appName
    this.privateKey = config.privateKey
    this.network = config.network
    this.token = config.token
  }

  get wallet(): PrivateKey {
    return this.privateKey
  }
}
