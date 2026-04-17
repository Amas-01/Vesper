import { useCallback, useState } from 'react'
import { getCurrentNetwork } from '../lib/stacks'
import {
  fetchStream,
  fetchStreamBalance,
  fetchSenderStreams,
  fetchRecipientStreams,
  fetchTotalStreams,
  fetchStreamProgress,
} from '../lib/contracts'
import { StreamData, StreamProgress } from '../types/stream'

export function useContract() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getStream = useCallback(
    async (streamId: bigint): Promise<StreamData | null> => {
      setIsLoading(true)
      setError(null)
      try {
        const network = getCurrentNetwork()
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
      const network = getCurrentNetwork()
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
        const network = getCurrentNetwork()
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
        const network = getCurrentNetwork()
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
