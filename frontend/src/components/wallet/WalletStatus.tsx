import { useWallet } from '../../hooks/useWallet'
import { useState, useEffect } from 'react'
import Badge from '../ui/Badge'
import Spinner from '../ui/Spinner'

export default function WalletStatus() {
  const { address, isConnected } = useWallet()
  const [balance, setBalance] = useState<number | null>(null)
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('testnet')
  const [loadingBalance, setLoadingBalance] = useState(false)

  useEffect(() => {
    if (!isConnected || !address) return

    // Determine network from address prefix
    const isMainnet = address.startsWith('SP')
    setNetwork(isMainnet ? 'mainnet' : 'testnet')

    // Fetch STX balance from Hiro API
    const fetchBalance = async () => {
      setLoadingBalance(true)
      try {
        const apiUrl = isMainnet
          ? `https://api.hiro.so/v1/address/${address}/balances`
          : `https://api.testnet.hiro.so/v1/address/${address}/balances`

        const response = await fetch(apiUrl)
        const data = await response.json()

        if (data.stx) {
          const balanceStx = Number(data.stx.balance) / 1_000_000
          setBalance(balanceStx)
        }
      } catch (err) {
        console.error('Error fetching balance:', err)
      } finally {
        setLoadingBalance(false)
      }
    }

    fetchBalance()

    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [isConnected, address])

  if (!isConnected) {
    return (
      <div className="vesper-card p-4">
        <p className="text-sm text-dark-text-secondary">Wallet not connected</p>
      </div>
    )
  }

  const networkBadgeVariant = network === 'mainnet' ? 'success' : 'warning'
  const networkLabel = network === 'mainnet' ? 'Mainnet' : 'Testnet'

  return (
    <div className="vesper-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Badge variant={networkBadgeVariant}>
          {networkLabel}
        </Badge>
        <button
          onClick={() => navigator.clipboard.writeText(address || '')}
          className="text-xs text-vesper-400 hover:text-vesper-300 transition-colors"
          title="Copy address"
        >
          📋 Copy
        </button>
      </div>
      <div className="font-mono text-xs text-dark-text break-all">
        {address}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-dark-border">
        <span className="text-xs text-dark-text-secondary">Balance</span>
        {loadingBalance ? (
          <Spinner size="sm" />
        ) : balance !== null ? (
          <span className="text-sm font-bold text-vesper-300">{balance.toFixed(2)} STX</span>
        ) : (
          <span className="text-xs text-dark-text-secondary">—</span>
        )}
      </div>
    </div>
  )
}
