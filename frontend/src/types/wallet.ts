// Placeholder wallet types

export interface WalletState {
  address: string | null
  isConnected: boolean
  network: string
  isLoading: boolean
  error: string | null
}

export interface WalletActions {
  connect: () => Promise<void>
  disconnect: () => void
  setAddress: (address: string) => void
  setNetwork: (network: string) => void
}
