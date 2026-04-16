# Vesper Protocol Testing Strategy

Comprehensive testing approach covering contracts, frontend, and integration scenarios.

## Testing Philosophy

- **Unit Tests**: Test individual functions in isolation
- **Integration Tests**: Test interactions between components
- **Testnet Manual**: Real blockchain behavior validation
- **Coverage Target**: 80%+ for critical paths, 60%+ overall

---

## Smart Contract Testing (Clarinet)

### Unit Test Structure

Each contract has a dedicated test file: `tests/<contract-name>.test.ts`

#### Example: vesper-core Unit Tests

```bash
tests/
├── vesper-core.test.ts
│   ├── describe("create-stream")
│   │   ├── it("should create stream with valid parameters")
│   │   ├── it("should reject if payer insufficient balance")
│   │   ├── it("should update stream count")
│   │   └── it("should emit stream-created event")
│   ├── describe("withdraw")
│   │   ├── it("should allow recipient to withdraw accrued amount")
│   │   ├── it("should reject non-recipient withdrawal")
│   │   ├── it("should not exceed total stream amount")
│   │   └── it("should update withdrawn counter")
│   ├── describe("pause-stream")
│   │   ├── it("should pause active stream")
│   │   ├── it("should freeze accrual at pause block")
│   │   └── it("should reject non-payer pause")
│   ├── describe("cancel-stream")
│   │   ├── it("should cancel and return funds via hold model")
│   │   ├── it("should cancel and burn funds via burn model")
│   │   └── it("should update stream status")
│   └── describe("edge cases")
│       ├── it("should handle zero-length streams")
│       ├── it("should handle max uint amounts")
│       └── it("should prevent reentrancy")
├── vesper-dao.test.ts
│   ├── describe("transfer")
│   │   └── ...token transfer tests...
│   ├── describe("create-proposal")
│   │   └── ...proposal creation tests...
│   ├── describe("vote-on-proposal")
│   │   └── ...voting logic tests...
│   └── describe("execute-proposal")
│       └── ...proposal execution tests...
└── vesper-registry.test.ts
    ├── describe("batch-create-streams")
    │   └── ...batch operation tests...
    └── describe("batch-withdraw")
        └── ...bulk withdrawal tests...
```

### Running Contract Tests

```bash
# Run all tests
clarinet test

# Run specific test file
clarinet test tests/vesper-core.test.ts

# Run with coverage
clarinet test --coverage

# Run specific test suite
clarinet test --suit "describe(\"create-stream\")"
```

### Test Coverage Targets

| Contract | Target | Critical Paths |
|----------|--------|-----------------|
| vesper-core | 80% | create-stream, withdraw, cancel-stream |
| vesper-dao | 75% | create-proposal, vote-on-proposal, execute-proposal |
| vesper-registry | 70% | batch-create-streams, batch-withdraw |

### Key Test Scenarios

**Stream Lifecycle**:
1. Create stream with various parameters
2. Withdraw partial amounts over time
3. Calculate accrual correctly at each block
4. Handle pause and resume
5. Complete stream naturally
6. Cancel stream and test escrow models

**DAO Governance**:
1. Create proposal with bond
2. Vote with multiple accounts
3. Check time-lock on votes
4. Execute passed proposal
5. Reject failed proposal
6. Claim locked tokens after vote ends

**Edge Cases**:
- Zero amounts
- Very large amounts (max uint)
- Single block streams
- Very long streams (1000+ blocks)
- Multiple concurrent streams from same pair
- Rapid creation and withdrawal

---

## Frontend Testing (Vitest)

### Test Structure

```bash
tests/
├── unit/
│   ├── components/
│   │   ├── StreamCard.test.tsx
│   │   ├── StreamCreator.test.tsx
│   │   ├── ProposalCard.test.tsx
│   │   └── WalletConnect.test.tsx
│   ├── services/
│   │   ├── stacksService.test.ts
│   │   ├── contractService.test.ts
│   │   └── storageService.test.ts
│   └── utils/
│       ├── amountFormatting.test.ts
│       ├── addressValidation.test.ts
│       └── blockTimeCalculation.test.ts
├── integration/
│   ├── walletConnection.test.tsx
│   ├── streamCreationFlow.test.tsx
│   ├── votingFlow.test.tsx
│   └── withdrawalFlow.test.tsx
└── e2e/
    ├── fullStreamLifecycle.test.tsx
    └── daoGovernance.test.tsx
```

### Running Frontend Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm run test -- StreamCard.test.tsx
```

### Test Coverage Targets

| Category | Target |
|----------|--------|
| Components | 70% |
| Services | 90% |
| Utils | 95% |
| Pages | 60% |

### Example Test: StreamCard Component

```typescript
describe('StreamCard', () => {
  it('should display stream metadata correctly', () => {
    const stream = {
      id: 1,
      payer: 'SP1...',
      recipient: 'SP2...',
      totalAmount: BigInt(100_000_000),
      withdrawn: BigInt(25_000_000),
      startBlock: 100,
      endBlock: 200,
      ratePerBlock: BigInt(1_000_000),
      status: 'active',
    };
    
    const { getByText } = render(
      <StreamCard stream={stream} userRole="recipient" />
    );
    
    expect(getByText(/SP2.../)).toBeInTheDocument();
    expect(getByText('25.0 / 100.0 sBTC')).toBeInTheDocument();
  });

  it('should call onWithdraw when withdraw button clicked', async () => {
    const onWithdraw = vi.fn();
    const { getByText } = render(
      <StreamCard stream={mockStream} userRole="recipient" onWithdraw={onWithdraw} />
    );
    
    fireEvent.click(getByText('Withdraw'));
    await waitFor(() => {
      expect(onWithdraw).toHaveBeenCalled();
    });
  });
});
```

---

## Integration Testing

### Testnet Scenarios

Purpose: Validate real blockchain interactions before mainnet deployment.

#### Scenario 1: Create and Withdraw Stream
```
1. Connect wallet to testnet
2. Create stream with 10 sBTC, 10-block duration
3. Wait for next block
4. Withdraw 1 sBTC
5. Verify balance updated correctly
6. Verify event emitted
7. Confirm after 10 blocks stream completes
```

#### Scenario 2: DAO Proposal and Voting
```
1. Create proposal to change protocol fee
2. Vote FOR with 100 VESPER tokens
3. Check tokens locked
4. Wait for voting period to end
5. Execute proposal
6. Verify parameter updated
7. Claim locked tokens
```

#### Scenario 3: Batch Operations
```
1. Create 10 payment streams at once
2. Verify all streams created and indexed
3. Batch withdraw from 5 streams
4. Verify recipient receives combined amount
```

### Running Testnet Tests

```bash
# Set testnet environment
export STACKS_ENV=testnet

# Run manual tests (document results)
# Create a stream: <results>
# Withdraw from stream: <results>
# Create proposal: <results>
# Vote on proposal: <results>

# Record txn hashes and block confirmations
```

**Testnet Endpoints**:
- Stacks testnet API: `https://stacks-testnet-api.herokuapp.com`
- Explorer: `https://explorer.stacks.co?chain=testnet`
- sBTC faucet: [testnet-guide]

---

## Continuous Integration (GitHub Actions)

### CI Workflow (`ci.yml`)

```yaml
name: CI

on: [push, pull_request]

jobs:
  test-contracts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: clarinet test --coverage
      - uses: codecov/codecov-action@v2
        with:
          files: ./coverage/coverage.json
          flags: clarinet

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v2
        with:
          files: ./coverage/coverage.json
          flags: frontend

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run lint
      - run: npm run format:check

  clarity-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: clarinet check
```

---

## Manual Testing Checklist

- [ ] Stream creation with valid inputs
- [ ] Stream creation with invalid inputs (rejects appropriately)
- [ ] Withdrawal before stream completes
- [ ] Withdrawal after stream completes
- [ ] Pause and resume stream
- [ ] Cancel stream and verify escrow behavior
- [ ] Create DAO proposal
- [ ] Vote on proposal
- [ ] Execute passed proposal
- [ ] Batch create multiple streams
- [ ] Wallet connection and disconnection
- [ ] Network switching (testnet to mainnet)
- [ ] UI responsiveness on mobile

---

## Performance & Security Tests

### Load Testing
- Simulate 100+ concurrent streams
- Measure withdrawal gas costs
- Profile batch operation performance

### Security Audit Checklist
- [ ] No reentrancy vulnerabilities
- [ ] Access control properly enforced
- [ ] Overflow/underflow protected
- [ ] Event emissions for all state changes
- [ ] No hardcoded addresses or secrets
- [ ] Input validation on all public functions

---

## Post-Deployment Testing

After mainnet deployment:
1. Monitor on-chain events
2. Track gas costs and performance
3. Conduct security audit with third party
4. Regular regression testing
5. Community bug bounty review

---

## Test Data & Fixtures

Use mock data for consistent testing:

```typescript
export const mockStream = {
  id: 1,
  payer: 'SP1234567890ABCDEFGHIJKLMNOP',
  recipient: 'SP9876543210ZYXWVUTSRQPONMLKJI',
  totalAmount: BigInt(100_000_000), // 1 sBTC
  withdrawn: BigInt(0),
  startBlock: 100,
  endBlock: 200,
  ratePerBlock: BigInt(1_000_000),
  status: 'active',
};

export const mockProposal = {
  id: 1,
  proposer: 'SP1234567890ABCDEFGHIJKLMNOP',
  title: 'Increase max stream deposit',
  votesFor: BigInt(1000),
  votesAgainst: BigInt(100),
  endBlock: 500,
};
```

---

## Documentation for Running Tests

```bash
# Contract tests
cd vesper-protocol
clarinet test

# Frontend tests  
npm run test

# Both with coverage
clarinet test --coverage && npm run test:coverage

# Lint all code
npm run lint
npm run format

# Deploy to testnet (after Month 1)
npm run deploy:testnet
```

---

**Test Maintenance**: Update tests as contracts evolve. Keep test suite passing on every commit.
