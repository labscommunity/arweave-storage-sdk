import { ArweaveSigner, DataItem, createData } from 'arbundles'
import { JWKInterface } from 'arweave/web/lib/wallet'
import { Tag } from 'arweave/web/lib/transaction'
import { QueryBuilder } from '../api/query/queryBuilder'

export class ArweaveWallet {
  public readonly signer: ArweaveSigner
  public readonly queryEngine: QueryBuilder
  constructor(
    private readonly JWK: JWKInterface,
    public readonly address: string,
    public readonly pubKey: string,
    public readonly appName: string
  ) {
    this.queryEngine = new QueryBuilder({
      apiUrl: 'https://arweave.net',
      address: this.address,
      appName: this.appName
    })
    this.signer = new ArweaveSigner(this.JWK)
  }

  async signDataItem(dataItem: DataItem) {
    await dataItem.sign(this.signer)

    return dataItem
  }

  async createAndSignDataItem(data: string | Uint8Array, tags: Tag[] = []) {
    const dataItem = createData(data, this.signer, { tags })

    return this.signDataItem(dataItem)
  }

  getPrivateKey() {
    return this.JWK
  }

  getPublicKey() {
    return this.pubKey
  }
}
