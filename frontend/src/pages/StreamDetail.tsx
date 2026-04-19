import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useContract } from '../hooks/useContract'
import { useWallet } from '../hooks/useWallet'
import type { StreamData } from '../types/stream'
import AddressDisplay from '../components/ui/AddressDisplay'
import Skeleton from '../components/ui/Skeleton'
import Button from '../components/ui/Button'

export default function StreamDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { address } = useWallet()
  const { getStream } = useContract()
  
  const [stream, setStream] = useState<StreamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStream = async () => {
      if (!id) {
        setError('Invalid stream ID')
        setLoading(false)
        return
      }

      try {
        const streamId = BigInt(id)
        const streamData = await getStream(streamId)
        
        if (!streamData) {
          setError('Stream not found')
        } else {
          setStream(streamData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stream')
      } finally {
        setLoading(false)
      }
    }

    loadStream()
  }, [id, getStream])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-background pb-20">
        <div className="max-w-4xl mx-auto px-4 pt-12">
          <Skeleton count={5} />
        </div>
      </div>
    )
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen bg-dark-background pb-20">
        <div className="max-w-4xl mx-auto px-4 pt-12">
          <div className="vesper-card p-6 text-center">
            <p className="text-red-400 mb-4">{error || 'Stream not found'}</p>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </div>
      </div>
    )
  }

  const isOwner = address === stream.sender
  const isRecipient = address === stream.recipient

  return (
    <div className="min-h-screen bg-dark-background pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-12">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-vesper-400 hover:text-vesper-300 text-sm mb-6 transition-colors"
        >
          ← Back to Dashboard
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Detail */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="vesper-card p-6">
              <h1 className="text-3xl font-bold text-gradient mb-4">Stream #{stream.id.toString()}</h1>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-dark-text-secondary uppercase tracking-wide mb-1">From</p>
                  <AddressDisplay address={stream.sender} truncate={false} />
                </div>
                <div>
                  <p className="text-xs text-dark-text-secondary uppercase tracking-wide mb-1">To</p>
                  <AddressDisplay address={stream.recipient} truncate={false} />
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="vesper-card p-6">
              <h2 className="text-lg font-bold text-dark-text mb-4">Stream Progress</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-dark-text-secondary">Streamed</span>
                    <span className="text-sm font-mono text-vesper-300">50%</span>
                  </div>
                  <div className="vesper-progress">
                    <div className="vesper-progress-bar" style={{ width: '50%' }} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-dark-text-secondary mb-1">Deposited</p>
                    <p className="font-mono text-dark-text">{(Number(stream.deposit) / 1_000_000).toFixed(2)} STX</p>
                  </div>
                  <div>
                    <p className="text-dark-text-secondary mb-1">Withdrawn</p>
                    <p className="font-mono text-dark-text">{(Number(stream.totalWithdrawn) / 1_000_000).toFixed(2)} STX</p>
                  </div>
                  <div>
                    <p className="text-dark-text-secondary mb-1">Remaining</p>
                    <p className="font-mono text-vesper-300">{(Number(stream.deposit - stream.totalWithdrawn) / 1_000_000).toFixed(2)} STX</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="vesper-card p-6">
              <h2 className="text-lg font-bold text-dark-text mb-4">Stream Details</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-text-secondary">Rate per Block:</span>
                  <span className="font-mono text-dark-text">{(Number(stream.ratePerBlock) / 1_000_000).toFixed(8)} STX</span>
                </div>
                <div className="vesper-divider"></div>
                <div className="flex justify-between">
                  <span className="text-dark-text-secondary">Started at Block:</span>
                  <span className="font-mono text-dark-text">{stream.startBlock.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-text-secondary">Ends at Block:</span>
                  <span className="font-mono text-dark-text">{stream.stopBlock.toString()}</span>
                </div>
                <div className="vesper-divider"></div>
                <div className="flex justify-between">
                  <span className="text-dark-text-secondary">Status:</span>
                  <span className="text-dark-text">
                    {stream.paused ? '⏸ Paused' : '▶ Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="lg:col-span-1">
            <div className="vesper-card p-6 h-fit space-y-4 sticky top-32">
              <h3 className="font-bold text-dark-text">Actions</h3>
              
              {isRecipient && (
                <Button className="w-full" variant="primary">
                  Withdraw Funds
                </Button>
              )}
              
              {isOwner && (
                <>
                  <Button className="w-full" variant="secondary">
                    Top Up Stream
                  </Button>
                  <Button className="w-full" variant="danger">
                    Cancel Stream
                  </Button>
                </>
              )}

              {!isOwner && !isRecipient && (
                <p className="text-xs text-dark-text-secondary text-center">
                  You are not involved in this stream
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
