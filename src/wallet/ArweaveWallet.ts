import { ArweaveSigner, DataItem, createData } from 'arbundles'
import { JWKInterface } from 'arweave/web/lib/wallet'
import { Tag } from 'arweave/web/lib/transaction'

export class ArweaveWallet {
  public readonly signer: ArweaveSigner
  constructor(
    private readonly JWK: JWKInterface,
    public readonly address: string,
    public readonly pubKey: string
  ) {
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
}
