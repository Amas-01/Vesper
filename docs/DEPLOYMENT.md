# Vesper Protocol Deployment Guide

Deployment procedures for testnet and mainnet environments with detailed checklists and monitoring setup.

## Environment Setup

### Testnet Configuration

Set environment variables in `.env.testnet`:

```bash
# Stacks testnet
STACKS_API_URL=https://stacks-testnet-api.herokuapp.com
STACKS_CONTRACT_NETWORK=testnet

# sBTC testnet
SBTC_API_URL=https://sbtc-testnet.blockstack.org
SBTC_FAUCET_URL=https://sbtc-faucet.blockstack.org

# Frontend
VITE_NETWORK=testnet
VITE_API_URL=https://testnet-api.vesper.sh

# Deployment
DEPLOY_ACCOUNT_PRIVATE_KEY=<your-testnet-key>
DEPLOY_ACCOUNT_MNEMONIC=<your-testnet-mnemonic>
```

### Mainnet Configuration

Set environment variables in `.env.mainnet`:

```bash
# Stacks mainnet
STACKS_API_URL=https://stacks-api.testnet.bitcoinl2.org
STACKS_CONTRACT_NETWORK=mainnet

# sBTC mainnet
SBTC_API_URL=https://sbtc.blockstack.org
SBTC_LIQUIDITY=https://sbtc-lp.blockstack.org

# Frontend
VITE_NETWORK=mainnet
VITE_API_URL=https://api.vesper.sh

# Deployment
DEPLOY_ACCOUNT_PRIVATE_KEY=<your-mainnet-key>
DEPLOY_ACCOUNT_MNEMONIC=<your-mainnet-mnemonic>
```

---

## Testnet Deployment

### Phase 1: Contract Deployment

#### Step 1: Compile Contracts

```bash
cd contracts
clarinet check
clarinet build
```

Expected output:
```
✓ Clarity syntax check passed
✓ Analysis passed
✓ Build successful: ./build/
```

#### Step 2: Deploy Core Contract

```bash
# Deploy vesper-core to testnet
clarinet deploy types vesper-core --network testnet

# Capture contract address
# VESPER_CORE_ADDRESS=ST1234567890ABCDEFGHIJK.vesper-core
```

#### Step 3: Deploy DAO Contract

```bash
clarinet deploy types vesper-dao --network testnet

# Capture contract address
# VESPER_DAO_ADDRESS=ST1234567890ABCDEFGHIJK.vesper-dao
```

#### Step 4: Deploy Registry Contract

```bash
clarinet deploy types vesper-registry --network testnet

# Capture contract address
# VESPER_REGISTRY_ADDRESS=ST1234567890ABCDEFGHIJK.vesper-registry
```

#### Step 5: Initialize Contracts

After deployment, initialize contract state:

```bash
# Set initial DAO parameters
stx call VESPER_DAO_ADDRESS initialize-params \
  --protocol-fee u250 \
  --max-stream-deposit u100000000000 \
  --voting-period-blocks u1440

# Mint initial VESPER tokens for testing
stx call VESPER_DAO_ADDRESS mint \
  --amount u1000000
```

#### Update Deployment Record

Create `.env.testnet` with deployed addresses:

```bash
VESPER_CORE_ADDRESS=ST1234567890ABCDEFGHIJK.vesper-core
VESPER_DAO_ADDRESS=ST1234567890ABCDEFGHIJK.vesper-dao
VESPER_REGISTRY_ADDRESS=ST1234567890ABCDEFGHIJK.vesper-registry

# Block heights
CORE_DEPLOYED_BLOCK=12345
DAO_DEPLOYED_BLOCK=12346
REGISTRY_DEPLOYED_BLOCK=12347
```

### Phase 2: Frontend Deployment

#### Step 1: Build Frontend

```bash
cd frontend
npm install
npm run build:testnet
# Creates dist/ folder with optimized build
```

#### Step 2: Deploy to Vercel (Testnet Preview)

```bash
# Install Vercel CLI
npm install -g vercel

# Preview deployment
vercel --prod --env VITE_NETWORK=testnet

# Capture preview URL: https://vesper-testnet.vercel.app
```

#### Step 3: Configure Custom Domain

```bash
# Add testnet subdomain (optional)
vercel domains add vesper-testnet.sh
# Follow DNS verification steps
```

### Phase 3: Integration Testing on Testnet

#### Manual Test Suite

1. **Wallet Connection**
   - [ ] Connect with Hiro Wallet
   - [ ] Display correct address
   - [ ] Show STX balance

2. **Stream Creation**
   - [ ] Create stream with 1 sBTC, 10-block duration
   - [ ] Confirm transaction in explorer
   - [ ] Verify stream appears in dashboard
   - [ ] Check stream ID matches contract mapping

3. **Withdrawal**
   - [ ] Wait 2 blocks
   - [ ] Click withdraw
   - [ ] Verify accrued amount calculated correctly
   - [ ] Confirm STX received in wallet

4. **DAO Voting**
   - [ ] Get VESPER tokens (manual mint if needed)
   - [ ] Create proposal
   - [ ] Vote on proposal
   - [ ] Verify vote counted
   - [ ] Check tokens locked

#### Verification Commands

```bash
# Check contract deployed
stx account <CONTRACT_ADDRESS>

# Get stream info
stx read VESPER_CORE_ADDRESS get-stream \
  --stream-id u1

# Check DAO token balance
stx read VESPER_DAO_ADDRESS get-balance \
  --account ST1234567890ABCDEFGHIJK

# Monitor recent transactions
curl https://stacks-testnet-api.herokuapp.com/extended/v1/tx
```

### Phase 4: Monitoring Setup

#### Event Indexing

Set up off-chain indexing for testnet events:

```bash
# Create indexer service (mock for Phase 0)
touch scripts/indexer.js

# Start listening to events
node scripts/indexer.js --network testnet
```

#### Logging

```bash
# Enable debug logging
export DEBUG=vesper:*
npm run dev
```

---

## Mainnet Deployment

### Pre-Mainnet Checklist

- [ ] Third-party security audit completed
- [ ] All testnet tests pass
- [ ] Coverage targets met (80%+)
- [ ] No TODO comments in code
- [ ] Governance contracts tested
- [ ] Escrow models fully tested
- [ ] Recovery procedures documented
- [ ] Incident response plan ready

### Mainnet Deployment Steps

#### Step 1: Pre-deployment Validation

```bash
# Validate all contracts
clarinet check --network mainnet
clarinet audit

# Generate deployment report
npm run audit:report > MAINNET_AUDIT.md
```

#### Step 2: Deploy Contracts to Mainnet

```bash
# Deploy with caution - single transaction mode
clarinet deploy types vesper-core --network mainnet --private-key <KEY>
clarinet deploy types vesper-dao --network mainnet --private-key <KEY>
clarinet deploy types vesper-registry --network mainnet --private-key <KEY>

# Capture addresses and block heights
```

#### Step 3: Initialize Mainnet Parameters

```bash
# Conservative initial parameters
stx call VESPER_DAO_ADDRESS initialize-params \
  --protocol-fee u300 \
  --max-stream-deposit u500000000 \
  --voting-period-blocks u2880

# Mint initial governance tokens (controlled supply)
stx call VESPER_DAO_ADDRESS mint \
  --amount u10000000
```

#### Step 4: Deploy Frontend to Production

```bash
cd frontend
npm run build:mainnet
vercel --prod --env VITE_NETWORK=mainnet

# Configure production domain
vercel domains add vesper.sh
vercel alias set vesper.sh --domain vesper.sh
```

#### Step 5: Update DNS & SSL

```bash
# CNAME record points to Vercel
# Record: vesper.sh -> cname.vercel-dns.com

# SSL auto-provisioned by Vercel
# Verify at: https://vesper.sh
```

### Mainnet Monitoring

#### Contract Events Stream

```bash
# Subscribe to all events
curl -N https://stacks-api.bitcoinl2.org/extended/v1/tx/events \
  --header "Content-Type: application/json" \
  | grep -i "vesper"
```

#### Daily Health Check Script

```bash
#!/bin/bash
# scripts/health-check-mainnet.sh

echo "Vesper Protocol Mainnet Health Check"
echo "Time: $(date)"

# Check contract status
echo "✓ Core contract active"

# Count active streams
STREAM_COUNT=$(stx read VESPER_CORE_ADDRESS get-total-streams)
echo "✓ Active streams: $STREAM_COUNT"

# Calculate protocol volume
echo "✓ Daily volume: XX.XX sBTC"

# Check DAO health
PROPOSAL_COUNT=$(stx read VESPER_DAO_ADDRESS get-proposal-count)
echo "✓ Governance proposals: $PROPOSAL_COUNT"
```

---

## Contract Addresses

### Testnet (Phase 1+)

| Contract | Address | Deployed |
|----------|---------|----------|
| vesper-core | TBD | Phase 1 |
| vesper-dao | TBD | Phase 2 |
| vesper-registry | TBD | Phase 3 |

### Mainnet (Phase 4)

| Contract | Address | Deployed |
|----------|---------|----------|
| vesper-core | TBD | Phase 4 |
| vesper-dao | TBD | Phase 4 |
| vesper-registry | TBD | Phase 4 |

---

## Environment Variables Required

### Backend / Contracts
```bash
STACKS_API_URL=
STACKS_CONTRACT_NETWORK=
SBTC_API_URL=
DEPLOY_ACCOUNT_PRIVATE_KEY=
```

### Frontend
```bash
VITE_NETWORK=
VITE_API_URL=
VITE_CONTRACT_CORE=
VITE_CONTRACT_DAO=
VITE_CONTRACT_REGISTRY=
```

### Deployment Secrets (GitHub Actions)
```bash
MAINNET_DEPLOYMENT_KEY=
MAINNET_DEPLOYMENT_MNEMONIC=
VERCEL_TOKEN=
VERCEL_PROJECT_ID=
```

---

## Rollback Procedures

### If Contract Issue Detected

```bash
# Pause contract activity (if emergency-pause exists)
stx call VESPER_CORE_ADDRESS emergency-pause
# Notifies DAO, initiates recovery mode

# Deploy fixed version to new contract
clarinet deploy types vesper-core-v2 --network mainnet

# Point frontend to new contract
# Update VITE_CONTRACT_CORE env var
# Rebuild and deploy frontend
```

### Mainnet Recovery

1. Announce issue on social channels
2. Invoke emergency-pause if applicable
3. Deploy fixes to new contract version
4. Coordinate user migration
5. Post-mortem and preventative measures

---

## Cost Estimation

### Mainnet Gas Costs (Approximate)

| Operation | Est. Gas | Cost (STX) |
|-----------|----------|-----------|
| Contract deploy | 1M | 20-50 |
| Create stream | 5k | 0.10-0.15 |
| Withdraw | 3k | 0.06-0.10 |
| Create proposal | 8k | 0.15-0.25 |
| Vote | 2k | 0.04-0.06 |

---

## Post-Deployment

### Week 1
- Monitor contract events
- Track transaction volumes
- User feedback collection
- Hot-fix any issues

### Month 1
- Community testing and feedback
- Performance optimization
- Analytics dashboard refinement

### Ongoing
- Regular security audits
- Parameter tuning based on usage
- Feature releases per roadmap

---

**Deployment Owner**: [TBD]
**Last Updated**: April 2026
**Next Review**: Phase 1 completion
