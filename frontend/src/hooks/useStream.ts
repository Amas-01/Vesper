import { useCallback } from 'react'
import { useContract, type TransactionStatus } from './useContract'
import {
  buildCreateStreamTx,
  buildWithdrawTx,
  buildCancelStreamTx,
  buildTopUpTx,
  buildExpireStreamTx,
  buildReturnFundsTx,
} from '../lib/contracts'
import type { CreateStreamParams } from '../types/stream'

export function useStream() {
  const contract = useContract()

  const createStream = useCallback(
    async (params: CreateStreamParams & { senderAddress: string }) => {
      const tx = buildCreateStreamTx(params)
      await contract.call(tx)
    },
    [contract]
  )

  const withdrawFromStream = useCallback(
    async (streamId: bigint, recipientAddress: string) => {
      const tx = buildWithdrawTx({ streamId, recipientAddress })
      await contract.call(tx)
    },
    [contract]
  )

  const cancelStream = useCallback(
    async (streamId: bigint, senderAddress: string, reason?: string) => {
      const tx = buildCancelStreamTx({ streamId, reason, senderAddress })
      await contract.call(tx)
    },
    [contract]
  )

  const topUpStream = useCallback(
    async (streamId: bigint, additional: bigint, senderAddress: string) => {
      const tx = buildTopUpTx({ streamId, additional, senderAddress })
      await contract.call(tx)
    },
    [contract]
  )

  const expireStream = useCallback(
    async (streamId: bigint, callerAddress: string) => {
      const tx = buildExpireStreamTx({ streamId, callerAddress })
      await contract.call(tx)
    },
    [contract]
  )

  const returnFunds = useCallback(
    async (senderAddress: string) => {
      const tx = buildReturnFundsTx({ senderAddress })
      await contract.call(tx)
    },
    [contract]
  )

  return {
    isLoading: contract.isLoading,
    txId: contract.txId,
    error: contract.error,
    status: contract.status as TransactionStatus,
    createStream,
    withdrawFromStream,
    cancelStream,
    topUpStream,
    expireStream,
    returnFunds,
    reset: contract.reset,
  }
}
