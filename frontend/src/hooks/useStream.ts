import { useCallback, useState } from 'react'
import { useWallet } from './useWallet'
import {
  buildCreateStreamTx,
  buildWithdrawTx,
  buildCancelStreamTx,
  buildTopUpTx,
  buildExpireStreamTx,
} from '../lib/contracts'
import { openContractCall } from '@stacks/connect'
import { userSession } from './useWallet'

interface StreamOperationResult {
  success: boolean
  message: string
  txId?: string
}

export function useStream() {
  const { address, isConnected } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createStream = useCallback(
    async (params: {
      recipient: string
      deposit: bigint
      ratePerBlock: bigint
      durationBlocks: bigint
      memo: string
    }): Promise<StreamOperationResult> => {
      if (!isConnected || !address) {
        return { success: false, message: 'Wallet not connected' }
      }

      setIsLoading(true)
      setError(null)

      try {
        const txOptions = buildCreateStreamTx({
          ...params,
          senderAddress: address,
        })

        await openContractCall({
          contractAddress: txOptions.contractAddress,
          contractName: txOptions.contractName,
          functionName: txOptions.functionName,
          functionArgs: txOptions.functionArgs,
          userSession,
          onFinish: (data: any) => {
            console.log('Contract call finished:', data)
            setIsLoading(false)
          },
          onCancel: () => {
            setIsLoading(false)
            setError('Transaction cancelled')
          },
        } as any)

        return { success: true, message: 'Stream created successfully' }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create stream'
        setError(errorMsg)
        setIsLoading(false)
        return { success: false, message: errorMsg }
      }
    },
    [address, isConnected]
  )

  const withdrawStream = useCallback(
    async (streamId: bigint): Promise<StreamOperationResult> => {
      if (!isConnected || !address) {
        return { success: false, message: 'Wallet not connected' }
      }

      setIsLoading(true)
      setError(null)

      try {
        const txOptions = buildWithdrawTx({
          streamId,
          recipientAddress: address,
        })

        await openContractCall({
          contractAddress: txOptions.contractAddress,
          contractName: txOptions.contractName,
          functionName: txOptions.functionName,
          functionArgs: txOptions.functionArgs,
          userSession,
          onFinish: (data: any) => {
            console.log('Withdrawal complete:', data)
            setIsLoading(false)
          },
          onCancel: () => {
            setIsLoading(false)
            setError('Transaction cancelled')
          },
        } as any)

        return { success: true, message: 'Withdrawal successful' }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to withdraw'
        setError(errorMsg)
        setIsLoading(false)
        return { success: false, message: errorMsg }
      }
    },
    [address, isConnected]
  )

  const cancelStream = useCallback(
    async (streamId: bigint): Promise<StreamOperationResult> => {
      if (!isConnected || !address) {
        return { success: false, message: 'Wallet not connected' }
      }

      setIsLoading(true)
      setError(null)

      try {
        const txOptions = buildCancelStreamTx({
          streamId,
          senderAddress: address,
        })

        await openContractCall({
          contractAddress: txOptions.contractAddress,
          contractName: txOptions.contractName,
          functionName: txOptions.functionName,
          functionArgs: txOptions.functionArgs,
          userSession,
          onFinish: (data: any) => {
            console.log('Stream cancelled:', data)
            setIsLoading(false)
          },
          onCancel: () => {
            setIsLoading(false)
            setError('Transaction cancelled')
          },
        } as any)

        return { success: true, message: 'Stream cancelled successfully' }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to cancel stream'
        setError(errorMsg)
        setIsLoading(false)
        return { success: false, message: errorMsg }
      }
    },
    [address, isConnected]
  )

  const topUpStream = useCallback(
    async (streamId: bigint, additional: bigint): Promise<StreamOperationResult> => {
      if (!isConnected || !address) {
        return { success: false, message: 'Wallet not connected' }
      }

      setIsLoading(true)
      setError(null)

      try {
        const txOptions = buildTopUpTx({
          streamId,
          additional,
          senderAddress: address,
        })

        await openContractCall({
          contractAddress: txOptions.contractAddress,
          contractName: txOptions.contractName,
          functionName: txOptions.functionName,
          functionArgs: txOptions.functionArgs,
          userSession,
          onFinish: (data: any) => {
            console.log('Stream topped up:', data)
            setIsLoading(false)
          },
          onCancel: () => {
            setIsLoading(false)
            setError('Transaction cancelled')
          },
        } as any)

        return { success: true, message: 'Top-up successful' }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to top up stream'
        setError(errorMsg)
        setIsLoading(false)
        return { success: false, message: errorMsg }
      }
    },
    [address, isConnected]
  )

  const expireStream = useCallback(
    async (streamId: bigint): Promise<StreamOperationResult> => {
      if (!isConnected || !address) {
        return { success: false, message: 'Wallet not connected' }
      }

      setIsLoading(true)
      setError(null)

      try {
        const txOptions = buildExpireStreamTx({
          streamId,
          callerAddress: address,
        })

        await openContractCall({
          contractAddress: txOptions.contractAddress,
          contractName: txOptions.contractName,
          functionName: txOptions.functionName,
          functionArgs: txOptions.functionArgs,
          userSession,
          onFinish: (data: any) => {
            console.log('Stream expired:', data)
            setIsLoading(false)
          },
          onCancel: () => {
            setIsLoading(false)
            setError('Transaction cancelled')
          },
        } as any)

        return { success: true, message: 'Stream expired' }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to expire stream'
        setError(errorMsg)
        setIsLoading(false)
        return { success: false, message: errorMsg }
      }
    },
    [address, isConnected]
  )

  return {
    createStream,
    withdrawStream,
    cancelStream,
    topUpStream,
    expireStream,
    isLoading,
    error,
  }
}
