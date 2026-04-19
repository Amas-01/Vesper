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
    async (streamId: bigint) => {
      const tx = buildWithdrawTx({ streamId })
      await contract.call(tx)
    },
    [contract]
  )

  const cancelStream = useCallback(
    async (streamId: bigint) => {
      const tx = buildCancelStreamTx({ streamId })
      await contract.call(tx)
    },
    [contract]
  )

  const topUpStream = useCallback(
    async (streamId: bigint, topUpAmount: bigint, senderAddress: string) => {
      const tx = buildTopUpTx({ streamId, topUpAmount, senderAddress })
      await contract.call(tx)
    },
    [contract]
  )

  const expireStream = useCallback(
    async (streamId: bigint) => {
      const tx = buildExpireStreamTx({ streamId })
      await contract.call(tx)
    },
    [contract]
  )

  const returnFunds = useCallback(
    async (streamId: bigint, senderAddress: string, returnAmount: bigint) => {
      const tx = buildReturnFundsTx({ streamId, senderAddress, returnAmount })
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
