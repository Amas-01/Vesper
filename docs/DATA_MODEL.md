# Vesper Protocol Data Model

## Core Data Structures

### Stream (in vesper-core)

Represents a single payment stream with all metadata and state.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `uint` | Unique stream identifier (auto-increment) |
| `payer` | `principal` | Address initiating the stream |
| `recipient` | `principal` | Address receiving stream payments |
| `total-amount` | `uint` | Total sBTC to be streamed (in satoshis) |
| `withdrawn` | `uint` | Amount already withdrawn by recipient |
| `start-block` | `uint` | Block height when stream started |
| `end-block` | `uint` | Block height when stream ends |
| `rate-per-block` | `uint` | sBTC payout per block (satoshis) |
| `status` | `(buff 32)` | Status: "active", "paused", "completed", "cancelled" |
| `escrow-model` | `(buff 32)` | Escrow behavior: "hold", "return", "burn" |
| `created-at` | `uint` | Block height at creation |

**Storage Map**: `streams` - Maps stream ID to Stream struct

**Index Maps**:
- `user-streams` - Maps (payer, recipient, role) to list of stream IDs
- `active-streams` - Lists all currently active stream IDs


### Proposal (in vesper-dao)

Represents a governance proposal.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `uint` | Unique proposal identifier |
| `proposer` | `principal` | Address submitting proposal |
| `title` | `(buff 256)` | Proposal title |
| `description` | `(buff 1024)` | Proposal description |
| `proposal-type` | `(buff 32)` | Type: "parameter", "upgrade", "treasury" |
| `status` | `(buff 32)` | Status: "open", "passed", "rejected", "executed" |
| `votes-for` | `uint` | Total votes in favor |
| `votes-against` | `uint` | Total votes opposed |
| `start-block` | `uint` | Block when voting begins |
| `end-block` | `uint` | Block when voting ends |
| `created-at` | `uint` | Block height at creation |

**Storage Map**: `proposals` - Maps proposal ID to Proposal struct

**Index Maps**:
- `proposal-votes` - Maps (proposal-id, voter) to vote amount


### DAO State (in vesper-dao)

| Variable | Type | Description |
|----------|------|-------------|
| `token-supply` | `uint` | Total VESPER tokens issued |
| `proposal-count` | `uint` | Counter for next proposal ID |
| `stream-count` | `uint` | Counter for next stream ID |

**Governance Maps**:
- `balances` - Maps principal to token balance
- `allowances` - Maps (owner, spender) to allowance

**Parameters** (updated via proposals):
- `protocol-fee` - Percentage fee on stream creation
- `max-stream-deposit` - Maximum single stream amount
- `voting-period` - Blocks available for voting
- `min-proposal-deposit` - Min VESPER to create proposal


## Clarity Map Structures

### vesper-core.clar

```clarity
(define-map streams
  { stream-id: uint }
  {
    payer: principal,
    recipient: principal,
    total-amount: uint,
    withdrawn: uint,
    start-block: uint,
    end-block: uint,
    rate-per-block: uint,
    status: (buff 32),
    escrow-model: (buff 32),
    created-at: uint
  }
)

(define-map user-streams
  { user: principal, role: (buff 32) }
  (list 100 uint)
)

(define-var stream-count uint u0)
```

### vesper-dao.clar

```clarity
(define-map balances
  { owner: principal }
  { balance: uint }
)

(define-map proposals
  { proposal-id: uint }
  {
    proposer: principal,
    title: (buff 256),
    status: (buff 32),
    votes-for: uint,
    votes-against: uint,
    end-block: uint
  }
)

(define-map proposal-votes
  { proposal-id: uint, voter: principal }
  { vote-amount: uint }
)

(define-var proposal-count uint u0)
(define-var protocol-fee uint u250)  ;; 2.5% in basis points
```

## Access Patterns

| Operation | Primary Index | Complexity |
|-----------|---------------|------------|
| Get stream by ID | `streams` map | O(1) |
| List user's streams (payer role) | `user-streams`, role="payer" | O(n) where n=user streams |
| Get active streams | `active-streams` map | O(1) lookup, O(n) iterate |
| Check proposal status | `proposals` map | O(1) |
| Get user's vote on proposal | `proposal-votes` | O(1) |
| Calculate withdrawal amount | Stream data + block height | O(1) |

## Type Definitions

### Custom Types

```clarity
;; Stream status
(define-data-var stream-status (buff 32))
;; Values: "active" | "paused" | "completed" | "cancelled"

;; Escrow models - determines what happens to remaining funds
(define-data-var escrow-model (buff 32))
;; Values: "hold" | "return" | "burn"

;; Proposal types
(define-data-var proposal-type (buff 32))
;; Values: "parameter" | "upgrade" | "treasury" | "emergency"
```

## Time-based Calculations

### Block-based Time
- 1 Stacks block ≈ 10 minutes
- Stream duration calculated relative to block height
- All timestamps use block height (not Unix time)

### Stream Math

**Accrued Amount at Block N:**
```
accrued = rate-per-block × (N - start-block)
accrued = min(accrued, total-amount)
```

**Available for Withdrawal at Block N:**
```
available = accrued - withdrawn
```

**Stream Completion:**
```
complete when block-height >= end-block
or withdrawn ≥ total-amount
```

---

**Data Consistency Notes:**
- All financial amounts in satoshis (smallest unit)
- Principal addresses validated at contract entry points
- All state mutations emit events
- Maps use composite keys where needed to avoid collisions
