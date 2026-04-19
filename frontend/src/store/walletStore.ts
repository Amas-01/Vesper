import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WalletState } from '../types/wallet'

interface WalletStoreState extends WalletState {
  connect: (address: string, network: 'mainnet' | 'testnet') => void
  disconnect: () => void
  setAddress: (address: string | null) => void
  setNetwork: (network: 'mainnet' | 'testnet') => void
}

export const useWalletStore = create<WalletStoreState>()(
  persist(
    (set) => ({
      address: null,
      isConnected: false,
      network: 'mainnet',
      connect: (address, network) => set({ address, isConnected: true, network }),
      disconnect: () => set({ address: null, isConnected: false }),
      setAddress: (address) => set({ address, isConnected: !!address }),
      setNetwork: (network) => set({ network }),
    }),
    {
      name: 'vesper-wallet-store',
      partialize: (state) => ({
        address: state.address,
        network: state.network,
      }),
    }
  )
)
