import { useWallet } from '../../hooks/useWallet'
import Spinner from '../ui/Spinner'

export default function ConnectWallet() {
  const { connect, disconnect, address, isConnected, isLoading } = useWallet()

  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : 'Connect Wallet'

  if (isLoading) {
    return (
      <button disabled className="vesper-btn-primary px-6 flex items-center gap-2">
        <Spinner />
        <span>Connecting...</span>
      </button>
    )
  }

  if (isConnected) {
    return (
      <div className="relative group">
        <button className="vesper-btn-primary px-6">
          {displayAddress}
        </button>
        <button
          onClick={disconnect}
          className="absolute top-full right-0 mt-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hidden group-hover:block whitespace-nowrap hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button onClick={connect} className="vesper-btn-primary px-6">
      Connect Wallet
    </button>
  )
}
