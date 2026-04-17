// Utility functions for Stacks operations

export function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatSTX(amount: bigint) {
  return (Number(amount) / 1_000_000).toFixed(2)
}

export function estimateDays(blocks: bigint) {
  // Assuming ~10 minute block times
  const minutes = Number(blocks) * 10
  return minutes / (60 * 24)
}

export function calculateFee(amount: bigint, feePercentage = 25) {
  // feePercentage in basis points
  return (amount * BigInt(feePercentage)) / BigInt(10000)
}
