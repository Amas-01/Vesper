import { STACKS_MAINNET, STACKS_TESTNET, StacksNetwork } from '@stacks/network'

// Export network configurations
export { STACKS_TESTNET, STACKS_MAINNET }
export type { StacksNetwork }

// Contract configuration
export const VESPER_CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS as string) || 'SP2C2YFP12AJZB4CJXEMUC4PSE2M7EJ4FSJ58D1A6'
export const VESPER_CONTRACT_NAME = 'vesper-core'

// Get current network based on environment
export function getCurrentNetwork(): StacksNetwork {
  const network = (import.meta.env.VITE_NETWORK as string) || 'testnet'
  return network === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET
}

// Helper functions for network operations
export function getNetworkName(): string {
  return (import.meta.env.VITE_NETWORK as string) === 'mainnet' ? 'Mainnet' : 'Testnet'
}

export function isMainnet(): boolean {
  return (import.meta.env.VITE_NETWORK as string) === 'mainnet'
}

