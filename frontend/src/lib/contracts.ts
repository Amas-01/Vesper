import {
  fetchCallReadOnlyFunction,
  cvToValue,
  uintCV,
  principalCV,
  stringAsciiCV,
  type ContractCallOptions,
} from '@stacks/transactions'
import type { StacksNetwork } from '@stacks/network'
import { VESPER_CONTRACT_ADDRESS, VESPER_CONTRACT_NAME, getCurrentNetwork } from './stacks'
import type { StreamData, StreamProgress } from '../types/stream'

/**
 * STATE-CHANGING FUNCTION BUILDERS
 */

interface CreateStreamTxParams {
  recipient: string
  deposit: bigint
  ratePerBlock: bigint
  durationBlocks: bigint
  memo: string
  senderAddress: string
}

export function buildCreateStreamTx(params: CreateStreamTxParams): ContractCallOptions {
  const { recipient, deposit, ratePerBlock, durationBlocks, memo, senderAddress } = params

  return {
    contractAddress: VESPER_CONTRACT_ADDRESS,
    contractName: VESPER_CONTRACT_NAME,
    functionName: 'create-stream',
    functionArgs: [
      principalCV(recipient),
      uintCV(deposit),
      uintCV(ratePerBlock),
      uintCV(durationBlocks),
      stringAsciiCV(memo),
    ],
    senderAddress,
    // Post conditions will be added later when we have the exact token handling logic
    postConditionMode: undefined,
  } as ContractCallOptions
}

interface WithdrawTxParams {
  streamId: bigint
  recipientAddress: string
}

export function buildWithdrawTx(params: WithdrawTxParams): ContractCallOptions {
  const { streamId, recipientAddress } = params

  return {
    contractAddress: VESPER_CONTRACT_ADDRESS,
    contractName: VESPER_CONTRACT_NAME,
    functionName: 'withdraw-from-stream',
    functionArgs: [uintCV(streamId)],
    senderAddress: recipientAddress,
  } as ContractCallOptions
}

interface CancelStreamTxParams {
  streamId: bigint
  senderAddress: string
}

export function buildCancelStreamTx(params: CancelStreamTxParams): ContractCallOptions {
  const { streamId, senderAddress } = params

  return {
    contractAddress: VESPER_CONTRACT_ADDRESS,
    contractName: VESPER_CONTRACT_NAME,
    functionName: 'cancel-stream',
    functionArgs: [uintCV(streamId)],
    senderAddress,
  } as ContractCallOptions
}

interface TopUpTxParams {
  streamId: bigint
  additional: bigint
  senderAddress: string
}

export function buildTopUpTx(params: TopUpTxParams): ContractCallOptions {
  const { streamId, additional, senderAddress } = params

  return {
    contractAddress: VESPER_CONTRACT_ADDRESS,
    contractName: VESPER_CONTRACT_NAME,
    functionName: 'top-up-stream',
    functionArgs: [uintCV(streamId), uintCV(additional)],
    senderAddress,
  } as ContractCallOptions
}

interface ExpireStreamTxParams {
  streamId: bigint
  callerAddress: string
}

export function buildExpireStreamTx(params: ExpireStreamTxParams): ContractCallOptions {
  const { streamId, callerAddress } = params

  return {
    contractAddress: VESPER_CONTRACT_ADDRESS,
    contractName: VESPER_CONTRACT_NAME,
    functionName: 'expire-stream',
    functionArgs: [uintCV(streamId)],
    senderAddress: callerAddress,
  } as ContractCallOptions
}

/**
 * READ-ONLY FUNCTION FETCHERS
 */

export async function fetchStream(
  streamId: bigint,
  network?: StacksNetwork
): Promise<StreamData | null> {
  const nw = network || getCurrentNetwork()

  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: VESPER_CONTRACT_ADDRESS,
      contractName: VESPER_CONTRACT_NAME,
      functionName: 'get-stream',
      functionArgs: [uintCV(streamId)],
      network: nw,
      senderAddress: VESPER_CONTRACT_ADDRESS,
    })

    // fetchCallReadOnlyFunction returns ClarityValue directly
    const value = cvToValue(result)
    return {
      id: streamId,
      payer: value.payer || '',
      recipient: value.recipient || '',
      totalAmount: BigInt(value['total-amount'] || 0),
      withdrawn: BigInt(value.withdrawn || 0),
      startBlock: BigInt(value['start-block'] || 0),
      endBlock: BigInt(value['end-block'] || 0),
      ratePerBlock: BigInt(value['rate-per-block'] || 0),
      status: value.status || 'active',
      escrowModel: value['escrow-model'] || 'standard',
      createdAt: BigInt(value['created-at'] || 0),
    } as StreamData
  } catch (error) {
    console.error(`Error fetching stream ${streamId}:`, error)
    return null
  }
}

export async function fetchStreamBalance(
  streamId: bigint,
  network?: StacksNetwork
): Promise<bigint> {
  const nw = network || getCurrentNetwork()

  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: VESPER_CONTRACT_ADDRESS,
      contractName: VESPER_CONTRACT_NAME,
      functionName: 'get-available-balance',
      functionArgs: [uintCV(streamId)],
      network: nw,
      senderAddress: VESPER_CONTRACT_ADDRESS,
    })

    const value = cvToValue(result)
    return BigInt(value || 0)
  } catch (error) {
    console.error(`Error fetching stream balance for ${streamId}:`, error)
    return 0n
  }
}

export async function fetchSenderStreams(
  sender: string,
  network?: StacksNetwork
): Promise<bigint[]> {
  const nw = network || getCurrentNetwork()

  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: VESPER_CONTRACT_ADDRESS,
      contractName: VESPER_CONTRACT_NAME,
      functionName: 'get-sender-streams',
      functionArgs: [principalCV(sender)],
      network: nw,
      senderAddress: VESPER_CONTRACT_ADDRESS,
    })

    const value = cvToValue(result) as any[]
    return value?.map(v => BigInt(v)) || []
  } catch (error) {
    console.error(`Error fetching sender streams for ${sender}:`, error)
    return []
  }
}

export async function fetchRecipientStreams(
  recipient: string,
  network?: StacksNetwork
): Promise<bigint[]> {
  const nw = network || getCurrentNetwork()

  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: VESPER_CONTRACT_ADDRESS,
      contractName: VESPER_CONTRACT_NAME,
      functionName: 'get-recipient-streams',
      functionArgs: [principalCV(recipient)],
      network: nw,
      senderAddress: VESPER_CONTRACT_ADDRESS,
    })

    const value = cvToValue(result) as any[]
    return value?.map(v => BigInt(v)) || []
  } catch (error) {
    console.error(`Error fetching recipient streams for ${recipient}:`, error)
    return []
  }
}

export async function fetchTotalStreams(network?: StacksNetwork): Promise<bigint> {
  const nw = network || getCurrentNetwork()

  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: VESPER_CONTRACT_ADDRESS,
      contractName: VESPER_CONTRACT_NAME,
      functionName: 'get-total-streams',
      functionArgs: [],
      network: nw,
      senderAddress: VESPER_CONTRACT_ADDRESS,
    })

    const value = cvToValue(result)
    return BigInt(value || 0)
  } catch (error) {
    console.error('Error fetching total streams:', error)
    return 0n
  }
}

export async function fetchStreamProgress(
  streamId: bigint,
  network?: StacksNetwork
): Promise<StreamProgress> {
  const stream = await fetchStream(streamId, network)

  if (!stream) {
    return {
      streamId,
      totalAmount: 0n,
      accruedAmount: 0n,
      claimableAmount: 0n,
      percentComplete: 0,
    }
  }

  const nw = network || getCurrentNetwork()
  const claimable = await fetchStreamBalance(streamId, nw)

  // Calculate accrued based on blocks elapsed (simplified - actual implementation
  // should call get-stream-balance or similar contract function)
  const accruedAmount = stream.totalAmount - stream.withdrawn
  const percentComplete =
    stream.totalAmount > 0n ? Number((accruedAmount * 100n) / stream.totalAmount) : 0

  return {
    streamId,
    totalAmount: stream.totalAmount,
    accruedAmount,
    claimableAmount: claimable,
    percentComplete,
  }
}
