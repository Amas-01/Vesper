import { useState, useCallback, useMemo } from 'react'
import { calculateProtocolFee, calculateNetDeposit, stxToUstx } from '../lib/validation'

// Blocks per day on Stacks is approximately 144 (every 10 minutes)
const BLOCKS_PER_DAY = 144

export interface StreamFormState {
  recipient: string
  totalDeposit: string
  durationDays: string
  memo: string
}

export interface StreamFormCalculations {
  totalDepositStx: number
  totalDepositUstx: bigint
  protocolFeeStx: number
  protocolFeeUstx: bigint
  netDepositStx: number
  netDepositUstx: bigint
  durationDays: number
  durationBlocks: bigint
  ratePerBlockUstx: bigint
  dailyStreamAmountStx: number
}

interface UseStreamFormReturn {
  formData: StreamFormState
  calculations: StreamFormCalculations | null
  isValid: boolean
  errors: Partial<Record<keyof StreamFormState, string>>
  touched: Partial<Record<keyof StreamFormState, boolean>>
  setFormData: (data: Partial<StreamFormState>) => void
  setTouched: (field: keyof StreamFormState, value: boolean) => void
  resetForm: () => void
  getFieldError: (field: keyof StreamFormState) => string | undefined
}

export function useStreamForm(): UseStreamFormReturn {
  const [formData, setFormDataState] = useState<StreamFormState>({
    recipient: '',
    totalDeposit: '',
    durationDays: '',
    memo: '',
  })

  const [touched, setTouchedState] = useState<Partial<Record<keyof StreamFormState, boolean>>>({})
  const [errors, setErrors] = useState<Partial<Record<keyof StreamFormState, string>>>({})

  const setFormData = useCallback((data: Partial<StreamFormState>) => {
    setFormDataState(prev => ({ ...prev, ...data }))
  }, [])

  const setTouched = useCallback((field: keyof StreamFormState, value: boolean) => {
    setTouchedState(prev => ({ ...prev, [field]: value }))
  }, [])

  const resetForm = useCallback(() => {
    setFormDataState({
      recipient: '',
      totalDeposit: '',
      durationDays: '',
      memo: '',
    })
    setTouchedState({})
    setErrors({})
  }, [])

  // Validate form data
  const validateForm = useCallback((): Record<keyof StreamFormState, string | undefined> => {
    const newErrors: Partial<Record<keyof StreamFormState, string>> = {}

    if (!formData.recipient.trim()) {
      newErrors.recipient = 'Recipient address is required'
    } else if (!formData.recipient.match(/^(SP|SN)[0-9A-Z]{32}[A-HJ-NP-Z0-9]$/)) {
      newErrors.recipient = 'Invalid Stacks address format'
    }

    if (!formData.totalDeposit.trim()) {
      newErrors.totalDeposit = 'Deposit amount is required'
    } else {
      const amount = parseFloat(formData.totalDeposit)
      if (isNaN(amount) || amount <= 0) {
        newErrors.totalDeposit = 'Amount must be greater than 0'
      } else if (amount < 0.000001) {
        newErrors.totalDeposit = 'Minimum deposit is 0.000001 STX'
      }
    }

    if (!formData.durationDays.trim()) {
      newErrors.durationDays = 'Duration is required'
    } else {
      const days = parseFloat(formData.durationDays)
      if (isNaN(days) || days <= 0) {
        newErrors.durationDays = 'Duration must be greater than 0'
      } else if (days > 3650) {
        newErrors.durationDays = 'Duration cannot exceed 10 years'
      }
    }

    setErrors(newErrors as Partial<Record<keyof StreamFormState, string>>)
    return newErrors as Record<keyof StreamFormState, string | undefined>
  }, [formData])

  const isValid = useMemo(() => {
    const validationErrors = validateForm()
    return Object.values(validationErrors).every(error => !error)
  }, [validateForm])

  // Calculate stream parameters
  const calculations = useMemo<StreamFormCalculations | null>(() => {
    if (!formData.totalDeposit || !formData.durationDays) return null

    const totalDepositStx = parseFloat(formData.totalDeposit)
    if (isNaN(totalDepositStx) || totalDepositStx <= 0) return null

    const durationDays = parseFloat(formData.durationDays)
    if (isNaN(durationDays) || durationDays <= 0) return null

    try {
      const protocolFeeStx = calculateProtocolFee(totalDepositStx)
      const netDepositStx = calculateNetDeposit(totalDepositStx)

      const totalDepositUstx = stxToUstx(totalDepositStx)
      const protocolFeeUstx = stxToUstx(protocolFeeStx)
      const netDepositUstx = stxToUstx(netDepositStx)

      const durationBlocks = BigInt(Math.floor(durationDays * BLOCKS_PER_DAY))
      const ratePerBlockUstx = netDepositUstx / durationBlocks

      const dailyStreamAmountStx = (Number(ratePerBlockUstx) * BLOCKS_PER_DAY) / 1_000_000

      return {
        totalDepositStx,
        totalDepositUstx,
        protocolFeeStx,
        protocolFeeUstx,
        netDepositStx,
        netDepositUstx,
        durationDays,
        durationBlocks,
        ratePerBlockUstx,
        dailyStreamAmountStx,
      }
    } catch (err) {
      return null
    }
  }, [formData.totalDeposit, formData.durationDays])

  const getFieldError = useCallback((field: keyof StreamFormState): string | undefined => {
    return touched[field] ? errors[field] : undefined
  }, [errors, touched])

  return {
    formData,
    calculations,
    isValid,
    errors,
    touched,
    setFormData,
    setTouched,
    resetForm,
    getFieldError,
  }
}
