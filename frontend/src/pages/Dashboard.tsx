import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import StreamCard from '../components/stream/StreamCard'
import StreamList from '../components/stream/StreamList'
import Skeleton from '../components/ui/Skeleton'
import Button from '../components/ui/Button'
import type { StreamData } from '../types/stream'

export default function Dashboard() {
  const { address, isConnected } = useWallet()
  const [sentStreams, setSentStreams] = useState<StreamData[]>([])
  const [receivedStreams, setReceivedStreams] = useState<StreamData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const fetchStreams = async () => {
    if (!address || !isConnected) return

    setIsLoading(true)
    setError(null)

    try {
      // In a real implementation, these would call actual contract read functions
      // For now, we'll show the structure
      console.log('Fetching streams for:', address)
      
      // Simulated delay - replace with actual contract calls
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSentStreams([])
      setReceivedStreams([])
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch streams'
      setError(errorMsg)
      console.error('Error fetching streams:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStreams()
  }, [address, isConnected])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-gradient mb-4">Dashboard</h1>
          <p className="text-dark-text-secondary mb-6">
            Connect your wallet to view and manage your payment streams
          </p>
          <div className="p-8 bg-dark-surface border border-dark-border rounded-lg">
            <p className="text-dark-text-secondary mb-6">No wallet connected</p>
            <Link to="/" className="inline-block">
              <Button>Go Home & Connect</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-background pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-1">Dashboard</h1>
            <p className="text-dark-text-secondary">Manage your payment streams</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-vesper-500 text-white'
                  : 'bg-dark-surface text-dark-text-secondary hover:text-dark-text'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-vesper-500 text-white'
                  : 'bg-dark-surface text-dark-text-secondary hover:text-dark-text'
              }`}
            >
              List
            </button>
            <Link to="/create">
              <Button>Create Stream</Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={fetchStreams}
              className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton count={3} />
          </div>
        ) : (
          <div className="space-y-12">
            {/* Outgoing Streams */}
            <div>
              <h2 className="text-2xl font-bold text-dark-text mb-6">Payment Streams Sent</h2>
              {sentStreams.length === 0 ? (
                <div className="text-center py-12 bg-dark-surface rounded-lg border border-dark-border">
                  <p className="text-dark-text-secondary mb-4">No payment streams created yet</p>
                  <Link to="/create">
                    <Button>Create Your First Stream</Button>
                  </Link>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sentStreams.map(stream => (
                    <StreamCard key={stream.id.toString()} stream={stream} />
                  ))}
                </div>
              ) : (
                <StreamList streams={sentStreams} />
              )}
            </div>

            {/* Incoming Streams */}
            <div>
              <h2 className="text-2xl font-bold text-dark-text mb-6">Payment Streams Received</h2>
              {receivedStreams.length === 0 ? (
                <div className="text-center py-12 bg-dark-surface rounded-lg border border-dark-border">
                  <p className="text-dark-text-secondary">No incoming payment streams</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {receivedStreams.map(stream => (
                    <StreamCard key={stream.id.toString()} stream={stream} />
                  ))}
                </div>
              ) : (
                <StreamList streams={receivedStreams} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
