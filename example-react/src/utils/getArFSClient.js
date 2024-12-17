import { Capsule } from 'capsule-js'

export function getArFSClient() {
  const arfsClient = new Capsule({ wallet: 'use_wallet', appName: 'arfs-js-drive' })

  return arfsClient
}
