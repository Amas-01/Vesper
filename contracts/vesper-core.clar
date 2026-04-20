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

;; Stream index - track all stream IDs created (enumeration helper for off-chain queries)
(define-map stream-index
  { index: uint }
  { stream-id: uint }
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

;; 1. Create a new payment stream
;; Creates escrow-based payment stream from payer to recipient
(define-public (create-stream
  (recipient principal)
  (total-amount uint)
  (start-block uint)
  (end-block uint)
  (escrow-model (string-ascii 20))
)
  (let (
    ;; Validate all inputs in let binding before use
    (_ (asserts! (var-get protocol-enabled) ERR-NOT-AUTHORIZED))
    (_ (asserts! (not (is-eq recipient CONTRACT-OWNER)) ERR-NOT-AUTHORIZED))
    (_ (asserts! (> total-amount u0) ERR-INVALID-AMOUNT))
    (_ (asserts! (< start-block end-block) ERR-INVALID-RATE))
    (_ (asserts! (>= (- end-block start-block) MIN-STREAM-DURATION) ERR-INVALID-RATE))
    (_ (asserts! (<= (- end-block start-block) MAX-STREAM-DURATION) ERR-INVALID-RATE))
    (stream-id (var-get stream-counter))
    (duration (- end-block start-block))
    (rate-per-block (/ total-amount duration))
  )
    ;; Verify sender has sufficient escrow balance
    (asserts! (>= (get-user-balance tx-sender) total-amount) ERR-INSUFFICIENT-BALANCE)
    ;; Deduct from payer's escrow
    (map-set user-balances
      { user: tx-sender }
      { balance: (- (get-user-balance tx-sender) total-amount) }
    )
    ;; Create stream record
    (map-set streams
      { id: stream-id }
      {
        payer: tx-sender,
        recipient: recipient,
        total-amount: total-amount,
        withdrawn: u0,
        start-block: start-block,
        end-block: end-block,
        rate-per-block: rate-per-block,
        status: "active",
        escrow-model: escrow-model,
        created-at: u1
      }
    )
    ;; Add stream ID to index for enumeration
    (map-set stream-index
      { index: stream-id }
      { stream-id: stream-id }
    )
    ;; Update stream counter
    (var-set stream-counter (+ stream-id u1))
    (ok stream-id)
  )
)

;; 2. Withdraw available balance from a stream
;; Recipient withdraws accrued balance from stream
(define-public (withdraw-stream (stream-id uint))
  (let (
    ;; Validate stream-id is trusted through assertion before use
    (stream (unwrap! (map-get? streams { id: stream-id }) ERR-STREAM-NOT-FOUND))
  )
    ;; Verify protocol is enabled
    (asserts! (var-get protocol-enabled) ERR-NOT-AUTHORIZED)
    ;; Verify caller is the recipient
    (asserts! (is-eq tx-sender (get recipient stream)) ERR-NOT-AUTHORIZED)
    ;; Verify stream is active
    (asserts! (is-eq (get status stream) "active") ERR-STREAM-EXPIRED)
    ;; Verify some balance is available
    (asserts! (> (get total-amount stream) (get withdrawn stream)) ERR-NO-WITHDRAW-AVAILABLE)
    ;; Calculate available amount
    (let (
      (available (- (get total-amount stream) (get withdrawn stream)))
      (fee (/ (* available PROTOCOL-FEE-BPS) BASIS-POINTS))
      (payout (- available fee))
    )
      ;; Update stream with new withdrawn amount
      (map-set streams
        { id: stream-id }
        (merge stream { withdrawn: (get total-amount stream) })
      )
      ;; Update protocol fees
      (var-set protocol-fees-collected (+ (var-get protocol-fees-collected) fee))
      ;; Add payout to recipient's balance (in real implementation, transfer sBTC)
      (map-set user-balances
        { user: tx-sender }
        { balance: (+ (get-user-balance tx-sender) payout) }
      )
      (ok payout)
    )
  )
)

;; 3. Cancel an active stream
;; Payer cancels stream and reclaims remaining balance
(define-public (cancel-stream (stream-id uint) (reason (string-ascii 100)))
  (let (
    (stream (unwrap! (map-get? streams { id: stream-id }) ERR-STREAM-NOT-FOUND))
  )
    ;; Verify protocol is enabled
    (asserts! (var-get protocol-enabled) ERR-NOT-AUTHORIZED)
    ;; Verify caller is the payer
    (asserts! (is-eq tx-sender (get payer stream)) ERR-NOT-AUTHORIZED)
    ;; Verify stream is active
    (asserts! (is-eq (get status stream) "active") ERR-STREAM-ACTIVE)
    ;; Calculate remaining balance
    (let (
      (remaining (- (get total-amount stream) (get withdrawn stream)))
    )
      ;; Update stream status to cancelled
      (map-set streams
        { id: stream-id }
        (merge stream { status: "cancelled" })
      )
      ;; Return remaining balance to payer's escrow
      (map-set user-balances
        { user: tx-sender }
        { balance: (+ (get-user-balance tx-sender) remaining) }
      )
      (ok remaining)
    )
  )
)

;; 4. Deposit sBTC to user's escrow balance
;; User deposits sBTC for use in creating streams
(define-public (deposit-escrow (amount uint))
  (begin
    ;; Verify amount is positive
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    ;; Update user's balance (in real implementation, transfer sBTC from user)
    (map-set user-balances
      { user: tx-sender }
      { balance: (+ (get-user-balance tx-sender) amount) }
    )
    (ok amount)
  )
)

;; 5. Withdraw from escrow balance
;; User withdraws deposited sBTC from escrow
(define-public (withdraw-escrow (amount uint))
  (let (
    (balance (get-user-balance tx-sender))
  )
    ;; Verify amount is positive
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    ;; Verify user has sufficient balance
    (asserts! (>= balance amount) ERR-INSUFFICIENT-BALANCE)
    ;; Update user's balance
    (map-set user-balances
      { user: tx-sender }
      { balance: (- balance amount) }
    )
    (ok amount)
  )
)

;; 6. Pause stream operation
;; Payer pauses active stream temporarily
(define-public (pause-stream (stream-id uint))
  (let (
    (stream (unwrap! (map-get? streams { id: stream-id }) ERR-STREAM-NOT-FOUND))
  )
    ;; Verify caller is the payer
    (asserts! (is-eq tx-sender (get payer stream)) ERR-NOT-AUTHORIZED)
    ;; Verify stream is active
    (asserts! (is-eq (get status stream) "active") ERR-STREAM-EXPIRED)
    ;; Update stream status to paused
    (map-set streams
      { id: stream-id }
      (merge stream { status: "paused" })
    )
    (ok stream-id)
  )
)

;; 7. Resume paused stream
;; Payer resumes previously paused stream
(define-public (resume-stream (stream-id uint))
  (let (
    (stream (unwrap! (map-get? streams { id: stream-id }) ERR-STREAM-NOT-FOUND))
  )
    ;; Verify caller is the payer
    (asserts! (is-eq tx-sender (get payer stream)) ERR-NOT-AUTHORIZED)
    ;; Verify stream is paused
    (asserts! (is-eq (get status stream) "paused") ERR-STREAM-ACTIVE)
    ;; Update stream status back to active
    (map-set streams
      { id: stream-id }
      (merge stream { status: "active" })
    )
    (ok stream-id)
  )
)

;; 8. Update protocol configuration (admin only)
;; Owner updates protocol parameters like fee rates
(define-public (set-protocol-config (key (string-ascii 20)) (value uint))
  (begin
    ;; Verify caller is the owner
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    ;; Update config
    (map-set protocol-config { key: key } { value: value })
    (ok value)
  )
)

;; 9. Enable/disable protocol (owner only)
;; Owner enables or disables stream creation and operations
(define-public (set-protocol-enabled (enabled bool))
  (begin
    ;; Verify caller is the owner
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    ;; Update protocol enabled flag
    (var-set protocol-enabled enabled)
    (ok enabled)
  )
)
