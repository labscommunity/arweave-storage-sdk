import Transaction from 'arweave/web/lib/transaction'
import { DataItem } from 'warp-arbundles'
// import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { APIOptions } from '../types/api'

import { apiConfig } from './config'
import { QueryBuilder } from './query/queryBuilder'

export class ArFSApi {
  public apiUrl: string
  public address: string | null = null
  public queryEngine: QueryBuilder | null = null
  public ready: Promise<boolean> = Promise.resolve(true)

  constructor({ gateway, address, appName }: APIOptions) {
    const apiUrl = gateway ? gateway : apiConfig['default'].url
    const queryInstance = new QueryBuilder({ apiUrl, address, appName })

    this.apiUrl = apiUrl
    this.queryEngine = queryInstance
    this.address = address

    // this.ready = this.#initialize(wallet, apiUrl, appName)
  }

  async getSigner() {
    // if (this.wallet === 'use_wallet') {
    //   const userSigner = new InjectedArweaveSigner(window.arweaveWallet)

    //   await userSigner.setPublicKey()

    //   return userSigner
    // }

    // return new ArweaveSigner(this.wallet)
  }

  async signAndSendAllTransactions(txList: (Transaction | DataItem)[]) {
    // const txIds: string[] = []
    const failedTxIndex: number[] = []

    // const signer = await this.getSigner()

    // for (let i = 0; i < txList.length; i++) {
    //   const tx = txList[i]

      // try {
      //   if (this.wallet === 'use_wallet') {
      //     await arweaveInstance.transactions.sign(tx as Transaction, this.wallet)

      //     const txId = await arweaveUpload(tx as Transaction)
      //     txIds.push(txId)

      //     continue
      //   }
      //   if (tx instanceof Transaction) {
      //     await arweaveInstance.transactions.sign(tx, this.wallet)

      //     const txId = await arweaveUpload(tx)
      //     txIds.push(txId)
      //   }
      //   if (tx instanceof DataItem) {
      //     await tx.sign(signer)

      //     const txId = await turboUpload(tx)
      //     txIds.push(txId)
      //   }
      // } catch (_) {
      //   failedTxIndex.push(i)
      // }
    // }

    return { successTxIds: txList as any, failedTxIndex }
  }

  // async #initialize(wallet: Wallet, apiUrl: string, appName?: string | null) {
  //   try {
  //     const address = await arweaveInstance.wallets.getAddress(wallet)
  //     const queryInstance = new QueryBuilder({ apiUrl, address, appName })

  //     this.address = address
  //     this.queryEngine = queryInstance

  //     return true
  //   } catch (error) {
  //     console.log({ error })
  //   }

  //   return false
  // }
}
