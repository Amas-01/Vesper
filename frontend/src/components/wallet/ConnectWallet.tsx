import { useWallet } from '../../hooks/useWallet'
import Spinner from '../ui/Spinner'

export default function ConnectWallet() {
  const { connect, disconnect, address, isConnected, isLoading, error } = useWallet()

  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : 'Connect Wallet'

  const handleConnect = async () => {
    console.log('Connect button clicked')
    try {
      await connect()
      console.log('Connect function completed')
    } catch (err) {
      console.error('Error in connect handler:', err)
    }
  }

  if (isLoading) {
    return (
      <button disabled className="vesper-btn-primary flex items-center gap-2 opacity-70">
        <Spinner size="sm" />
        <span>Connecting...</span>
      </button>
    )
  }

  if (isConnected) {
    return (
      <div className="relative group">
        <button className="vesper-btn-primary px-6 font-mono text-sm">
          {displayAddress}
        </button>
        <button
          onClick={disconnect}
          className="absolute top-full right-0 mt-2 vesper-btn-danger px-4 py-2 text-sm
                     opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap
                     shadow-lg z-50"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleConnect} className="vesper-btn-primary px-6">
        Connect Wallet
      </button>
      {error && <span className="text-red-400 text-sm">{error}</span>}
    </div>
  )
}
