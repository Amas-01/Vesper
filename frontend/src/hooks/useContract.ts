import { useCallback, useState } from 'react'
import { openContractCall } from '@stacks/connect'
import { getNetwork } from '../lib/stacks'
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

  const call = useCallback(async (options: any) => {
    setIsLoading(true)
    setError(null)
    setStatus('pending')

    try {
      await openContractCall(options)
      // openContractCall returns void but handles tx through wallet
      setStatus('confirmed')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Contract call failed'
      setError(errorMsg)
      setStatus('failed')
      console.error('❌ Contract call error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Read-only getters
  const getStream = useCallback(async (streamId: bigint): Promise<StreamData | null> => {
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
  }, [])

  const getStreamBalance = useCallback(async (streamId: bigint): Promise<bigint> => {
    setIsLoading(true)
    setError(null)
    try {
      const network = getNetwork()
      const result = await fetchStreamBalance(streamId, network)
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch stream balance'
      setError(errorMsg)
      return 0n
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getSenderStreams = useCallback(async (sender: string): Promise<bigint[]> => {
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
  }, [])

  const getRecipientStreams = useCallback(async (recipient: string): Promise<bigint[]> => {
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
  }, [])

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

  const getStreamProgress = useCallback(async (streamId: bigint): Promise<StreamProgress | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const network = getNetwork()
      const result = await fetchStreamProgress(streamId, network)
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch stream progress'
      setError(errorMsg)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getContractBalance = useCallback(async (): Promise<bigint> => {
    setIsLoading(true)
    setError(null)
    try {
      const network = getNetwork()
      const result = await fetchContractBalance(network)
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
    // State
    isLoading,
    txId,
    error,
    status,
    
    // Methods
    call,
    reset,
    
    // Read-only getters
    getStream,
    getStreamBalance,
    getSenderStreams,
    getRecipientStreams,
    getTotalStreams,
    getStreamProgress,
    getContractBalance,
  }
}
