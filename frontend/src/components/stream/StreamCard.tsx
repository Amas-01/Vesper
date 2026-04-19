import { Stream } from '../../types/stream'
import WithdrawButton from './WithdrawButton'
import CancelButton from './CancelButton'

interface StreamCardProps {
  stream: Stream
  onCancel?: (streamId: bigint) => void
}

export default function StreamCard({ stream, onCancel }: StreamCardProps) {
  const progressPercent = stream.deposit > 0n
    ? (Number(stream.totalWithdrawn) / Number(stream.deposit)) * 100
    : 0

  const statusColors = {
    active: 'vesper-badge-success',
    paused: 'vesper-badge-warning',
    cancelled: 'vesper-badge-danger',
    expired: 'vesper-badge-neutral',
  }

  // Determine status based on stream state
  const status = stream.paused ? 'paused' : 'active'

  return (
    <div className="vesper-card-hover p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs text-dark-text-secondary mb-1">Stream ID #{stream.id.toString()}</p>
          <p className="font-semibold text-dark-text text-lg">
            {stream.recipient.slice(0, 10)}...{stream.recipient.slice(-4)}
          </p>
          <p className="text-sm text-vesper-400 mt-1 font-mono">
            {(Number(stream.ratePerBlock) / 1_000_000).toFixed(6)} STX/block
          </p>
        </div>
        <span className={`vesper-badge ${statusColors[status as keyof typeof statusColors]}`}>
          {status}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-dark-text-secondary">Progress</span>
          <span className="font-medium text-vesper-300">{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="vesper-progress">
          <div
            className="vesper-progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
        <div>
          <p className="text-dark-text-secondary">Deposited</p>
          <p className="font-semibold text-dark-text">{(Number(stream.deposit) / 1_000_000).toFixed(2)} STX</p>
        </div>
        <div>
          <p className="text-dark-text-secondary">Streamed</p>
          <p className="font-semibold text-dark-text">{(Number(stream.totalWithdrawn) / 1_000_000).toFixed(2)} STX</p>
        </div>
        <div>
          <p className="text-dark-text-secondary">Remaining</p>
          <p className="font-semibold text-vesper-300">
            {(Number(stream.deposit - stream.totalWithdrawn) / 1_000_000).toFixed(2)} STX
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <WithdrawButton streamId={stream.id} claimableAmount={stream.deposit - stream.totalWithdrawn} />
        <CancelButton onCancel={() => onCancel?.(stream.id)} />
      </div>
    </div>
  )
}
