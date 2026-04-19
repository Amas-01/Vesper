export type NetworkType = 'mainnet' | 'testnet'

export interface StreamData {
  id: bigint
  sender: string
  recipient: string
  deposit: bigint
  ratePerBlock: bigint
  startBlock: bigint
  stopBlock: bigint
  totalWithdrawn: bigint
  memo?: string
  paused: boolean
}

export interface StreamProgress {
  totalBlocks: bigint
  blocksElapsed: bigint
  streamed: bigint
  withdrawn: bigint
  claimable: bigint
  currentBlock: bigint
  percentComplete: number
}

export interface CreateStreamParams {
  recipient: string
  deposit: bigint
  ratePerBlock: bigint
  stopBlock: bigint
  memo?: string
}

export interface BatchStreamEntry {
  recipient: string
  ratePerBlock: bigint
  stopBlock: bigint
}

export interface StreamEvent {
  type: 'created' | 'withdrawn' | 'cancelled' | 'paused' | 'resumed'
  streamId: bigint
  amount?: bigint
  timestamp: number
  txHash: string
}
