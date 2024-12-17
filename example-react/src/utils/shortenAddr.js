export function shortenAddress(address, range = 4) {
  if (address.length !== 43) return address
  return address.slice(0, range) + '...' + address.slice(-range)
}
