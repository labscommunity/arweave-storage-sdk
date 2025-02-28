declare module 'warp-contracts-plugin-signature' {
  const InjectedArweaveSigner: any
}

declare module 'isomorphic-textencoder' {
  const encode: any
  const decode: any
}

declare module globalThis {
  // eslint-disable-next-line no-var
  var arweaveWallet: any
  // eslint-disable-next-line no-var
  var ethereum: any
}
