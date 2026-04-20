# Phase 1 Testnet Deployment Guide

Comprehensive guide for deploying Vesper Phase 1 to Stacks Testnet.

## Overview

**Phase 1**: Smart contract deployment and batch automation verification  
**Target**: Stacks Testnet (fully featured development network)  
**Contract**: vesper-core (stream creation, withdrawal, top-up, cancel)  
**Frontend**: Vesper App on Vercel (testnet mode)  
**Timeline**: 2-4 hours for full deployment and verification  

## Architecture

```
Local Development
    ↓
Smart Contract (vesper-core.clar)
    ├─ Create stream (14,000 µSTX cost to test)
    ├─ Withdraw from stream (50 µSTX per tx)
    ├─ Top-up stream (50 µSTX per tx)
    └─ Cancel stream (50 µSTX per tx)
    ↓
Stacks Testnet
    ├─ Deploy smart contract
    ├─ Record contract address
    └─ Update GitHub Secrets
    ↓
Daily Batch Automation
    ├─ Execute 14 transactions/day
    ├─ Test sweep-back recovery
    └─ Verify all functions work
    ↓
Frontend Deployment
    └─ Vesper App on Vercel (testnet config)
```

## Prerequisites

### Required Software
- Node.js 22 LTS (not 20)
- npm 11+
- Clarinet SDK 3.6.0+
- Git (for version control)
- curl (for API testing)

### Required Accounts
- GitHub account with access to Vesper repository
- Stacks Testnet wallet with STX for deployment fees
- Vercel account for frontend deployment (for Phase 1.17.3)

### Required API Access
- Hiro API (stacks.co) - public, rate-limited
- Stacks Testnet node or API endpoint
- GitHub Actions secrets configured (see docs/SECRETS_SETUP.md)

## Step 1: Prepare for Testnet Deployment

### 1.1 Generate Testnet Deployer Wallet

```bash
# In your local development environment
cd scripts

# Generate fresh deployer wallet for testnet
npx ts-node -e "
import { generateWallets } from './batch-transactions.js';
const wallet = generateWallets(1)[0];
console.log('Testnet Deployer Wallet:');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
"
```

**Output Example**:
```
Testnet Deployer Wallet:
Address: ST123ABCDEFGHIJKLMNOPQRSTUVWXYZ
Private Key: abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789
```

### 1.2 Request Testnet STX from Faucet

```bash
# Request 500 STX (500,000,000 µSTX) from testnet faucet
DEPLOYER_ADDRESS="ST123ABCDEFGHIJKLMNOPQRSTUVWXYZ"

curl -X POST https://api.testnet.hiro.so/extended/v1/faucets/stx \
  -H "Content-Type: application/json" \
  -d "{\"address\":\"$DEPLOYER_ADDRESS\"}"
```

**Response**:
```json
{
  "success": true,
  "txid": "0x..."
}
```

Wait 30 seconds for transaction to confirm:
```bash
# Check balance
curl https://api.testnet.hiro.so/extended/v1/address/$DEPLOYER_ADDRESS/balances | jq
```

### 1.3 Update GitHub Secrets

Add testnet secrets to GitHub (see docs/SECRETS_SETUP.md for full details):

1. Go to **Settings > Secrets and variables > Actions**
2. Add each secret:

| Name | Value | Type |
|------|-------|------|
| `DEPLOYER_PRIVATE_KEY_TESTNET` | From Step 1.1 | Secret |
| `DEPLOYER_ADDRESS` | From Step 1.1 | Secret |
| `VESPER_CORE_ADDRESS_TESTNET` | Will update in Step 2 | Secret |

```bash
# Verify secrets via CLI
gh secret list
```

## Step 2: Deploy vesper-core to Testnet

### 2.1 Run Deployment Validation

```bash
cd /path/to/vesper

# Run pre-flight deployment checks
bash scripts/deploy-testnet.sh
```

**Expected Output**:
```
✓ Contract validation passed
✓ Deployment manifest created
✓ Pre-deployment validation complete
```

### 2.2 Deploy Contract via Clarinet

```bash
# Initialize deployment through Clarinet
clarinet deployments create testnet

# Follow prompts:
# - Network: testnet
# - Private Key: [Paste DEPLOYER_PRIVATE_KEY_TESTNET from Step 1.1]
# - Confirm deployment to testnet
```

**Result**: Transaction broadcasted to testnet

### 2.3 Wait for Confirmation

```bash
# Poll for confirmation (takes ~15-30 min on testnet)
TX_ID="0x..."  # From deployment output

for i in {1..60}; do
  STATUS=$(curl -s https://api.testnet.hiro.so/extended/v1/tx/$TX_ID | jq -r '.tx_status')
  if [ "$STATUS" = "success" ]; then
    echo "✓ Contract deployed successfully"
    break
  elif [ "$STATUS" = "abort_by_response" ]; then
    echo "✗ Deployment failed"
    exit 1
  fi
  
  echo "  Waiting for confirmation... ($i/60) [Status: $STATUS]"
  sleep 30
done
```

### 2.4 Extract and Record Contract Address

Once deployed, extract contract address:

```bash
TX_ID="0x..."
CONTRACT_INFO=$(curl -s https://api.testnet.hiro.so/extended/v1/tx/$TX_ID)
CONTRACT_ADDRESS=$(echo $CONTRACT_INFO | jq -r '.contract_id')

echo "Contract deployed at: $CONTRACT_ADDRESS"
# Output: ST123ABCDEFGHIJKLMNOPQRSTUVWXYZ.vesper-core
```

## Step 3: Update Secrets and Verify

### 3.1 Update VESPER_CORE_ADDRESS_TESTNET

```bash
# Update GitHub secret with deployed contract address
gh secret set VESPER_CORE_ADDRESS_TESTNET --body "ST123ABCDEFGHIJKLMNOPQRSTUVWXYZ.vesper-core"
```

### 3.2 Verify Contract on Testnet Explorer

1. Go to [Testnet Stacks Explorer](https://testnet-explorer.alexgo.io/)
2. Search for contract address: `ST123ABCDEFGHIJKLMNOPQRSTUVWXYZ.vesper-core`
3. Verify contract code matches `contracts/vesper-core.clar`
4. Confirm functions are available:
   - `create-stream`
   - `withdraw-from-stream`
   - `top-up-stream`
   - `cancel-stream`

### 3.3 Test Contract Via Batch Script

```bash
# Trigger batch script on testnet via manual dispatch
gh workflow run daily-batch.yml -f network=testnet

# Wait for execution and verify results
# Check Actions tab for batch-logs artifacts
```

**Expected Results**:
- All 14 transactions succeed
- Sweep-back recovers funds
- No errors in logs

## Step 4: Deploy Frontend to Vercel

### 4.1 Build Frontend for Testnet

```bash
cd /path/to/vesper

# Build with testnet configuration
VITE_NETWORK=testnet npm run build
```

### 4.2 Configure Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Initialize deployment (if not already done)
cd frontend
vercel
```

### 4.3 Set Environment Variables in Vercel

In Vercel dashboard or CLI:

```bash
# Set testnet environment variables
vercel env add VITE_NETWORK testnet
vercel env add VITE_CONTRACT_ADDRESS "ST123ABCDEFGHIJKLMNOPQRSTUVWXYZ.vesper-core"
```

### 4.4 Deploy to Vercel

```bash
# Deploy frontend to Vercel
vercel deploy --prod --env VITE_NETWORK=testnet

# Result: https://vesper-app.vercel.app (or custom domain)
```

## Step 5: Verification Checklist

Before considering Phase 1 complete:

- [ ] Smart contract deployed to testnet
- [ ] Contract address recorded in GitHub Secrets
- [ ] Daily batch script runs successfully
- [ ] All 14 batch transactions execute
- [ ] Sweep-back recovery works
- [ ] Gas costs tracked in logs
- [ ] Frontend deployed to Vercel
- [ ] Frontend connects to testnet
- [ ] Wallet connection works in frontend
- [ ] Batch logs show all metrics
- [ ] Documentation updated with addresses

## Verification Commands

```bash
# Test contract read via API
curl https://api.testnet.hiro.so/extended/v1/contract/ST...vesper-core | jq

# Test batch script locally
VITE_NETWORK=testnet \
DEPLOYER_PRIVATE_KEY_TESTNET="..." \
DEPLOYER_ADDRESS="ST..." \
VESPER_CORE_ADDRESS_TESTNET="ST...vesper-core" \
npm run batch:testnet

# Check frontend deployment
curl -I https://vesper-app.vercel.app

# Verify batch logs uploaded
gh api repos/{owner}/{repo}/actions/artifacts --jq '.artifacts | .[] | select(.name | contains("batch-logs"))'
```

## Troubleshooting

### Contract Deployment Fails

**Problem**: "Invalid contract syntax" or deployment rejected  
**Solution**:
1. Verify contract compiles locally: `npm run test`
2. Check contract has no syntax errors: `clarinet check`
3. Ensure all dependencies are deployed first
4. Try with lower confirmation requirement

### Testnet Not Responding

**Problem**: "Connection refused" or timeout  
**Solution**:
1. Check Stacks status page: https://www.stacks.co/
2. Verify testnet is operational and synced
3. Try alternative Hiro endpoint if available
4. Wait 10 minutes and retry

### Insufficient Balance

**Problem**: "Account balance too low" during deployment  
**Solution**:
1. Request more STX from faucet (can request multiple times)
2. Wait for previous requests to confirm
3. Check balance: `curl https://api.testnet.hiro.so/extended/v1/address/$DEPLOYER_ADDRESS/balances`

### Batch Script Fails After Deployment

**Problem**: Batch script works but fails when connecting to deployed contract  
**Solution**:
1. Verify contract address matches in secrets
2. Ensure contract functions are identical to test expectations
3. Check contract is actually deployed (search in explorer)
4. Review batch logs for specific error messages

## Monitoring Post-Deployment

After successful deployment:

1. **Monitor daily batches**: Check GitHub Actions every 24 hours
2. **Review logs**: Download and analyze batch JSON logs
3. **Track metrics**: Monitor gas costs, transaction success rates
4. **Test frontend**: Interact with deployed testnet app
5. **Verify recovery**: Check that sweep-back consistently recovers funds

## Next Steps (Phase 2)

After successful Phase 1 testnet deployment:

1. Mainnet contract deployment
2. Mainnet batch automation
3. Production frontend deployment
4. Mainnet monitoring and alerting

## Support & Documentation

- **Setup Issues**: [SECRETS_SETUP.md](../docs/SECRETS_SETUP.md)
- **Daily Operations**: [DAILY_AUTOMATION.md](../docs/DAILY_AUTOMATION.md)
- **Batch Script**: [scripts/batch-transactions.ts](../scripts/batch-transactions.ts)
- **Smart Contract**: [contracts/vesper-core.clar](../contracts/vesper-core.clar)
- **Stacks Docs**: https://docs.stacks.co/
- **Testnet Explorer**: https://testnet-explorer.alexgo.io/

---

**Phase 1 Timeline**: 2-4 hours  
**Phase 2 Timeline**: 1-2 days (mainnet deployment)  
**Full Production**: End of Phase 2
