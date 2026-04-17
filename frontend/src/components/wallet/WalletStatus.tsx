import { useWallet } from '../../hooks/useWallet'
import { getNetworkName } from '../../lib/stacks'

export default function WalletStatus() {
  const { address, isConnected } = useWallet()

  if (!isConnected) {
    return (
      <div className="vesper-card p-4">
        <p className="text-sm text-dark-text-secondary">Wallet not connected</p>
      </div>
    )
  }

  return (
    <div className="vesper-card p-4 bg-green-500/10 border-green-500/30">
      <p className="text-sm text-green-300">
        ✅ Connected to {getNetworkName()}: {address?.slice(0, 10)}...{address?.slice(-4)}
      </p>
    </div>
  )
}
