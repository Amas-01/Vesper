import { useWallet } from '../../hooks/useWallet'
import { getNetworkName } from '../../lib/stacks'

export default function WalletStatus() {
  const { address, isConnected, network } = useWallet()

  if (!isConnected) {
    return (
      <div className="vesper-card p-4">
        <p className="text-sm text-slate-600">Not connected to wallet</p>
      </div>
    )
  }

  return (
    <div className="vesper-card p-4 bg-green-50 border-green-200">
      <p className="text-sm text-green-700">
        ✅ Connected to {getNetworkName()}: {address?.slice(0, 10)}...{address?.slice(-4)}
      </p>
    </div>
  )
}
  )
}
