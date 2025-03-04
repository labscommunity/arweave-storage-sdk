import { ArweaveSigner, DataItem,  } from "warp-arbundles"

export class ArweaveWallet {
  constructor(
    private readonly JWK: string,
    public readonly address: string,
    public readonly pubKey: string
  ) {}

  async signDataItem(dataItem: DataItem) {
    // const signature = await dataItem.sign(this.JWK)
    // return signature
  }
}
