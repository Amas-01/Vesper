# Task 1.10: Wallet UI Components

This directory contains all wallet-related UI components for the Vesper dApp.

## Components

### ConnectWallet.tsx
Button component for wallet connection management:
- Shows "Connect Wallet" when disconnected
- Displays truncated address (first 6 + last 4 characters) when connected
- Shows "Disconnect" button when connected
- Loading state during connection attempt
- Error display if connection fails

### WalletStatus.tsx
Displays wallet information in header:
- Full wallet address in readable format (STX principal)
- Network badge (mainnet/testnet) with color coding
- STX balance fetched from Hiro API
- 30-second auto-refresh of balance data
- NetworkName displayed based on environment config

## Implementation Details

Both components integrate with:
- `useWallet()` hook for connection management
- `@stacks/connect` for wallet interaction
- Environment-aware network selection
- TypeScript types for full type safety
