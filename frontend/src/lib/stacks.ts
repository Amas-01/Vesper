import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network'

export const NETWORKS = {
  mainnet: STACKS_MAINNET,
  testnet: STACKS_TESTNET,
}

// Default to mainnet — all production interactions use mainnet
export const getNetwork = () =>
  import.meta.env.VITE_NETWORK === 'testnet'
    ? NETWORKS.testnet
    : NETWORKS.mainnet

export const CONTRACT_CONFIG = {
  vesperCore: {
    address: import.meta.env.VITE_VESPER_CORE_ADDRESS ?? '',
    name: 'vesper-core',
  },
  vesperDao: {
    address: import.meta.env.VITE_VESPER_DAO_ADDRESS ?? '',
    name: 'vesper-dao',
  },
  vesperRegistry: {
    address: import.meta.env.VITE_VESPER_REGISTRY_ADDRESS ?? '',
    name: 'vesper-registry',
  },
}

export const EXPLORER_BASE = import.meta.env.VITE_NETWORK === 'testnet'
  ? 'https://explorer.hiro.so/?chain=testnet'
  : 'https://explorer.hiro.so'

export const STACKS_API_BASE = import.meta.env.VITE_NETWORK === 'testnet'
  ? 'https://api.testnet.hiro.so'
  : 'https://api.hiro.so'

