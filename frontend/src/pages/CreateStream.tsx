import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateStreamForm from '../components/stream/CreateStreamForm'
import { useStreamForm } from '../hooks/useStreamForm'
import { useStream } from '../hooks/useStream'
import { useWallet } from '../hooks/useWallet'
import { stxToUstx } from '../lib/validation'
import Toast from '../components/ui/Toast'

// Blocks per day on Stacks (approximately 10 minute blocks)
const BLOCKS_PER_DAY = 144

export default function CreateStream() {
  const navigate = useNavigate()
  const { address } = useWallet()
  const { createStream, isLoading } = useStream()
  const { formData, calculations } = useStreamForm()
  const [toast, setToast] = useState<{ id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string } | null>(null)

  const handleSubmit = async (data: any) => {
    if (!address) {
      setToast({ id: 'error1', type: 'error', message: 'Please connect your wallet first' })
      return
    }

    try {
      // Calculate parameters for contract
      const deposit = stxToUstx(parseFloat(data.totalDeposit))
      const durationDays = parseFloat(data.durationDays)
      const stopBlock = BigInt(Math.floor(durationDays * BLOCKS_PER_DAY))
      
      // Calculate rate per block: netDeposit / durationBlocks
      const protocolFee = stxToUstx(parseFloat(data.totalDeposit) * 0.0025)
      const netDeposit = deposit - protocolFee
      const ratePerBlock = netDeposit / stopBlock

      console.log('Creating stream with:', {
        recipient: data.recipient,
        deposit,
        ratePerBlock,
        stopBlock,
        memo: data.memo,
      })

      // Execute stream creation
      await createStream({
        recipient: data.recipient,
        deposit,
        ratePerBlock,
        stopBlock,
        memo: data.memo,
        senderAddress: address,
      })

      setToast({ id: 'success1', type: 'success', message: 'Stream created successfully!' })
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      console.error('Error creating stream:', err)
      setToast({
        id: 'error2',
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to create stream',
      })
    }
  }

  return (
    <div className="min-h-screen bg-dark-background pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-12">
        <h1 className="text-4xl font-bold text-gradient mb-2">Create Payment Stream</h1>
        <p className="text-dark-text-secondary mb-8">
          Set up a new automated payment stream with customizable amount and duration
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <CreateStreamForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="vesper-card p-6 h-fit sticky top-32 space-y-6">
              <h3 className="text-lg font-bold text-dark-text">Stream Preview</h3>

              {calculations ? (
                <div className="space-y-4">
                  {/* Recipient */}
                  {formData.recipient && (
                    <div>
                      <p className="text-xs text-dark-text-secondary mb-1 uppercase tracking-wide">Recipient</p>
                      <p className="text-sm text-dark-text font-mono truncate">{formData.recipient}</p>
                    </div>
                  )}

                  {/* Amount Breakdown */}
                  <div>
                    <p className="text-xs text-dark-text-secondary mb-3 uppercase tracking-wide">Amount Breakdown</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-dark-text-secondary">Total Deposit:</span>
                        <span className="font-mono text-dark-text">{calculations.totalDepositStx.toFixed(2)} STX</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-text-secondary">Protocol Fee (0.25%):</span>
                        <span className="font-mono text-yellow-400">-{calculations.protocolFeeStx.toFixed(6)} STX</span>
                      </div>
                      <div className="vesper-divider"></div>
                      <div className="flex justify-between">
                        <span className="text-dark-text-secondary font-medium">Net Deposit:</span>
                        <span className="font-mono text-vesper-300 font-bold">{calculations.netDepositStx.toFixed(6)} STX</span>
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <p className="text-xs text-dark-text-secondary mb-1 uppercase tracking-wide">Duration</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-dark-text-secondary">Days:</span>
                        <span className="font-mono text-dark-text">{calculations.durationDays} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-text-secondary">Blocks:</span>
                        <span className="font-mono text-dark-text">{calculations.durationBlocks.toString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Streaming Rate */}
                  <div>
                    <p className="text-xs text-dark-text-secondary mb-3 uppercase tracking-wide">Streaming Rate</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-dark-text-secondary">Per Block:</span>
                        <span className="font-mono text-dark-text">
                          {(Number(calculations.ratePerBlockUstx) / 1_000_000).toFixed(8)} STX
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-text-secondary">Per Day:</span>
                        <span className="font-mono text-dark-text">{calculations.dailyStreamAmountStx.toFixed(6)} STX</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-text-secondary">Total Period:</span>
                        <span className="font-mono text-dark-text">{calculations.netDepositStx.toFixed(6)} STX</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-vesper-500/10 border border-vesper-500/30 rounded-lg p-3 mt-4">
                    <p className="text-xs text-dark-text-secondary mb-2">Summary</p>
                    <p className="text-sm text-dark-text">
                      Stream {calculations.netDepositStx.toFixed(2)} STX over {calculations.durationDays} days at {calculations.dailyStreamAmountStx.toFixed(6)} STX/day
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-dark-text-secondary text-sm">Fill in the form to see stream preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50">
          <Toast
            id={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  )
}
