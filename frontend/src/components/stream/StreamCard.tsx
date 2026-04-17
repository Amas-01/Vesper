import { Stream } from '../../types/stream'
import WithdrawButton from './WithdrawButton'
import CancelButton from './CancelButton'

interface StreamCardProps {
  stream: Stream
  onCancel?: (streamId: bigint) => void
}

export default function StreamCard({ stream, onCancel }: StreamCardProps) {
  const progressPercent = stream.totalAmount > 0n
    ? (Number(stream.withdrawn) / Number(stream.totalAmount)) * 100
    : 0

  return (
    <div className="vesper-card p-6 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Stream ID #{stream.id.toString()}</p>
          <p className="font-semibold text-slate-900">{stream.recipient.slice(0, 10)}...{stream.recipient.slice(-4)}</p>
          <p className="text-sm text-slate-600 mt-1">{(Number(stream.ratePerBlock) / 1_000_000).toFixed(6)} STX/block</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          stream.status === 'active' ? 'bg-green-100 text-green-700' :
          stream.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {stream.status}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">Progress</span>
          <span className="font-medium text-slate-900">{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-vesper-500 to-vesper-600 h-2 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
        <div>
          <p className="text-slate-500">Deposited</p>
          <p className="font-semibold">{(Number(stream.totalAmount) / 1_000_000).toFixed(2)} STX</p>
        </div>
        <div>
          <p className="text-slate-500">Streamed</p>
          <p className="font-semibold">{(Number(stream.withdrawn) / 1_000_000).toFixed(2)} STX</p>
        </div>
        <div>
          <p className="text-slate-500">Remaining</p>
          <p className="font-semibold">
            {(Number(stream.totalAmount - stream.withdrawn) / 1_000_000).toFixed(2)} STX
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <WithdrawButton streamId={stream.id} claimableAmount={stream.totalAmount - stream.withdrawn} />
        <CancelButton streamId={stream.id} onCancel={() => onCancel?.(stream.id)} />
      </div>
    </div>
  )
}
