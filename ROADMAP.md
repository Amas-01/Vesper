# Vesper Protocol Roadmap

## Phase 0: Bootstrap (Pre-Month 1)
- [x] Repository initialization
- [x] Documentation scaffold
- [ ] GitHub setup and CI/CD pipeline

## Month 1: Core Streaming Contract & Basic Frontend

### Smart Contracts
- Implement `vesper-core` contract with:
  - Stream creation with initial deposit
  - Per-block withdrawal logic
  - Stream pause/resume functionality
  - Basic stream data structure

### Frontend
- Stream creation UI
- Dashboard showing active streams
- Wallet connection (Hiro Wallet)
- Real-time balance display

### Testing & Deployment
- Unit tests for all contract functions (80%+ coverage)
- Testnet deployment
- Manual testing guide

## Month 2: DAO Governance, Cancellation & Withdrawal

### Smart Contracts
- Implement `vesper-dao` contract with:
  - Governance token (VESPER)
  - Proposal creation and voting
  - Protocol parameter management
  - Stream cancellation with configurable models (burn, return to payer, escrow)
  
### Features
- Advanced withdrawal strategies
- Dispute resolution mechanism
- Emergency pause functionality

### Frontend
- DAO dashboard (proposal voting, token staking)
- Parameter configuration UI
- Analytics for stream health

## Month 3: Multi-Stream, Batch Payroll & Analytics

### Smart Contracts
- `vesper-registry` contract for stream enumeration
- Batch stream creation
- Multi-recipient payroll groups
- Advanced accounting and settlement

### Frontend
- Batch payroll upload (CSV, JSON)
- Group-based stream management
- Advanced analytics dashboard
  - Stream velocity metrics
  - Payment success rates
  - DAO treasury tracking

### Tooling
- CLI tools for bulk operations
- Off-chain indexer for analytics

## Month 4: Mainnet Audit, Deployment & Advanced Features

### Security
- Third-party smart contract audit
- Penetration testing for frontend
- Security audit report publication

### Mainnet Deployment
- Contract deployment to Stacks mainnet
- sBTC mainnet integration
- Monitoring and alerting setup

### Advanced Features
- Cross-chain payment composition
- NFT receipt issuance
- Integration with DeFi protocols
- Advanced fee structures

---

**Status**: Phase 0 in progress
