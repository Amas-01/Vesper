import {
  fetchCallReadOnlyFunction,
  cvToValue,
  uintCV,
  principalCV,
  stringAsciiCV,
  noneCV,
  someCV,
  PostConditionMode,
  AnchorMode,
  Pc,
  type PostCondition,
} from '@stacks/transactions'
import type { StacksNetwork } from '@stacks/network'
import { CONTRACT_CONFIG } from './stacks'
import type { StreamData, StreamProgress, CreateStreamParams } from '../types/stream'

/**
 * STATE-CHANGING FUNCTION BUILDERS
 */

export function buildCreateStreamTx(params: CreateStreamParams & { senderAddress: string }) {
  const { recipient, deposit, ratePerBlock, stopBlock, memo, senderAddress } = params

  const postConditions: PostCondition[] = [
    Pc.principal(senderAddress)
      .willSendLte(deposit)
      .ustx(),
  ]

  return {
    contractAddress: CONTRACT_CONFIG.vesperCore.address,
    contractName: CONTRACT_CONFIG.vesperCore.name,
    functionName: 'create-stream',
    functionArgs: [
      principalCV(recipient),
      uintCV(deposit),
      uintCV(ratePerBlock),
      uintCV(stopBlock),
      memo ? someCV(stringAsciiCV(memo)) : noneCV(),
    ],
    postConditionMode: PostConditionMode.Allow,
    postConditions,
    anchorMode: AnchorMode.Any,
  }
}

export function buildWithdrawTx(params: { streamId: bigint }) {
  const { streamId } = params

  return {
    contractAddress: CONTRACT_CONFIG.vesperCore.address,
    contractName: CONTRACT_CONFIG.vesperCore.name,
    functionName: 'withdraw-stream',
    functionArgs: [uintCV(streamId)],
    anchorMode: AnchorMode.Any,
  }
}

export function buildCancelStreamTx(params: { streamId: bigint }) {
  const { streamId } = params

  return {
    contractAddress: CONTRACT_CONFIG.vesperCore.address,
    contractName: CONTRACT_CONFIG.vesperCore.name,
    functionName: 'cancel-stream',
    functionArgs: [uintCV(streamId)],
    anchorMode: AnchorMode.Any,
  }
}

export function buildTopUpTx(params: { streamId: bigint; topUpAmount: bigint; senderAddress: string }) {
  const { streamId, topUpAmount, senderAddress } = params

  const postConditions: PostCondition[] = [
    Pc.principal(senderAddress)
      .willSendLte(topUpAmount)
      .ustx(),
  ]

  return {
    contractAddress: CONTRACT_CONFIG.vesperCore.address,
    contractName: CONTRACT_CONFIG.vesperCore.name,
    functionName: 'top-up-stream',
    functionArgs: [uintCV(streamId), uintCV(topUpAmount)],
    postConditionMode: PostConditionMode.Allow,
    postConditions,
    anchorMode: AnchorMode.Any,
  }
}

export function buildExpireStreamTx(params: { streamId: bigint }) {
  const { streamId } = params

  return {
    contractAddress: CONTRACT_CONFIG.vesperCore.address,
    contractName: CONTRACT_CONFIG.vesperCore.name,
    functionName: 'expire-stream',
    functionArgs: [uintCV(streamId)],
    anchorMode: AnchorMode.Any,
  }
}

export function buildReturnFundsTx(params: { streamId: bigint; senderAddress: string; returnAmount: bigint }) {
  const { streamId, senderAddress, returnAmount } = params

  const postConditions: PostCondition[] = [
    Pc.principal(senderAddress)
      .willSendLte(returnAmount)
      .ustx(),
  ]

  return {
    contractAddress: CONTRACT_CONFIG.vesperCore.address,
    contractName: CONTRACT_CONFIG.vesperCore.name,
    functionName: 'return-funds',
    functionArgs: [uintCV(streamId), uintCV(returnAmount)],
    postConditionMode: PostConditionMode.Allow,
    postConditions,
    anchorMode: AnchorMode.Any,
  }
}

/**
 * READ-ONLY FUNCTION FETCHERS
 */

export async function fetchStream(streamId: bigint, network: StacksNetwork): Promise<StreamData | null> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.vesperCore.address,
      contractName: CONTRACT_CONFIG.vesperCore.name,
      functionName: 'get-stream',
      functionArgs: [uintCV(streamId)],
      senderAddress: CONTRACT_CONFIG.vesperCore.address,
      network,
    })

    const stream = cvToValue(result) as {
      id: bigint
      sender: string
      recipient: string
      deposit: bigint
      ratePerBlock: bigint
      startBlock: bigint
      stopBlock: bigint
      totalWithdrawn: bigint
      memo: string | null
      paused: boolean
    }
    
    return {
      id: stream.id,
      sender: stream.sender,
      recipient: stream.recipient,
      deposit: stream.deposit,
      ratePerBlock: stream.ratePerBlock,
      startBlock: stream.startBlock,
      stopBlock: stream.stopBlock,
      totalWithdrawn: stream.totalWithdrawn,
      memo: stream.memo || '',
      paused: stream.paused,
    }
  } catch (err) {
    console.error('❌ Failed to fetch stream:', err)
    return null
  }
}

export async function fetchStreamBalance(streamId: bigint, network: StacksNetwork): Promise<bigint> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.vesperCore.address,
      contractName: CONTRACT_CONFIG.vesperCore.name,
      functionName: 'get-stream-balance',
      functionArgs: [uintCV(streamId)],
      senderAddress: CONTRACT_CONFIG.vesperCore.address,
      network,
    })

    const balance = cvToValue(result) as bigint
    return balance
  } catch (err) {
    console.error('❌ Failed to fetch stream balance:', err)
    return 0n
  }
}

export async function fetchSenderStreams(sender: string, network: StacksNetwork): Promise<bigint[]> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.vesperCore.address,
      contractName: CONTRACT_CONFIG.vesperCore.name,
      functionName: 'get-sender-streams',
      functionArgs: [principalCV(sender)],
      senderAddress: CONTRACT_CONFIG.vesperCore.address,
      network,
    })

    const streams = cvToValue(result) as bigint[]
    return streams
  } catch (err) {
    console.error('❌ Failed to fetch sender streams:', err)
    return []
  }
}

export async function fetchRecipientStreams(recipient: string, network: StacksNetwork): Promise<bigint[]> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.vesperCore.address,
      contractName: CONTRACT_CONFIG.vesperCore.name,
      functionName: 'get-recipient-streams',
      functionArgs: [principalCV(recipient)],
      senderAddress: CONTRACT_CONFIG.vesperCore.address,
      network,
    })

    const streams = cvToValue(result) as bigint[]
    return streams
  } catch (err) {
    console.error('❌ Failed to fetch recipient streams:', err)
    return []
  }
}

export async function fetchTotalStreams(network: StacksNetwork): Promise<bigint> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.vesperCore.address,
      contractName: CONTRACT_CONFIG.vesperCore.name,
      functionName: 'get-total-streams',
      functionArgs: [],
      senderAddress: CONTRACT_CONFIG.vesperCore.address,
      network,
    })

    const total = cvToValue(result) as bigint
    return total
  } catch (err) {
    console.error('❌ Failed to fetch total streams:', err)
    return 0n
  }
}

export async function fetchStreamProgress(streamId: bigint, network: StacksNetwork): Promise<StreamProgress | null> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.vesperCore.address,
      contractName: CONTRACT_CONFIG.vesperCore.name,
      functionName: 'get-stream-progress',
      functionArgs: [uintCV(streamId)],
      senderAddress: CONTRACT_CONFIG.vesperCore.address,
      network,
    })

    const progress = cvToValue(result) as {
      totalBlocks: bigint
      blocksElapsed: bigint
      streamed: bigint
      withdrawn: bigint
      claimable: bigint
      currentBlock: bigint
      percentComplete: bigint
    }
    
    return {
      totalBlocks: progress.totalBlocks,
      blocksElapsed: progress.blocksElapsed,
      streamed: progress.streamed,
      withdrawn: progress.withdrawn,
      claimable: progress.claimable,
      currentBlock: progress.currentBlock,
      percentComplete: Number(progress.percentComplete),
    }
  } catch (err) {
    console.error('❌ Failed to fetch stream progress:', err)
    return null
  }
}

export async function fetchContractBalance(network: StacksNetwork): Promise<bigint> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.vesperCore.address,
      contractName: CONTRACT_CONFIG.vesperCore.name,
      functionName: 'get-contract-balance',
      functionArgs: [],
      senderAddress: CONTRACT_CONFIG.vesperCore.address,
      network,
    })

    const balance = cvToValue(result) as bigint
    return balance
  } catch (err) {
    console.error('❌ Failed to fetch contract balance:', err)
    return 0n
  }
}
