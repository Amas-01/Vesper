import { useState, useCallback } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { isValidPrincipal } from '../../lib/validation'

interface FormData {
  recipient: string
  totalDeposit: string
  durationDays: string
  memo: string
}

interface FormErrors {
  recipient?: string
  totalDeposit?: string
  durationDays?: string
}

interface CreateStreamFormProps {
  onSubmit?: (data: FormData) => Promise<void>
  isLoading?: boolean
}

export default function CreateStreamForm({ onSubmit, isLoading = false }: CreateStreamFormProps) {
  const [formData, setFormData] = useState<FormData>({
    recipient: '',
    totalDeposit: '',
    durationDays: '',
    memo: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({})

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }, [errors])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
  }, [])

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.recipient.trim()) {
      newErrors.recipient = 'Recipient address is required'
    } else if (!isValidPrincipal(formData.recipient)) {
      newErrors.recipient = 'Invalid recipient address'
    }

    if (!formData.totalDeposit.trim()) {
      newErrors.totalDeposit = 'Deposit amount is required'
    } else {
      const amount = parseFloat(formData.totalDeposit)
      if (isNaN(amount) || amount <= 0) {
        newErrors.totalDeposit = 'Amount must be greater than 0'
      }
    }

    if (!formData.durationDays.trim()) {
      newErrors.durationDays = 'Duration is required'
    } else {
      const days = parseFloat(formData.durationDays)
      if (isNaN(days) || days <= 0) {
        newErrors.durationDays = 'Duration must be greater than 0'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (onSubmit) {
      try {
        await onSubmit(formData)
      } catch (err) {
        console.error('Form submission error:', err)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="vesper-card p-6 space-y-6">
      <h2 className="text-xl font-bold text-dark-text mb-6">Create New Stream</h2>

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
          disabled={isLoading}
          className={touched.recipient && errors.recipient ? 'border-red-500' : ''}
        />
        {touched.recipient && errors.recipient && (
          <p className="text-red-500 text-sm mt-1">{errors.recipient}</p>
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
          disabled={isLoading}
          className={touched.totalDeposit && errors.totalDeposit ? 'border-red-500' : ''}
        />
        {touched.totalDeposit && errors.totalDeposit && (
          <p className="text-red-500 text-sm mt-1">{errors.totalDeposit}</p>
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
          disabled={isLoading}
          className={touched.durationDays && errors.durationDays ? 'border-red-500' : ''}
        />
        {touched.durationDays && errors.durationDays && (
          <p className="text-red-500 text-sm mt-1">{errors.durationDays}</p>
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
          disabled={isLoading}
          rows={3}
          className="w-full px-4 py-2 rounded-lg bg-dark-surface border border-dark-border text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-vesper-500 disabled:opacity-50"
        />
        <p className="text-dark-text-secondary text-xs mt-1">
          Optional description for this payment stream
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Creating Stream...' : 'Create Stream'}
      </Button>
    </form>
  )
}
