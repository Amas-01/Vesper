import { useCallback, useState } from 'react'
import { openContractCall } from '@stacks/connect'
import type { ContractCallOptions } from '@stacks/transactions'
import { getNetwork, STACKS_API_BASE } from '../lib/stacks'
import {
  fetchStream,
  fetchStreamBalance,
  fetchSenderStreams,
  fetchRecipientStreams,
  fetchTotalStreams,
  fetchStreamProgress,
  fetchContractBalance,
} from '../lib/contracts'
import type { StreamData, StreamProgress } from '../types/stream'

export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'idle'

export function useContract() {
  const [isLoading, setIsLoading] = useState(false)
  const [txId, setTxId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<TransactionStatus>('idle')

  const reset = useCallback(() => {
    setIsLoading(false)
    setTxId(null)
    setError(null)
    setStatus('idle')
  }, [])

  const call = useCallback(async (options: ContractCallOptions) => {
    setIsLoading(true)
    setError(null)
    setStatus('pending')

    try {
      const result = await openContractCall(options)
      if (result) {
        setTxId(result)
        
        // Poll for transaction confirmation
        let confirmed = false
        let attempts = 0
        const maxAttempts = 120 // 10 minutes with 5 second intervals

        while (!confirmed && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000))
          attempts++

          try {
            const response = await fetch(
              `${STACKS_API_BASE}/extended/v1/tx/${result}`
            )
            const txData = await response.json()

            if (txData.tx_status === 'success') {
              setStatus('confirmed')
              confirmed = true
            } else if (txData.tx_status === 'abort_by_response' || txData.tx_status === 'abort_by_runtime') {
              setStatus('failed')
              setError('Transaction failed')
              confirmed = true
            }
          } catch (err) {
            console.error('❌ Error polling transaction:', err)
          }
        }

        if (!confirmed) {
          setStatus('pending')
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Contract call failed'
      setError(errorMsg)
      setStatus('failed')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getStream = useCallback(
    async (streamId: bigint): Promise<StreamData | null> => {
      setIsLoading(true)
      setError(null)
      try {
        const network = getNetwork()
        const result = await fetchStream(streamId, network)
        return result
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch stream'
        setError(errorMsg)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const getStreamBalance = useCallback(async (streamId: bigint): Promise<bigint> => {
    setIsLoading(true)
    setError(null)
    try {
      const network = getNetwork()
      const result = await fetchStreamBalance(streamId, network)
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch balance'
      setError(errorMsg)
      return 0n
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getSenderStreams = useCallback(
    async (sender: string): Promise<bigint[]> => {
      setIsLoading(true)
      setError(null)
      try {
        const network = getNetwork()
        const result = await fetchSenderStreams(sender, network)
        return result
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch sender streams'
        setError(errorMsg)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const getRecipientStreams = useCallback(
    async (recipient: string): Promise<bigint[]> => {
      setIsLoading(true)
      setError(null)
      try {
        const network = getNetwork()
        const result = await fetchRecipientStreams(recipient, network)
        return result
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch recipient streams'
        setError(errorMsg)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const getTotalStreams = useCallback(async (): Promise<bigint> => {
    setIsLoading(true)
    setError(null)
    try {
      const network = getNetwork()
      const result = await fetchTotalStreams(network)
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch total streams'
      setError(errorMsg)
      return 0n
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getStreamProgress = useCallback(
    async (streamId: bigint): Promise<StreamProgress> => {
      setIsLoading(true)
      setError(null)
      try {
        const network = getNetwork()
        const result = await fetchStreamProgress(streamId, network)
        return result
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch stream progress'
        setError(errorMsg)
        return {
          totalBlocks: 0n,
          blocksElapsed: 0n,
          streamed: 0n,
          withdrawn: 0n,
          claimable: 0n,
          currentBlock: 0n,
          percentComplete: 0,
        }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const getContractBalance = useCallback(async (): Promise<bigint> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchContractBalance()
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch contract balance'
      setError(errorMsg)
      return 0n
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    txId,
    error,
    status,
    call,
    reset,
    getStream,
    getStreamBalance,
    getSenderStreams,
    getRecipientStreams,
    getTotalStreams,
    getStreamProgress,
    getContractBalance,
  }
}
        setError(errorMsg)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const getTotalStreams = useCallback(async (): Promise<bigint> => {
    setIsLoading(true)
    setError(null)
    try {
      const network = getCurrentNetwork()
      const result = await fetchTotalStreams(network)
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch total streams'
      setError(errorMsg)
      return 0n
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getStreamProgress = useCallback(
    async (streamId: bigint): Promise<StreamProgress> => {
      setIsLoading(true)
      setError(null)
      try {
        const network = getCurrentNetwork()
        const result = await fetchStreamProgress(streamId, network)
        return result
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch progress'
        setError(errorMsg)
        return {
          streamId,
          totalAmount: 0n,
          accruedAmount: 0n,
          claimableAmount: 0n,
          percentComplete: 0,
        }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return {
    getStream,
    getStreamBalance,
    getSenderStreams,
    getRecipientStreams,
    getTotalStreams,
    getStreamProgress,
    isLoading,
    error,
  }
}
