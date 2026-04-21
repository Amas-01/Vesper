# Task 1.9: Network Config & Contract Bindings

This directory contains the core infrastructure for the Vesper frontend:

## Files

- **stacks.ts** - Network configuration and contract constants
  - NETWORKS: Mainnet and testnet exports
  - get Network(): Returns configured network based on VITE_NETWORK env
  - getNetworkName(): Returns 'mainnet' or 'testnet' string
  - CONTRACT_CONFIG: Object with addresses for all 3 contracts
  - EXPLORER_BASE: Hiro explorer URL based on network
  - STACKS_API_BASE: Hiro API URL based on network

- **contracts.ts** - Contract call builders and read-only fetchers
  - State-changing functions: createStream, withdraw, cancel, topUp, expire, returnFunds
  - Read-only fetchers: getStream, getBalance, getSenderStreams, getRecipientStreams, getTotalStreams, getProgress, getContractBalance

## Environment Configuration

All contract addresses and network settings are configured via environment variables:
- .env.testnet: Testnet configuration (current dev setting)
- .env.mainnet: Mainnet configuration (production ready)
- .env.example: Template for environment setup

See root .env files for values.
