# 📝 Vesper Protocol Smart Contracts

Complete reference of all planned Clarity contracts, including function signatures and descriptions.

## 🗽️ Contract Manifest

| Contract | Scope | Purpose |
|----------|-------|---------|
| `vesper-core.clar` | Core streaming logic | Per-block payment streaming and withdrawal |
| `vesper-dao.clar` | Governance | DAO token, proposals, and parameter management |
| `vesper-registry.clar` | Stream management | Stream enumeration and batch operations |

---

## 1. 🎁 vesper-core.clar

Core streaming contract managing all stream creation, withdrawal, and state transitions.

### 🔍 Read-Only Functions

#### get-stream
- **Parameters**: `stream-id: uint`
- **Returns**: `(response {stream} {code})`
- **Description**: Retrieve full stream details including accrued and withdrawn amounts

#### get-stream-balance
- **Parameters**: `stream-id: uint, block-height: uint`
- **Returns**: `(response uint {code})`
- **Description**: Calculate maximum amount recipient can withdraw at given block height

#### get-accrued-amount
- **Parameters**: `stream-id: uint, block-height: uint`
- **Returns**: `(response uint {code})`
- **Description**: Total sBTC accrued since stream start (capped at total-amount)

#### get-user-streams
- **Parameters**: `user: principal, role: (buff 32)`
- **Returns**: `(response (list 100 uint) {code})`
- **Description**: Get all stream IDs where user is payer or recipient (role: "payer" | "recipient")

#### get-stream-status
- **Parameters**: `stream-id: uint`
- **Returns**: `(response (buff 32) {code})`
- **Description**: Return current status ("active", "paused", "completed", "cancelled")

#### stream-exists
- **Parameters**: `stream-id: uint`
- **Returns**: `(response bool {code})`
- **Description**: Check if stream with given ID exists

#### get-total-streams
- **Parameters**: None
- **Returns**: `(response uint {code})`
- **Description**: Return total number of streams created

### ✨ Public Functions

#### create-stream
- **Parameters**:
  - `recipient: principal` - Address receiving payments
  - `total-amount: uint` - Total sBTC in satoshis
  - `duration-blocks: uint` - Number of blocks stream runs
  - `rate-per-block: uint` - sBTC to pay per block
  - `escrow-model: (buff 32)` - "hold", "return", or "burn"
- **Side Effects**:
  - Transfers sBTC from payer to contract escrow
  - Creates new stream entry
  - Emits stream-created event
- **Returns**: `(response uint {code})`
- **Description**: Initiate new payment stream with specified parameters. Caller must be payer.

#### withdraw
- **Parameters**: `stream-id: uint, amount: uint`
- **Side Effects**:
  - Records withdrawal in stream state
  - Transfers sBTC to recipient
  - Emits withdrawal event
- **Returns**: `(response uint {code})`
- **Description**: Withdraw accrued amount from active stream. Caller must be recipient.

#### pause-stream
- **Parameters**: `stream-id: uint`
- **Side Effects**:
  - Sets stream status to "paused"
  - Freezes accrual at current block
  - Emits stream-paused event
- **Returns**: `(response bool {code})`
- **Description**: Pause active stream. Only payer can pause their stream.

#### resume-stream
- **Parameters**: `stream-id: uint`
- **Side Effects**:
  - Sets stream status back to "active"
  - Updates start-block for resumed period
  - Emits stream-resumed event
- **Returns**: `(response bool {code})`
- **Description**: Resume paused stream. Only original payer can resume.

#### cancel-stream
- **Parameters**: `stream-id: uint`
- **Side Effects**:
  - Sets stream status to "cancelled"
  - Executes escrow-model logic (hold/return/burn)
  - Emits stream-cancelled event
- **Returns**: `(response bool {code})`
- **Description**: Cancel active or paused stream. Only payer can cancel.

#### update-rate
- **Parameters**:
  - `stream-id: uint`
  - `new-rate-per-block: uint`
- **Side Effects**:
  - Updates rate-per-block
  - Emits rate-updated event
- **Returns**: `(response bool {code})`
- **Description**: Adjust payment rate for future blocks. Only payer can update.

---

## 2. 🗳️ vesper-dao.clar

DAO governance contract for VESPER token and protocol parameter management.

### 🔍 Read-Only Functions

#### get-balance
- **Parameters**: `account: principal`
- **Returns**: `(response uint {code})`
- **Description**: Get VESPER token balance for account

#### get-total-supply
- **Parameters**: None
- **Returns**: `(response uint {code})`
- **Description**: Return total VESPER tokens in circulation

#### get-proposal
- **Parameters**: `proposal-id: uint`
- **Returns**: `(response {proposal} {code})`
- **Description**: Retrieve full proposal details and vote counts

#### get-vote
- **Parameters**: `proposal-id: uint, voter: principal`
- **Returns**: `(response uint {code})`
- **Description**: Get number of tokens voter used on proposal

#### get-parameter
- **Parameters**: `param-name: (buff 32)`
- **Returns**: `(response uint {code})`
- **Description**: Retrieve current protocol parameter value

#### proposal-exists
- **Parameters**: `proposal-id: uint`
- **Returns**: `(response bool {code})`
- **Description**: Check if proposal with ID exists

#### is-voting-open
- **Parameters**: `proposal-id: uint`
- **Returns**: `(response bool {code})`
- **Description**: Check if proposal voting window is still open

### ✨ Public Functions

#### transfer
- **Parameters**:
  - `recipient: principal`
  - `amount: uint`
- **Side Effects**:
  - Deducts from sender's balance
  - Adds to recipient's balance
  - Emits transfer event
- **Returns**: `(response bool {code})`
- **Description**: Transfer VESPER tokens between accounts

#### create-proposal
- **Parameters**:
  - `title: (buff 256)`
  - `description: (buff 1024)`
  - `proposal-type: (buff 32)` - "parameter", "upgrade", "treasury", "emergency"
  - `voting-period-blocks: uint`
  - `initial-deposit: uint` - DAO tokens locked as proposal bond
- **Side Effects**:
  - Locks proposer's tokens until vote ends or proposal executed
  - Creates new proposal entry
  - Emits proposal-created event
- **Returns**: `(response uint {code})`
- **Description**: Submit new proposal for community voting. Requires minimum token balance.

#### vote-on-proposal
- **Parameters**:
  - `proposal-id: uint`
  - `vote-amount: uint` - Number of tokens to vote with
  - `vote-direction: bool` - true=for, false=against
- **Side Effects**:
  - Locks voter's tokens until voting ends
  - Records vote in proposal-votes map
  - Updates votes-for or votes-against counter
  - Emits vote-cast event
- **Returns**: `(response bool {code})`
- **Description**: Cast vote on open proposal using locked tokens

#### execute-proposal
- **Parameters**: `proposal-id: uint`
- **Side Effects**:
  - Checks proposal passed (votes-for > votes-against)
  - Updates specified protocol parameter
  - Sets proposal status to "executed"
  - Emits proposal-executed event
- **Returns**: `(response bool {code})`
- **Description**: Execute passed proposal and update protocol parameters. Only after voting ends.

#### emergency-pause
- **Parameters**: None
- **Side Effects**:
  - Sets emergency-pause flag on core contract (via trait call)
  - Halts all new streams
  - Emits emergency-pause event
- **Returns**: `(response bool {code})`
- **Description**: Emergency pause all protocol activity. Requires super-majority vote or core team.

---

## 3. 📳 vesper-registry.clar

Stream registry and batch operation contract for efficient stream management and enumeration.

### 🔍 Read-Only Functions

#### get-stream-count-for-user
- **Parameters**: `user: principal, role: (buff 32)`
- **Returns**: `(response uint {code})`
- **Description**: Count number of streams where user is payer or recipient

#### get-active-streams
- **Parameters**: None
- **Returns**: `(response (list 1000 uint) {code})`
- **Description**: Return list of all currently active stream IDs (paginated)

#### get-completed-streams
- **Parameters**: `limit: uint, offset: uint`
- **Returns**: `(response (list 100 uint) {code})`
- **Description**: Return paginated list of completed streams

#### search-streams
- **Parameters**:
  - `payer: (optional principal)`
  - `recipient: (optional principal)`
  - `status: (optional (buff 32))`
- **Returns**: `(response (list 100 uint) {code})`
- **Description**: Search for streams matching optional filter criteria

### ✨ Public Functions

#### batch-create-streams
- **Parameters**: `stream-specs: (list 10 {recipient: principal, amount: uint, duration: uint})`
- **Side Effects**:
  - Creates multiple streams atomically
  - All succeed or all fail (atomic transaction)
  - Transfers total sBTC in single operation
  - Emits multiple stream-created events
- **Returns**: `(response (list 10 uint) {code})`
- **Description**: Create up to 10 payment streams in single transaction (payroll batching)

#### batch-withdraw
- **Parameters**: `stream-ids: (list 10 uint), amounts: (list 10 uint)`
- **Side Effects**:
  - Withdraws specified amounts from listed streams
  - Recipient must own all streams or transaction fails
  - Transfers all amounts in one operation
  - Emits withdrawal events
- **Returns**: `(response bool {code})`
- **Description**: Withdraw from multiple streams in single transaction

#### archive-stream
- **Parameters**: `stream-id: uint`
- **Side Effects**:
  - Moves completed stream to archive
  - Removes from active index
  - Emits stream-archived event
- **Returns**: `(response bool {code})`
- **Description**: Archive old stream to improve lookup performance

---

## 📢 Event Emissions

All contracts emit events for indexing and frontend updates. Examples:

```clarity
;; vesper-core events
- stream-created {id, payer, recipient, amount, duration}
- stream-withdrawn {id, recipient, amount, new-total-withdrawn}
- stream-paused {id, payer, pause-block}
- stream-resumed {id, payer, resume-block}
- stream-cancelled {id, payer, reason}
- rate-updated {id, old-rate, new-rate}

;; vesper-dao events
- transfer {from, to, amount}
- proposal-created {id, proposer, title}
- vote-cast {proposal-id, voter, amount, direction}
- proposal-executed {id, parameter-updated}
- emergency-pause {timestamp}

;; vesper-registry events
- batch-created {stream-ids}
- batch-withdrawn {stream-ids, amounts}
- stream-archived {stream-id}
```

---

## Development Notes

- All functions validate inputs and emit errors using standard error codes
- Maps use composite keys to prevent collisions
- Escrow model determines behavior on stream cancellation
- DAO votes are time-locked (tokens freed after voting period)
- Future upgrades may include cross-chain swaps and NFT receipts
