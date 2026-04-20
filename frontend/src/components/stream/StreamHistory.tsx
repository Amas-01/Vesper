import { useState } from 'react'
import Button from '../ui/Button'

interface StreamHistoryProps {
  streamId: bigint
  isOwner: boolean
  isRecipient: boolean
  onWithdraw?: () => void
  onTopUp?: () => void
  onCancel?: () => void
}

export default function StreamHistory({
  isOwner,
  isRecipient,
  onWithdraw,
  onTopUp,
  onCancel,
}: StreamHistoryProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div className="vesper-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-dark-text">Stream History & Actions</h3>
        <button
          onClick={() => setShowActions(!showActions)}
          className="text-xs text-vesper-400 hover:text-vesper-300 transition-colors"
        >
          {showActions ? 'Hide' : 'Show'} Actions
        </button>
      </div>

      {showActions && (
        <div className="space-y-2 border-t border-dark-border pt-4">
          {isRecipient && onWithdraw && (
            <Button
              onClick={onWithdraw}
              variant="primary"
              className="w-full"
            >
              Withdraw Available Funds
            </Button>
          )}

          {isOwner && (
            <>
              {onTopUp && (
                <Button
                  onClick={onTopUp}
                  variant="secondary"
                  className="w-full"
                >
                  Top Up Stream
                </Button>
              )}
              {onCancel && (
                <Button
                  onClick={onCancel}
                  variant="danger"
                  className="w-full"
                >
                  Cancel Stream
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {/* Transaction History Placeholder */}
      <div className="space-y-2 text-sm">
        <p className="text-dark-text-secondary">Recent Activity</p>
        <div className="bg-dark-surface/50 rounded p-3 text-dark-text-secondary text-xs">
          No transactions yet
        </div>
      </div>
    </div>
  )
}
