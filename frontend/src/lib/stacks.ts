import { StacksMainnet, StacksTestnet } from '@stacks/network'

// Export network configurations
export const STACKS_TESTNET = new StacksTestnet()
export const STACKS_MAINNET = new StacksMainnet()

// Contract configuration
export const VESPER_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || 'SP2C2YFP12AJZB4CJXEMUC4PSE2M7EJ4FSJ58D1A6'
export const VESPER_CONTRACT_NAME = 'vesper-core'

// Get current network based on environment
export function getCurrentNetwork() {
  const network = import.meta.env.VITE_NETWORK || 'testnet'
  return network === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET
}

// Helper functions for network operations
export function getNetworkName(): string {
  return import.meta.env.VITE_NETWORK === 'mainnet' ? 'Mainnet' : 'Testnet'
}

export function isMainnet(): boolean {
  return import.meta.env.VITE_NETWORK === 'mainnet'
}

