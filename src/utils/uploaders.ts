import Transaction from 'arweave/web/lib/transaction'
import { DataItem } from 'warp-arbundles'

import { arweaveInstance } from './arweaveInstance'

export async function arweaveUpload(transaction: Transaction) {
  const dataSize = transaction.data.length

  const response = await arweaveInstance.transactions.post(transaction)

  console.log(`${response.status} - ${response.statusText}`)

  if (response.status !== 200) {
    // throw error if arweave tx wasn't posted
    throw `[ arweave ] Posting repo to arweave failed.\n\tError: '${response.status}' - '${
      response.statusText
    }'\n\tCheck if you have plenty $AR to upload ~${Math.ceil(dataSize / 1024)} KB of data.`
  }

  return transaction.id
}

export async function turboUpload(dataItem: DataItem) {
  const node = 'https://turbo.ardrive.io'

  const res = await fetch(`${node}/tx`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    body: dataItem.getRaw()
  })

  if (res.status >= 400)
    throw new Error(`[ turbo ] Posting repo with turbo failed. Error: ${res.status} - ${res.statusText}`)

  return dataItem.id
}

export async function arConnectUpload(transaction: DataItem | Transaction) {
  let tx = transaction

  if (tx instanceof DataItem) {
    const data = tx.rawData.toString()

    tx = await arweaveInstance.createTransaction({ data })

    for (const tag of tx.tags) tx.addTag(tag.name, tag.value)
  }

  const dataTxResponse = await window.arweaveWallet.dispatch(tx)

  return dataTxResponse.id
}
