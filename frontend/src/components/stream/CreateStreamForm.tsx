import { useState } from 'react'
import { useStreamForm } from '../../hooks/useStreamForm'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface CreateStreamFormProps {
  onSubmit?: (data: any) => Promise<void>
  isLoading?: boolean
}

export default function CreateStreamForm({ onSubmit, isLoading = false }: CreateStreamFormProps) {
  const { formData, setFormData, setTouched, getFieldError, isValid, calculations, resetForm } = useStreamForm()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ [name]: value })
    setError(null)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target
    setTouched(name as any, true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValid) {
      setError('Please fix validation errors before submitting')
      return
    }

    if (onSubmit) {
      setSubmitting(true)
      try {
        await onSubmit(formData)
        resetForm()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create stream')
      } finally {
        setSubmitting(false)
      }
    }
  }

  const isLoadingAnSubmitting = isLoading || submitting

  return (
    <form onSubmit={handleSubmit} className="vesper-card p-6 space-y-6">
      <h2 className="text-xl font-bold text-dark-text mb-6">Create New Stream</h2>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Recipient Address */}
      <div>
        <label className="block text-sm font-medium text-dark-text mb-2">
          Recipient Address
        </label>
        <Input
          type="text"
          name="recipient"
          value={formData.recipient}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="SP... or SN..."
          disabled={isLoadingAnSubmitting}
          className={getFieldError('recipient') ? 'border-red-500' : ''}
        />
        {getFieldError('recipient') && (
          <p className="text-red-500 text-sm mt-1">{getFieldError('recipient')}</p>
        )}
        <p className="text-dark-text-secondary text-xs mt-1">
          The Stacks address that will receive the stream
        </p>
      </div>

      {/* Total Deposit Amount */}
      <div>
        <label className="block text-sm font-medium text-dark-text mb-2">
          Total Deposit (STX)
        </label>
        <Input
          type="number"
          name="totalDeposit"
          value={formData.totalDeposit}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="10"
          step="0.1"
          min="0"
          disabled={isLoadingAnSubmitting}
          className={getFieldError('totalDeposit') ? 'border-red-500' : ''}
        />
        {getFieldError('totalDeposit') && (
          <p className="text-red-500 text-sm mt-1">{getFieldError('totalDeposit')}</p>
        )}
        <p className="text-dark-text-secondary text-xs mt-1">
          Total amount to be streamed (minus 0.25% protocol fee)
        </p>
      </div>

      {/* Stream Duration */}
      <div>
        <label className="block text-sm font-medium text-dark-text mb-2">
          Duration (Days)
        </label>
        <Input
          type="number"
          name="durationDays"
          value={formData.durationDays}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="30"
          step="1"
          min="1"
          disabled={isLoadingAnSubmitting}
          className={getFieldError('durationDays') ? 'border-red-500' : ''}
        />
        {getFieldError('durationDays') && (
          <p className="text-red-500 text-sm mt-1">{getFieldError('durationDays')}</p>
        )}
        <p className="text-dark-text-secondary text-xs mt-1">
          How many days the stream should run
        </p>
      </div>

      {/* Optional Memo */}
      <div>
        <label className="block text-sm font-medium text-dark-text mb-2">
          Memo (Optional)
        </label>
        <textarea
          name="memo"
          value={formData.memo}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Add a note about this stream..."
          disabled={isLoadingAnSubmitting}
          rows={3}
          className="w-full px-4 py-2 rounded-lg bg-dark-surface border border-dark-border text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-vesper-500 disabled:opacity-50"
        />
        <p className="text-dark-text-secondary text-xs mt-1">
          Optional description for this payment stream
        </p>
      </div>

      {/* Summary Info */}
      {calculations && (
        <div className="p-4 bg-vesper-500/5 border border-vesper-500/30 rounded-lg space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-dark-text-secondary">Protocol Fee (0.25%):</span>
            <span className="text-dark-text font-mono">{calculations.protocolFeeStx.toFixed(6)} STX</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-text-secondary">Net Deposit:</span>
            <span className="text-vesper-300 font-mono font-bold">{calculations.netDepositStx.toFixed(6)} STX</span>
          </div>
          <div className="vesper-divider"></div>
          <div className="flex justify-between">
            <span className="text-dark-text-secondary">Daily Stream Rate:</span>
            <span className="text-dark-text font-mono">{calculations.dailyStreamAmountStx.toFixed(6)} STX/day</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-text-secondary">Per Block Rate:</span>
            <span className="text-dark-text font-mono">{(Number(calculations.ratePerBlockUstx) / 1_000_000).toFixed(8)} STX/block</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoadingAnSubmitting || !isValid}
        className="w-full"
      >
        {isLoadingAnSubmitting ? 'Creating Stream...' : 'Create Stream'}
      </Button>
    </form>
  )
}
