// Placeholder types for stream operations
// TODO: Replace with actual generated types from contract ABI

export interface Stream {
  id: bigint
  payer: string
  recipient: string
  totalAmount: bigint
  withdrawn: bigint
  startBlock: bigint
  endBlock: bigint
  ratePerBlock: bigint
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  escrowModel: string
  createdAt: bigint
}

export interface StreamData {
  id: bigint
  payer: string
  recipient: string
  totalAmount: bigint
  withdrawn: bigint
  startBlock: bigint
  endBlock: bigint
  ratePerBlock: bigint
  status: string
  escrowModel: string
  createdAt: bigint
}

export interface StreamProgress {
  streamId: bigint
  totalAmount: bigint
  accruedAmount: bigint
  claimableAmount: bigint
  percentComplete: number
}

export interface CreateStreamParams {
  recipient: string
  totalDeposit: bigint
  ratePerBlock: bigint
  durationBlocks: bigint
  memo: string
}
