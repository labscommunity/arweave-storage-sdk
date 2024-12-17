import { ArFSApi } from '../../api'
import { arweaveWallet } from '../../mocks/windowArWallet'
import { Drive } from '../../models'
import { DriveService } from '../drive.service'

globalThis.arweaveWallet = arweaveWallet

describe('Drive Service', () => {
  const api = new ArFSApi({ wallet: 'use_wallet' })
  const driveService = new DriveService(api)

  it('should list all the drives of a user', async () => {
    const drives = await driveService.listAll()

    expect(drives).not.toBeUndefined()
    expect(drives?.length).toBeGreaterThan(0)
    expect(drives![0]).toBeInstanceOf(Drive)
  }, 30000)
})
