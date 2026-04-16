# Vesper Protocol Frontend Components

Comprehensive list of React components with props, purposes, and integration points.

## Component Hierarchy

```
<App>
├── <Header>
│   ├── <Logo>
│   ├── <Navigation>
│   └── <WalletConnect>
├── <Route: Dashboard>
│   ├── <StreamDashboard>
│   │   ├── <StreamCard>
│   │   ├── <StreamList>
│   │   └── <StreamFilters>
│   └── <SummaryMetrics>
├── <Route: Create Stream>
│   └── <StreamCreator>
│       ├── <RecipientInput>
│       ├── <AmountInput>
│       ├── <DurationInput>
│       └── <StreamPreview>
├── <Route: DAO>
│   ├── <ProposalList>
│   │   └── <ProposalCard>
│   ├── <ProposalDetail>
│   │   ├── <VotingBar>
│   │   └── <VoteButton>
│   └── <TokenBalance>
└── <Route: Analytics>
    ├── <StreamMetrics>
    ├── <Chart>
    └── <ExportData>
```

## Component Reference

### Layout Components

#### `App.tsx`
**Purpose**: Root component, routing and global state provider

**Props**: None
```typescript
interface AppProps {}
```

**Children**: `<Header>`, `<Routes>`, `<Footer>`

---

#### `Header.tsx`
**Purpose**: Top navigation bar with wallet connection and nav menu

**Props**:
```typescript
interface HeaderProps {
  currentRoute?: string;
}
```

**State**: Current page, wallet connected, user address

**Children**: `<Logo>`, `<Navigation>`, `<WalletConnect>`

---

#### `Navigation.tsx`
**Purpose**: Route navigation menu

**Props**:
```typescript
interface NavigationProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}
```

**Routes**:
- Dashboard (`/`)
- Create Stream (`/create`)
- DAO (`/dao`)
- Analytics (`/analytics`)
- Docs (`/docs`)

---

### Dashboard Components

#### `StreamDashboard.tsx`
**Purpose**: Main user dashboard showing all streams, balances, and quick actions

**Props**:
```typescript
interface StreamDashboardProps {
  userAddress?: string;
}
```

**State**: Active streams, filter state, loading state

**Children**: `<StreamFilters>`, `<StreamList>`, `<SummaryMetrics>`

**Integration**: Calls `getStreamsForUser()`, watches contract events

---

#### `StreamCard.tsx`
**Purpose**: Individual stream card showing key metrics and quick actions

**Props**:
```typescript
interface StreamCardProps {
  stream: {
    id: number;
    payer: string;
    recipient: string;
    totalAmount: bigint;
    withdrawn: bigint;
    startBlock: number;
    endBlock: number;
    ratePerBlock: bigint;
    status: 'active' | 'paused' | 'completed' | 'cancelled';
  };
  userRole: 'payer' | 'recipient' | 'observer';
  onWithdraw?: (amount: bigint) => Promise<void>;
  onPause?: () => Promise<void>;
  onCancel?: () => Promise<void>;
}
```

**Displays**:
- Recipient/Payer address
- Current balance accrued
- Amount withdrawn
- Progress bar
- Action buttons (contextual)

---

#### `StreamList.tsx`
**Purpose**: Paginated list view of user's streams

**Props**:
```typescript
interface StreamListProps {
  streams: Stream[];
  userRole: 'payer' | 'recipient';
  isLoading: boolean;
  onLoadMore: () => Promise<void>;
  onSelectStream: (streamId: number) => void;
}
```

**Features**:
- Infinite scroll pagination
- Sort by: amount, date created, status
- Filter buttons in companion component

---

#### `StreamFilters.tsx`
**Purpose**: Filter controls for stream list

**Props**:
```typescript
interface StreamFiltersProps {
  onFilterChange: (filters: {
    status?: string[];
    role?: 'payer' | 'recipient';
    sortBy?: string;
  }) => void;
}
```

**Filters**:
- Status: Active, Paused, Completed, Cancelled
- Role: Show as Payer, Show as Recipient
- Sort: Recent, Amount (High to Low), Duration

---

#### `SummaryMetrics.tsx`
**Purpose**: Display aggregate statistics for user's streams

**Props**:
```typescript
interface SummaryMetricsProps {
  userAddress: string;
}
```

**Metrics Displayed**:
- Total streams created
- Total sBTC streamed (lifetime)
- Total sBTC withdrawn
- Active streaming volume (per block)
- Pending balance across all streams

---

### Stream Creation Components

#### `StreamCreator.tsx`
**Purpose**: Multi-step form for creating new payment stream

**Props**:
```typescript
interface StreamCreatorProps {
  onStreamCreated?: (streamId: number) => void;
  onError?: (error: Error) => void;
}
```

**State**: Form step, form data, validation errors, tx status

**Children**: `<RecipientInput>`, `<AmountInput>`, `<DurationInput>`, `<StreamPreview>`, `<ConfirmButton>`

**Validation**:
- Recipient address valid
- Amount > 0 and <= max
- Duration > 0 blocks
- Payer has sufficient balance

---

#### `RecipientInput.tsx`
**Purpose**: Input field for stream recipient address with validation

**Props**:
```typescript
interface RecipientInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidate: (valid: boolean) => void;
  error?: string;
}
```

**Features**:
- Address validation
- Address book lookup (future)
- ENS resolution (if applicable)

---

#### `AmountInput.tsx`
**Purpose**: Input for sBTC amount with BTC conversion display

**Props**:
```typescript
interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  maxAmount: bigint;
  error?: string;
  onValidate: (valid: boolean) => void;
}
```

**Features**:
- Satoshi input
- BTC conversion display
- Max button
- Balance check warning

---

#### `DurationInput.tsx`
**Purpose**: Select stream duration in blocks or days

**Props**:
```typescript
interface DurationInputProps {
  value: number;
  onChange: (value: number) => void;
  unit: 'blocks' | 'days';
  onUnitChange: (unit: 'blocks' | 'days') => void;
  error?: string;
}
```

**Features**:
- Toggle between blocks and days
- Block height reference display
- Suggested durations

---

#### `StreamPreview.tsx`
**Purpose**: Review calculated stream parameters before submission

**Props**:
```typescript
interface StreamPreviewProps {
  recipient: string;
  totalAmount: bigint;
  durationBlocks: number;
  ratePerBlock: bigint;
  escrowModel: 'hold' | 'return' | 'burn';
}
```

**Displays**:
- All stream parameters
- Calculated rate per block
- Estimated monthly payout
- Escrow model explanation
- Protocol fee

---

### DAO Components

#### `ProposalList.tsx`
**Purpose**: Display all open and past governance proposals

**Props**:
```typescript
interface ProposalListProps {
  userAddress?: string;
  filterStatus?: 'open' | 'passed' | 'rejected' | 'executed';
}
```

**Children**: `<ProposalCard>` (repeated)

**Features**:
- Filter by status
- Sort by: voting time remaining, vote ratio
- Search by title

---

#### `ProposalCard.tsx`
**Purpose**: Compact proposal summary card

**Props**:
```typescript
interface ProposalCardProps {
  proposal: {
    id: number;
    title: string;
    proposer: string;
    status: string;
    votesFor: bigint;
    votesAgainst: bigint;
    endBlock: number;
  };
  userVote?: { amount: bigint; direction: boolean };
  onVote?: (direction: boolean, amount: bigint) => Promise<void>;
  onViewDetails: (proposalId: number) => void;
}
```

**Displays**:
- Proposal title and type
- Current vote ratios (bar chart)
- Voting time remaining
- User's vote (if cast)

---

#### `ProposalDetail.tsx`
**Purpose**: Full proposal details with voting interface

**Props**:
```typescript
interface ProposalDetailProps {
  proposalId: number;
  userAddress?: string;
}
```

**Sections**:
- Full proposal text
- Vote breakdown chart
- Time remaining
- Voting input (if open)
- Discussion/comments (if enabled)

**Children**: `<VotingBar>`, `<VoteButton>`, `<VoteChart>`

---

#### `VotingBar.tsx`
**Purpose**: Visual representation of vote distribution

**Props**:
```typescript
interface VotingBarProps {
  votesFor: bigint;
  votesAgainst: bigint;
  totalVoters?: number;
}
```

**Displays**:
- Horizontal bar showing ratio
- Percentage labels
- Vote counts

---

#### `VoteButton.tsx`
**Purpose**: Button to cast or modify vote

**Props**:
```typescript
interface VoteButtonProps {
  proposalId: number;
  userBalance: bigint;
  direction: boolean; // true = for, false = against
  onVote: (amount: bigint) => Promise<void>;
  isLoading?: boolean;
}
```

**Features**:
- Amount slider or input
- Confirmation modal
- Loading state

---

#### `TokenBalance.tsx`
**Purpose**: Display user's VESPER token balance

**Props**:
```typescript
interface TokenBalanceProps {
  userAddress: string;
  lockedTokens?: bigint;
}
```

**Displays**:
- Available balance
- Locked in votes
- Voting power

---

### Analytics Components

#### `StreamMetrics.tsx`
**Purpose**: Dashboard of streaming protocol statistics

**Props**:
```typescript
interface StreamMetricsProps {
  timeRange?: 'day' | 'week' | 'month' | 'all';
}
```

**Metrics**:
- Total streams created
- Active streaming volume (sBTC/block)
- Total value streamed (lifetime)
- Average stream duration
- Successful completion rate

---

#### `Chart.tsx`
**Purpose**: Reusable chart component for metrics visualization

**Props**:
```typescript
interface ChartProps {
  type: 'line' | 'bar' | 'pie';
  data: ChartDataset[];
  title: string;
  xAxis?: string;
  yAxis?: string;
}
```

**Uses**: Chart.js or Recharts library

---

#### `ExportData.tsx`
**Purpose**: Allow users to export their stream history

**Props**:
```typescript
interface ExportDataProps {
  userAddress: string;
  format?: 'csv' | 'json' | 'pdf';
}
```

**Exports**:
- Stream history
- Transaction logs
- Voting history
- Analytics summary

---

### Utility Components

#### `WalletConnect.tsx`
**Purpose**: Authentication and wallet connection flow

**Props**:
```typescript
interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}
```

**Features**:
- Connect via Hiro Wallet
- Display connected address
- Disconnect option
- Network indicator

---

#### `LoadingSpinner.tsx`
**Purpose**: Loading indicator for async operations

**Props**:
```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}
```

---

#### `ErrorBoundary.tsx`
**Purpose**: Catch and display component errors gracefully

**Props**:
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

---

## Shared Props Patterns

### Transaction Confirmation Modal
```typescript
interface TxConfirmModalProps {
  title: string;
  description: string;
  actionLabel: string;
  isLoading: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  txHash?: string;
  error?: Error;
}
```

### Amount Input Components
```typescript
interface AmountProps {
  value: bigint;
  decimals: number; // 8 for sBTC
  symbol: string;
  onChange: (value: bigint) => void;
}
```

---

## State Management

- **Global**: Wallet connection, network, dark mode toggle
- **Page-level**: Filters, sort, pagination state
- **Component-level**: Form inputs, modals, loading states

Use Zustand for global state and React Query for server state (contract data).

---

## Styling Guide

- Framework: Tailwind CSS
- Dark mode via Tailwind dark: toggle
- Color scheme: Bitcoin orange accent (`#F7931A`)
- Responsive breakpoints: Mobile-first
- Animations: Subtle transitions on interactions

---

## Integration Points

All data-fetching components integrate with:
- `@stacks/connect` for wallet authentication
- `@stacks/transactions` for building/signing txs
- `@stacks/network` for network selection
- Contract ABI generation via clarinet
- Event listeners via WebSocket (if available)
