import { JWKInterface } from 'arweave/node/lib/wallet'
import Transaction from 'arweave/web/lib/transaction'
import { ArweaveSigner } from 'warp-arbundles'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { _Window, arweaveWallet } from '../../mocks/windowArWallet'
import { arweaveInstance } from '../../utils/arweaveInstance'
import { ArFSApi } from '../api'
import { apiConfig } from '../config'

globalThis.window = _Window as Window & typeof globalThis
globalThis.arweaveWallet = arweaveWallet

jest.mock('../../utils/arweaveInstance', () => {
  const originalModule = jest.requireActual('../../utils/arweaveInstance')

  originalModule.arweaveInstance.transactions.sign = jest.fn((tx, _) => tx)
  originalModule.arweaveInstance.transactions.post = jest.fn((_) => ({ status: 200, statusText: 'mocked ar tx post' }))

  return originalModule
})

describe('ArFSApi with ArConnect', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset to original implementation before each test
  })

  const arfsApi = new ArFSApi({ wallet: 'use_wallet' })

  test('should have default apiUrl', () => {
    expect(arfsApi.apiUrl).toBe(apiConfig['default'].url)
  })

  test('should have use_wallet for wallet', () => {
    expect(arfsApi.wallet).toBe('use_wallet')
  })

  test('should have user address set', async () => {
    expect(arfsApi.address).toBe('owtC4zvNF_S2C42-Rb-PC1vuuF6bzcqIUlmQvd-Bo50')
  })

  test('should return injected arwewave signer', async () => {
    const signer = await arfsApi.getSigner()

    expect(signer instanceof InjectedArweaveSigner).toBe(true)
    expect(window.arweaveWallet.getActivePublicKey).toHaveBeenCalledTimes(1)
  })

  test('should signAndSendAllTransactions', async () => {
    const arTx = await arweaveInstance.createTransaction({ data: 'test' })

    const response = await arfsApi.signAndSendAllTransactions([arTx])

    expect(response.successTxIds.length).toBe(1)
    expect(response.failedTxIndex.length).toBe(0)

    expect(arweaveInstance.transactions.sign).toHaveBeenCalledTimes(1)
    expect(arweaveInstance.transactions.sign).toHaveBeenLastCalledWith(arTx, 'use_wallet')

    expect(arweaveInstance.transactions.post).toHaveBeenCalledTimes(1)
    expect(arweaveInstance.transactions.post).toHaveBeenCalledWith(arTx)
  })
})

describe('ArFSApi with JWK', () => {
  let arWallet: JWKInterface
  let arfsApi: ArFSApi

  beforeEach(async () => {
    jest.clearAllMocks()

    arWallet = await arweaveInstance.wallets.generate()

    arfsApi = new ArFSApi({ wallet: arWallet })
  })

  test('should have JWK for wallet', () => {
    expect(typeof arfsApi.wallet).toBe('object')
  })

  test('should have user address set', async () => {
    const address = await arweaveInstance.wallets.getAddress(arWallet)

    expect(arfsApi.address).toBe(address)
  })

  test('should return arwewave signer', async () => {
    const signer = await arfsApi.getSigner()

    expect(signer instanceof ArweaveSigner).toBe(true)
  })

  test('should signAndSendAllTransactions', async () => {
    const arTx = await arweaveInstance.createTransaction({ data: 'test' })

    const response = await arfsApi.signAndSendAllTransactions([arTx])

    expect(response.successTxIds.length).toBe(1)
    expect(response.failedTxIndex.length).toBe(0)

    expect(arweaveInstance.transactions.post).toHaveBeenCalledTimes(1)
    expect(arweaveInstance.transactions.post).toHaveBeenCalledWith(arTx)
  })

  test('should fail signAndSendAllTransactions', async () => {
    arweaveInstance.transactions.post = jest.fn(
      (tx: Transaction) => Promise.resolve({ id: tx.id, status: 400, statusText: 'failed mock' }) as any
    )
    const arTx = await arweaveInstance.createTransaction({ data: 'test' })

    const response = await arfsApi.signAndSendAllTransactions([arTx])

    expect(response.successTxIds.length).toBe(0)
    expect(response.failedTxIndex.length).toBe(1)

    expect(arweaveInstance.transactions.post).toHaveBeenCalledTimes(1)
    expect(arweaveInstance.transactions.post).toHaveBeenCalledWith(arTx)
  })
})
