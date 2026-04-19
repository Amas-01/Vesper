/**
 * Validate Stacks principal (address)
 */
export function isValidPrincipal(principal: string): boolean {
  // Stacks addresses start with SP (mainnet) or SN (testnet) and are 34 characters
  const principalRegex = /^(SP|SN)[0-9A-Z]{32}[A-HJ-NP-Z0-9]$/
  return principalRegex.test(principal)
}

/**
 * Validate positive number
 */
export function isValidPositiveNumber(value: string | number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return !isNaN(num) && num > 0
}

/**
 * Validate integer
 */
export function isValidInteger(value: string | number): boolean {
  const num = typeof value === 'string' ? parseInt(value, 10) : value
  return !isNaN(num) && Number.isInteger(num) && num >= 0
}

/**
 * Convert STX to microSTX (1 STX = 1,000,000 uSTX)
 */
export function stxToUstx(stx: number): bigint {
  return BigInt(Math.floor(stx * 1_000_000))
}

/**
 * Convert microSTX to STX
 */
export function ustxToStx(ustx: bigint): number {
  return Number(ustx) / 1_000_000
}

/**
 * Calculate protocol fee (0.25%)
 */
export function calculateProtocolFee(amount: number): number {
  return amount * 0.0025
}

/**
 * Calculate net deposit after fee
 */
export function calculateNetDeposit(totalDeposit: number): number {
  return totalDeposit - calculateProtocolFee(totalDeposit)
}
