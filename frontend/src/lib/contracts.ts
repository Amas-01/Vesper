import {
  makeContractCall,
  callReadOnlyFunction,
  cvToValue,
  uintCV,
  principalCV,
  stringAsciiCV,
  noneCV,
  someCV,
  PostConditionMode,
  FungibleConditionCode,
  makeStandardSTXPostCondition,
  AnchorMode,
  type ContractCallOptions,
} from '@stacks/transactions'
import type { StacksNetwork } from '@stacks/network'
import { getNetwork, CONTRACT_CONFIG, STACKS_API_BASE } from './stacks'
import type { StreamData, StreamProgress, CreateStreamParams } from '../types/stream'

/**
 * STATE-CHANGING FUNCTION BUILDERS
 */

export function buildCreateStreamTx(params: CreateStreamParams & { senderAddress: string }): ContractCallOptions {
  const { recipient, deposit, ratePerBlock, stopBlock, memo, senderAddress } = params

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
    senderAddress,
    postConditionMode: PostConditionMode.Allow,
    postConditions: [
      makeStandardSTXPostCondition(
        senderAddress,
        FungibleConditionCode.LessEqual,
        deposit
      ),
    ],
    anchorMode: AnchorMode.Any,
  }
}

export function buildWithdrawTx(params: { streamId: bigint; recipientAddress: string }): ContractCallOptions {
  const { streamId, recipientAddress } = params

  return {
    contractAddress: CONTRACT_CONFIG.vesperCore.address,
    contractName: CONTRACT_CONFIG.vesperCore.name,
    functionName: 'withdraw-stream',
    functionArgs: [uintCV(streamId)],
    senderAddress: recipientAddress,
    anchorMode: AnchorMode.Any,
  }
}

export function buildCancelStreamTx(params: { streamId: bigint; reason?: string; senderAddress: string }): ContractCallOptions {
  const { streamId, reason, senderAddress } = params

  return {
    contractAddress: CONTRACT_CONFIG.vesperCore.address,
    contractName: CONTRACT_CONFIG.vesperCore.name,
    functionName: 'cancel-stream',
    functionArgs: [
      uintCV(streamId),
      reason ? stringAsciiCV(reason.slice(0, 100)) : stringAsciiCV('cancelled'),
    ],
    senderAddress,
    anchorMode: AnchorMode.Any,
  }
}

export function buildTopUpTx(params: { streamId: bigint; additional: bigint; senderAddress: string }): ContractCallOptions {
  const { streamId, additional, senderAddress } = params

  return {
    contractAddress: CONTRACT_CONFIG.vesperCore.address,
    contractName: CONTRACT_CONFIG.vesperCore.name,
    functionName: 'deposit-escrow',
    functionArgs: [uintCV(streamId), uintCV(additional)],
    senderAddress,
    postConditionMode: PostConditionMode.Allow,
    postConditions: [
      makeStandardSTXPostCondition(
        senderAddress,
        FungibleConditionCode.LessEqual,
        additional
      ),
    ],
    anchorMode: AnchorMode.Any,
  }
}

export function buildExpireStreamTx(params: { streamId: bigint; callerAddress: string }): ContractCallOptions {
  const { streamId, callerAddress } = params

  return {
    contractAddress: CONTRACT_CONFIG.vesperCore.address,
    contractName: CONTRACT_CONFIG.vesperCore.name,
    functionName: 'resume-stream',
    functionArgs: [uintCV(streamId)],
    senderAddress: callerAddress,
    anchorMode: AnchorMode.Any,
  }
}

export function buildReturnFundsTx(params: { senderAddress: string }): ContractCallOptions {
  const { senderAddress } = params

  return {
    contractAddress: CONTRACT_CONFIG.vesperCore.address,
    contractName: CONTRACT_CONFIG.vesperCore.name,
    functionName: 'withdraw-escrow',
    functionArgs: [uintCV(0n)],
    senderAddress,
    anchorMode: AnchorMode.Any,
  }
}

/**
 * READ-ONLY FUNCTION FETCHERS
 */

export async function fetchStream(streamId: bigint, network?: StacksNetwork): Promise<StreamData | null> {
  const nw = network || getNetwork()

  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.vesperCore.address,
      contractName: CONTRACT_CONFIG.vesperCore.name,
      functionName: 'get-stream',
      functionArgs: [uintCV(streamId)],
      network: nw,
      senderAddress: CONTRACT_CONFIG.vesperCore.address,
    })

    const value = cvToValue(result) as any
    return {
      id: streamId,
      sender: value.sender || '',
      recipient: value.recipient || '',
      deposit: BigInt(value.deposit || 0),
      ratePerBlock: BigInt(value['rate-per-block'] || 0),
      startBlock: BigInt(value['start-block'] || 0),
      stopBlock: BigInt(value['stop-block'] || 0),
      totalWithdrawn: BigInt(value['total-withdrawn'] || 0),
      memo: value.memo || undefined,
      paused: value.paused || false,
    }
  } catch (error) {
    console.error(`❌ Error fetching stream ${streamId}:`, error)
    return null
  }
}

export async function fetchStreamBalance(streamId: bigint, network?: StacksNetwork): Promise<bigint> {
  const nw = network || getNetwork()

  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.vesperCore.address,
      contractName: CONTRACT_CONFIG.vesperCore.name,
      functionName: 'get-stream-progress',
      functionArgs: [uintCV(streamId)],
      network: nw,
      senderAddress: CONTRACT_CONFIG.vesperCore.address,
    })

    const value = cvToValue(result) as any
    return BigInt(value?.claimable || 0)
  } catch (error) {
    console.error(`❌ Error fetching stream balance for ${streamId}:`, error)
    return 0n
  }
}

export async function fetchSenderStreams(sender: string, network?: StacksNetwork): Promise<bigint[]> {
  const nw = network || getNetwork()

  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.vesperCore.address,
      contractName: CONTRACT_CONFIG.vesperCore.name,
      functionName: 'get-sender-streams',
      functionArgs: [principalCV(sender)],
      network: nw,
      senderAddress: CONTRACT_CONFIG.vesperCore.address,
    })

    const value = cvToValue(result) as any[]
    return value?.map(v => BigInt(v)) || []
  } catch (error) {
    console.error(`❌ Error fetching sender streams for ${sender}:`, error)
    return []
  }
}

export async function fetchRecipientStreams(recipient: string, network?: StacksNetwork): Promise<bigint[]> {
  const nw = network || getNetwork()

  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.vesperCore.address,
      contractName: CONTRACT_CONFIG.vesperCore.name,
      functionName: 'get-recipient-streams',
      functionArgs: [principalCV(recipient)],
      network: nw,
      senderAddress: CONTRACT_CONFIG.vesperCore.address,
    })

    const value = cvToValue(result) as any[]
    return value?.map(v => BigInt(v)) || []
  } catch (error) {
    console.error(`❌ Error fetching recipient streams for ${recipient}:`, error)
    return []
  }
}

export async function fetchTotalStreams(network?: StacksNetwork): Promise<bigint> {
  const nw = network || getNetwork()

  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.vesperCore.address,
      contractName: CONTRACT_CONFIG.vesperCore.name,
      functionName: 'get-active-streams',
      functionArgs: [],
      network: nw,
      senderAddress: CONTRACT_CONFIG.vesperCore.address,
    })

    const value = cvToValue(result) as any
    return BigInt(value || 0)
  } catch (error) {
    console.error('❌ Error fetching total streams:', error)
    return 0n
  }
}

export async function fetchStreamProgress(streamId: bigint, network?: StacksNetwork): Promise<StreamProgress> {
  const nw = network || getNetwork()

  try {
    const stream = await fetchStream(streamId, nw)
    if (!stream) {
      return {
        totalBlocks: 0n,
        blocksElapsed: 0n,
        streamed: 0n,
        withdrawn: stream?.totalWithdrawn || 0n,
        claimable: 0n,
        currentBlock: 0n,
        percentComplete: 0,
      }
    }

    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_CONFIG.vesperCore.address,
      contractName: CONTRACT_CONFIG.vesperCore.name,
      functionName: 'get-stream-progress',
      functionArgs: [uintCV(streamId)],
      network: nw,
      senderAddress: CONTRACT_CONFIG.vesperCore.address,
    })

    const value = cvToValue(result) as any
    const totalBlocks = stream.stopBlock - stream.startBlock
    const streamed = stream.ratePerBlock * (value['current-block'] - stream.startBlock)

    return {
      totalBlocks,
      blocksElapsed: value['current-block'] - stream.startBlock,
      streamed,
      withdrawn: stream.totalWithdrawn,
      claimable: BigInt(value?.claimable || 0),
      currentBlock: BigInt(value['current-block'] || 0),
      percentComplete: totalBlocks > 0n ? Number((streamed * 100n) / (stream.deposit)) : 0,
    }
  } catch (error) {
    console.error(`❌ Error fetching stream progress for ${streamId}:`, error)
    return {
      totalBlocks: 0n,
      blocksElapsed: 0n,
      streamed: 0n,
      withdrawn: 0n,
      claimable: 0n,
      currentBlock: 0n,
      percentComplete: 0,
    }
  }
}

export async function fetchContractBalance(network?: StacksNetwork): Promise<bigint> {
  const nw = network || getNetwork()

  try {
    const apiBase = STACKS_API_BASE
    const response = await fetch(
      `${apiBase}/extended/v1/address/${CONTRACT_CONFIG.vesperCore.address}/stx_balance`
    )
    const data = await response.json()
    return BigInt(data?.balance || 0)
  } catch (error) {
    console.error('❌ Error fetching contract balance:', error)
    return 0n
  }
}
