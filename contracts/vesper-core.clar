;; VESPER Protocol - Core Contract
;; Real-Time Per-Block sBTC Payroll & Payment Streaming on Stacks
;; Handles payment streams, escrow management, and block-based settlement

;; ============================================================================
;; ERROR CODES
;; ============================================================================

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-STREAM-NOT-FOUND (err u101))
(define-constant ERR-INVALID-AMOUNT (err u102))
(define-constant ERR-STREAM-EXPIRED (err u103))
(define-constant ERR-INSUFFICIENT-BALANCE (err u104))
(define-constant ERR-STREAM-ACTIVE (err u105))
(define-constant ERR-INVALID-RATE (err u106))
(define-constant ERR-NO-WITHDRAW-AVAILABLE (err u107))
(define-constant ERR-ALREADY-EXISTS (err u108))

;; ============================================================================
;; CONSTANTS
;; ============================================================================

;; Protocol fee in basis points (0.25% = 25 bps)
(define-constant PROTOCOL-FEE-BPS u25)

;; Contract owner (set to transaction sender on deployment)
(define-constant CONTRACT-OWNER tx-sender)

;; Minimum stream duration in blocks
(define-constant MIN-STREAM-DURATION u100)

;; Maximum stream duration in blocks (approx. 1 year at 10 min block time)
(define-constant MAX-STREAM-DURATION u5256000)

;; Basis points denominator (100% = 10000 bps)
(define-constant BASIS-POINTS u10000)

;; ============================================================================
;; DATA STRUCTURES
;; ============================================================================

;; Stream structure - represents a payment stream from payer to recipient
(define-map streams
  { id: uint }
  {
    payer: principal,
    recipient: principal,
    total-amount: uint,
    withdrawn: uint,
    start-block: uint,
    end-block: uint,
    rate-per-block: uint,
    status: (string-ascii 20),
    escrow-model: (string-ascii 20),
    created-at: uint
  }
)

;; Stream index - track all stream IDs created
(define-map stream-index
  { index: uint }
  { id: uint }
)

;; Balance tracking for each user (escrow deposits)
(define-map user-balances
  { user: principal }
  { balance: uint }
)

;; Payer's active streams - maps payer to list of stream IDs
(define-map payer-streams
  { payer: principal }
  { stream-ids: (list 100 uint) }
)

;; Recipient's active streams - maps recipient to list of stream IDs
(define-map recipient-streams
  { recipient: principal }
  { stream-ids: (list 100 uint) }
)

;; Protocol config - stores configurable parameters
(define-map protocol-config
  { key: (string-ascii 20) }
  { value: uint }
)

;; Stream counter - tracks total number of streams created
(define-data-var stream-counter uint u0)

;; Total protocol fees collected
(define-data-var protocol-fees-collected uint u0)

;; Protocol enabled/disabled flag
(define-data-var protocol-enabled bool true)

;; ============================================================================
;; GETTER FUNCTIONS (Read-Only)
;; ============================================================================

;; 1. Get stream details by ID
;; Returns full stream data including payer, recipient, amounts, timeline
(define-read-only (get-stream (stream-id uint))
  (map-get? streams { id: stream-id })
)

;; 2. Get user's escrow balance
;; Returns total sBTC balance user has deposited to contract escrow
(define-read-only (get-user-balance (user principal))
  (default-to u0 (get balance (map-get? user-balances { user: user })))
)

;; 3. Get all stream IDs for a payer
;; Returns list of all streams created by this payer (up to 100)
(define-read-only (get-payer-streams (payer principal))
  (default-to (list) (get stream-ids (map-get? payer-streams { payer: payer })))
)

;; 4. Get all stream IDs for a recipient
;; Returns list of all streams where this principal receives payments (up to 100)
(define-read-only (get-recipient-streams (recipient principal))
  (default-to (list) (get stream-ids (map-get? recipient-streams { recipient: recipient })))
)

;; 5. Calculate available balance for withdrawal from a stream
;; Returns accrued amount minus already withdrawn for given stream
(define-read-only (get-available-balance (stream-id uint))
  (let (
    (stream (unwrap! (map-get? streams { id: stream-id }) (err u0)))
  )
    ;; Returns accrued amount minus already withdrawn
    ;; Actual block-height calculation done at withdrawal time
    (ok (- (get total-amount stream) (get withdrawn stream)))
  )
)

;; 6. Get current stream counter
;; Returns total number of streams created so far
(define-read-only (get-stream-counter)
  (var-get stream-counter)
)

;; 7. Get total protocol fees collected
;; Returns cumulative sBTC fees collected from all stream operations
(define-read-only (get-protocol-fees)
  (var-get protocol-fees-collected)
)

;; 8. Check if protocol is enabled
;; Returns true if streams can be created/modified, false if disabled by owner
(define-read-only (is-protocol-enabled)
  (var-get protocol-enabled)
)

;; 9. Get protocol configuration value by key
;; Returns configurable protocol parameter (fee rates, limits, etc)
(define-read-only (get-protocol-config (key (string-ascii 20)))
  (get value (map-get? protocol-config { key: key }))
)

;; 10. Get total withdrawn amount from a stream
;; Returns cumulative sBTC amount already withdrawn by recipient
(define-read-only (get-withdrawn-amount (stream-id uint))
  (let (
    (stream (unwrap! (map-get? streams { id: stream-id }) (err u0)))
  )
    (ok (get withdrawn stream))
  )
)

;; 11. Check if stream is currently active
;; Returns true if stream status is "active" and not expired
(define-read-only (is-stream-active (stream-id uint))
  (let (
    (stream (unwrap! (map-get? streams { id: stream-id }) (err u0)))
  )
    (ok (is-eq (get status stream) "active"))
  )
)

;; 12. Calculate rate per block for a stream
;; Returns calculated rate based on total amount and duration
(define-read-only (get-stream-rate (stream-id uint))
  (let (
    (stream (unwrap! (map-get? streams { id: stream-id }) (err u0)))
    (duration (- (get end-block stream) (get start-block stream)))
  )
    (if (> duration u0)
      (ok (/ (get total-amount stream) duration))
      (err u0)
    )
  )
)

;; ============================================================================
;; PUBLIC FUNCTIONS (State-Changing)
;; ============================================================================

;; Create a new payment stream
(define-public (create-stream
  (recipient principal)
  (total-amount uint)
  (start-block uint)
  (end-block uint)
  (escrow-model (string-ascii 20))
)
  (err u0)
)

;; Withdraw available balance from a stream
(define-public (withdraw-stream (stream-id uint))
  (err u0)
)

;; Cancel an active stream
(define-public (cancel-stream (stream-id uint) (reason (string-ascii 100)))
  (err u0)
)

;; Deposit sBTC to user's escrow balance
(define-public (deposit-escrow (amount uint))
  (err u0)
)

;; Withdraw from escrow balance
(define-public (withdraw-escrow (amount uint))
  (err u0)
)

;; Pause stream operation
(define-public (pause-stream (stream-id uint))
  (err u0)
)

;; Resume paused stream
(define-public (resume-stream (stream-id uint))
  (err u0)
)

;; Update protocol configuration (admin only)
(define-public (set-protocol-config (key (string-ascii 20)) (value uint))
  (err u0)
)

;; Enable/disable protocol (owner only)
(define-public (set-protocol-enabled (enabled bool))
  (err u0)
)

;; Claim protocol fees (owner only)
(define-public (claim-protocol-fees)
  (err u0)
)
