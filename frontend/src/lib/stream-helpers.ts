import { StreamData } from '../types/stream'

/**
 * Calculate total STX sent across all streams
 */
export function calculateTotalSent(streams: StreamData[]): bigint {
  return streams.reduce((total, stream) => total + stream.deposit, 0n)
}

/**
 * Calculate total STX withdrawn
 */
export function calculateTotalWithdrawn(streams: StreamData[]): bigint {
  return streams.reduce((total, stream) => total + stream.totalWithdrawn, 0n)
}

/**
 * Calculate total STX claimable
 */
export function calculateTotalClaimable(streams: StreamData[]): bigint {
  return streams.reduce((total, stream) => {
    const remaining = stream.deposit - stream.totalWithdrawn
    return total + (remaining > 0n ? remaining : 0n)
  }, 0n)
}

/**
 * Filter active streams
 */
export function getActiveStreams(streams: StreamData[]): StreamData[] {
  return streams.filter(stream => !stream.paused && stream.totalWithdrawn < stream.deposit)
}

/**
 * Filter completed streams
 */
export function getCompletedStreams(streams: StreamData[]): StreamData[] {
  return streams.filter(stream => stream.totalWithdrawn >= stream.deposit)
}

/**
 * Sort streams by creation
 */
export function sortStreamsByRecent(streams: StreamData[]): StreamData[] {
  return [...streams].sort((a, b) => {
    // Assuming startBlock indicates recency - higher block = more recent
    if (a.startBlock > b.startBlock) return -1
    if (a.startBlock < b.startBlock) return 1
    return 0
  })
}
