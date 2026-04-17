// Zustand store for wallet state
// TODO: Implement wallet store with persistence

import { create } from 'zustand'

interface WalletStore {
  address: string | null
  isConnected: boolean
  network: string
  setAddress: (address: string | null) => void
  setConnected: (connected: boolean) => void
  setNetwork: (network: string) => void
  disconnect: () => void
}

export const useWalletStore = create<WalletStore>((set) => ({
  address: null,
  isConnected: false,
  network: 'testnet',
  setAddress: (address) => set({ address }),
  setConnected: (connected) => set({ isConnected: connected }),
  setNetwork: (network) => set({ network }),
  disconnect: () => set({ address: null, isConnected: false }),
}))
