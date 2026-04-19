export interface WalletState {
  address: string | null
  isConnected: boolean
  network: 'mainnet' | 'testnet'
}

export interface ConnectedWallet {
  address: string
  network: 'mainnet' | 'testnet'
  publicKey?: string
  isLoading: boolean
}
