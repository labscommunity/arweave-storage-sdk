import Arweave from 'arweave'

const ArweaveClass: typeof Arweave = (Arweave as any)?.default ?? Arweave

export const arweaveInstance = ArweaveClass.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})
