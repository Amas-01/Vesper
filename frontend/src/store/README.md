# Frontend Stores and Hooks

This directory contains Zustand stores and custom React hooks for state management and contract interaction.

## Stores

### walletStore.ts
Zustand store for managing wallet state with localStorage persistence:
- address: Connected wallet address (STX principal)
- isConnected: Boolean indicating wallet connection status
- network: Current network ('mainnet' or 'testnet')
- Methods: connect(), disconnect(), setAddress(), setNetwork()

## Hooks

### useWallet.ts
Hook for wallet connection and management:
- Wraps @stacks/connect showConnect()
- Manages AppConfig and UserSession
- Auto-detects signed-in users on app load
- Returns: address, isConnected, isLoading, error, connect(), disconnect()
- Network-aware: Prioritizes configured network from environment

### useContract.ts
Hook for contract interactions and read-only calls:
- Wraps openContractCall() from @stacks/connect
- Manages transaction state (pending, confirmed, failed)
- Transaction ID and error tracking
- Read-only getters for all contract functions
- Returns: isLoading, txId, error, status, call(), reset(), getStream(), etc.

### useStream.ts
High-level hook combining useContract with stream-specific functions:
- createStream(params): Create a new payment stream
- withdrawFromStream(streamId): Withdraw from stream
- cancelStream(streamId): Cancel stream (sender only)
- topUpStream(streamId, amount): Add funds to stream
- expireStream(streamId): End stream (after stopBlock)
- returnFunds(streamId, amount): Return unused funds

All hooks return loading, error, and status states for UI feedback.
