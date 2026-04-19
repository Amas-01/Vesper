import { useEffect, useState } from 'react'
import { showConnect } from '@stacks/connect'
import { AppConfig, UserSession } from '@stacks/auth'
import { useWalletStore } from '../store/walletStore'

const appConfig = new AppConfig(['store_write', 'publish_data'])
export const userSession = new UserSession({ appConfig })

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const store = useWalletStore()

  useEffect(() => {
    // Check if user is already logged in
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData()
      const userAddress = userData?.profile?.stxAddress?.mainnet || userData?.profile?.stxAddress?.testnet
      if (userAddress) {
        setAddress(userAddress)
        setIsConnected(true)
        store.connect(userAddress, 'mainnet')
      }
    }
  }, [])

  const connect = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await showConnect({
        appDetails: {
          name: 'Vesper',
          icon: 'https://vesper.express/logo.svg',
        },
        redirectTo: '/',
        userSession,
        onFinish: () => {
          const userData = userSession.loadUserData()
          const userAddress = userData?.profile?.stxAddress?.mainnet || userData?.profile?.stxAddress?.testnet
          if (userAddress) {
            setAddress(userAddress)
            setIsConnected(true)
            store.connect(userAddress, 'mainnet')
          }
          setIsLoading(false)
        },
        onCancel: () => {
          setIsLoading(false)
        },
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect wallet'
      setError(errorMsg)
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    userSession.signUserOut()
    setAddress(null)
    setIsConnected(false)
    store.disconnect()
  }

  return {
    connect,
    disconnect,
    address,
    isConnected,
    isLoading,
    error,
    network: store.network,
    setNetwork: store.setNetwork,
  }
}
