# Vesper Protocol Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│  Stream Dashboard │ Create Stream │ DAO Voting │ Analytics     │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
┌───────▼──────────┐         ┌───────────▼────────┐
│ Stacks JS SDK    │         │ Wallet Interface   │
│ @stacks/connect  │         │ (Hiro Wallet)      │
│ @stacks/txn      │         │                    │
└───────┬──────────┘         └────────┬───────────┘
        │                             │
        └─────────────┬───────────────┘
                      │
        ┌─────────────▼────────────────┐
        │   Stacks Blockchain Layer    │
        │  (Testnet & Mainnet)         │
        └─────────────┬────────────────┘
                      │
        ┌─────────────▼────────────────────────────┐
        │   Smart Contracts (Clarity)              │
        │  ├─ vesper-core (Streaming Logic)      │
        │  ├─ vesper-dao (Governance)            │
        │  └─ vesper-registry (Stream Registry)  │
        └─────────────┬────────────────────────────┘
                      │
        ┌─────────────▼────────────────┐
        │   sBTC Bridge (Stacks Core)  │
        │   Bitcoin Settlement Layer   │
        └─────────────────────────────┘
```

## Component Layers

### 1. Smart Contract Layer

#### vesper-core Contract
Handles all core streaming logic:
- **Stream Creation**: Payer deposits sBTC, sets recipient and rate
- **Per-Block Withdrawal**: Recipients withdraw accrued amount each block
- **Stream Management**: Pause, resume, rate adjustment
- **Escrow Management**: Hold payer deposits until stream completion

#### vesper-dao Contract
Governance and protocol management:
- **Token (VESPER)**: ERC20-equivalent governance token on Stacks
- **Proposals**: Submit and vote on protocol changes
- **Parameter Management**: DAO controls stream fees, max deposit, etc.
- **Treasury**: Holds protocol fees and emergency reserves

#### vesper-registry Contract
Stream enumeration and batching:
- **Stream Index**: Map of all active/inactive streams
- **User Streams**: List all streams for a given address (payer/recipient)
- **Batch Operations**: Submit multiple streams atomically

### 2. Frontend Layer

#### React Components
- **StreamDashboard**: Display active/completed streams with balances
- **StreamCreator**: Form to initiate new payment stream
- **DAOVoting**: Proposal voting interface
- **AnalyticsDashboard**: Real-time metrics and reporting
- **WalletConnect**: Wallet authentication and tx signing

#### State Management
- React Query for on-chain data fetching
- Zustand for local UI state
- Stacks.js SDK for transaction building

#### Styling
- Tailwind CSS for utility-first design
- Responsive mobile and desktop layouts

### 3. Wallet Integration

#### Hiro Wallet Integration
- Connect with `@stacks/connect`
- Sign transactions with user's private key
- Request permissions for specific capabilities

#### Transaction Flow
1. User initiates action (create stream, vote, withdraw)
2. Frontend builds Clarity transaction
3. Hiro Wallet prompts for signature
4. Signed transaction submitted to Stacks network
5. Network confirms after 1 block

### 4. sBTC Flow

**Deposit (Payer)**
```
Payer's Bitcoin → Stacks sBTC Bridge → sBTC on Stacks → vesper-core Contract
```

**Withdrawal (Recipient)**
```
vesper-core Escrow → Recipient's STX Address → Withdraw via Bridge (optional)
```

### 5. DAO Governance Model

**Governance Process:**
1. VESPER token holders propose changes
2. Other holders vote (1 token = 1 vote)
3. If majority approves, changes are proposed to core team
4. Core team implements and deploys (initially centralized, moving to decentralized)

**Governed Parameters:**
- Protocol fee percentage
- Max single stream deposit
- Min/max stream duration
- Acceptable escrow models

### 6. Block-Based Streaming Logic

**Key Concept**: Payments settle per Stacks block (~10 minutes)

**Math:**
- Stream rate: `sBTC amount / total blocks`
- Per-block accrual: `rate per block`
- Withdrawal: `min(accrued - withdrawn, available in escrow)`

**Example:**
```
Total Stream: 100 sBTC
Duration: 100 blocks
Rate per block: 1 sBTC/block

Block 1: Recipient can withdraw 1 sBTC
Block 10: Recipient can withdraw 10 sBTC
Block 100: Stream ends, final settlement
```

## Data Flow

### Create Stream
```
User Input → Form Validation → Build Clarity TX → Sign with Wallet → Submit → Confirmation
```

### Withdraw from Stream
```
Check Stream Active → Calculate Accrued → Build Withdrawal TX → Sign → Submit → Update UI
```

### Vote on Proposal
```
View Proposals → Select Option → Build Vote TX → Sign → Submit → Update Results
```

## Deployment Architecture

### Testnet
- Contracts deployed to Stacks testnet
- Frontend hosted on testnet Vercel preview
- sBTC testnet faucet for testing

### Mainnet
- Audited contracts deployed to mainnet
- Frontend on Vercel production domain
- sBTC mainnet liquidity pools
- DNS and SSL via Vercel

---

See [DATA_MODEL.md](DATA_MODEL.md) for detailed data structures.
