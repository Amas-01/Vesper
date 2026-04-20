# GitHub Actions Secrets Setup

This document describes the required secrets for the Vesper daily batch automation workflow.

## Required Secrets

All secrets must be added to the GitHub repository settings under **Settings > Secrets and variables > Actions**.

### 1. DEPLOYER_PRIVATE_KEY
**Purpose**: Private key of the deployer wallet for mainnet batch transactions  
**Type**: Sensitive String  
**Format**: Hex string (64 characters, no `0x` prefix)  
**Scope**: Mainnet production deployments  
**Created by**: Deployer wallet generation  
**Rotation**: Before wallet compromise or key rotation

### 2. DEPLOYER_PRIVATE_KEY_TESTNET
**Purpose**: Private key of the deployer wallet for testnet batch transactions  
**Type**: Sensitive String  
**Format**: Hex string (64 characters, no `0x` prefix)  
**Scope**: Testnet development and testing  
**Created by**: Test deployer wallet generation  
**Rotation**: Can be frequently rotated for testing

### 3. DEPLOYER_ADDRESS
**Purpose**: Public address derived from the deployer private key  
**Type**: String (not sensitive, but paired with keys)  
**Format**: Stacks address (starts with `SP` for mainnet, `ST` for testnet)  
**Scope**: Shared across mainnet and testnet  
**Created by**: Derived from private key using `getAddressFromPrivateKey()`

### 4. VESPER_CORE_ADDRESS_TESTNET
**Purpose**: Contract address of the deployed vesper-core contract on testnet  
**Type**: String  
**Format**: Stacks contract ID (`<address>.<contract_name>`)  
**Scope**: Testnet batch execution  
**Created by**: Deployment of vesper-core smart contract to testnet  
**Deployment**: Documented in Task 1.17

### 5. VESPER_CORE_ADDRESS
**Purpose**: Contract address of the deployed vesper-core contract on mainnet  
**Type**: String  
**Format**: Stacks contract ID (`<address>.<contract_name>`)  
**Scope**: Mainnet batch execution  
**Created by**: Deployment of vesper-core smart contract to mainnet  
**Deployment**: Future mainnet deployment

## Setup Instructions

### Step 1: Generate Deployer Wallets

For testnet:
```bash
cd scripts
npx ts-node -e "
import { generateWallets } from './batch-transactions.js';
const w = generateWallets(1)[0];
console.log('Testnet Deployer:');
console.log('Address:', w.address);
console.log('Private Key:', w.privateKey);
"
```

For mainnet (do this in secure, offline environment):
```bash
# Use proper key generation with air-gapped machine
# Store private key in secure vault
# Never commit private keys to repository
```

### Step 2: Add Secrets to GitHub

1. Go to repository: **Settings > Secrets and variables > Actions**
2. Click **New repository secret** for each:

#### Testnet Secrets:
- **DEPLOYER_PRIVATE_KEY_TESTNET**: `<testnet-deployer-hex-key>`
- **DEPLOYER_ADDRESS**: `ST<testnet-deployer-address>`
- **VESPER_CORE_ADDRESS_TESTNET**: `ST<deployer>.<contract_name>`

#### Mainnet Secrets:
- **DEPLOYER_PRIVATE_KEY**: `<mainnet-deployer-hex-key>`
- **DEPLOYER_ADDRESS**: `SP<mainnet-deployer-address>` (same as testnet deployer)
- **VESPER_CORE_ADDRESS**: `SP<deployer>.<contract_name>`

### Step 3: Verify Secrets

Run the validation workflow:
```bash
# Manual dispatch to test with testnet
gh workflow run daily-batch.yml -f network=testnet
```

Check the workflow logs to confirm:
- ✓ Secrets properly loaded (private keys are masked in logs)
- ✓ Network connection established
- ✓ Batch execution started

## Security Considerations

### Private Key Management
- **Never** commit private keys to GitHub
- **Never** log private keys in CI/CD output
- **Always** use GitHub Secrets for private key storage
- **Rotate** keys if compromise is suspected
- **Air-gap** mainnet key generation (offline machine)

### Credential Rotation Schedule
- **Testnet deployer**: Rotate monthly or after testing completed
- **Mainnet deployer**: Rotate annually or as needed after key rotation
- **Contract addresses**: Update immediately if contracts are redeployed

### Secret Scope & Access Control
- All secrets are environment-variable only (GitHub Actions)
- Accessible only in `daily-batch` workflow and manual dispatches
- Masked in all logs and outputs
- Inaccessible to PRs from forks

## Workflow Usage

### Scheduled Execution (Automatic)
Runs at **2:00 AM UTC** daily on mainnet:
```
0 2 * * * → 02:00 UTC daily
```

### Manual Execution (Dispatch)
Trigger from GitHub Actions UI or CLI:
```bash
# Testnet
gh workflow run daily-batch.yml -f network=testnet

# Mainnet
gh workflow run daily-batch.yml -f network=mainnet
```

### Environment Variables Used in Workflows

The workflow sets up these environment variables from secrets:

| Workflow Variable | Source Secret | Usage |
|------------------|---------------|-------|
| `DEPLOYER_PRIVATE_KEY` | `DEPLOYER_PRIVATE_KEY` | Mainnet deployer signing |
| `DEPLOYER_PRIVATE_KEY_TESTNET` | `DEPLOYER_PRIVATE_KEY_TESTNET` | Testnet deployer signing |
| `DEPLOYER_ADDRESS` | `DEPLOYER_ADDRESS` | Batch transaction recipient validation |
| `VESPER_CORE_ADDRESS` | `VESPER_CORE_ADDRESS` | Mainnet contract calls |
| `VESPER_CORE_ADDRESS_TESTNET` | `VESPER_CORE_ADDRESS_TESTNET` | Testnet contract calls |
| `VITE_NETWORK` | workflow inputs | Network selection (mainnet/testnet) |

## Troubleshooting

### Secret Not Found Error
**Problem**: Workflow fails with "secret not found"  
**Solution**:
1. Verify secret exists in GitHub Settings
2. Check secret name matches exactly (case-sensitive)
3. Ensure workflow has access to secrets

### Private Key Format Error
**Problem**: "Invalid key format" during batch execution  
**Solution**:
1. Verify key is valid hex (64 chars, no `0x`)
2. Regenerate wallet if corrupted
3. Check for extra whitespace in secret

### Address Mismatch Error
**Problem**: `DEPLOYER_ADDRESS` doesn't match derived address  
**Solution**:
1. Regenerate deployer wallet
2. Update `DEPLOYER_ADDRESS` secret with correct address
3. Verify network type (mainnet `SP` vs testnet `ST`)

## Secrets Verification Checklist

Before deploying to production:

- [ ] All 5 secrets added to GitHub repository
- [ ] Private keys generated in secure environment
- [ ] Testnet batch execution succeeds (manual dispatch)
- [ ] Mainnet testnet addresses deployed
- [ ] Mainnet contract address added to secrets
- [ ] Scheduled workflow tested (manual dispatch)
- [ ] Logs uploaded to artifacts correctly
- [ ] No private keys logged in execution output
- [ ] Backup of deployer addresses stored securely
- [ ] Rotation schedule documented and calendar-blocked

## Support

For issues with secrets or workflow setup, see:
- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Stacks KeyInfo Documentation](https://docs.stacks.co/docs/stacks-101/accounts)
- Vesper Contract Documentation (Task 1.17)
