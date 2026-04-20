# Daily Batch Automation Runbook

Operational guide for Vesper daily batch transaction automation via GitHub Actions.

## Quick Reference

**Automated Schedule**: 2:00 AM UTC daily  
**Manual Trigger**: GitHub Actions UI or CLI  
**Network Support**: Testnet (2 AM UTC) + Mainnet (manual)  
**Estimated Duration**: 25-35 minutes per run  
**Log Retention**: 30 days  

## Architecture Overview

```
GitHub Actions (2 AM UTC)
    ↓
Daily Batch Workflow (.github/workflows/daily-batch.yml)
    ├→ Setup Node.js 22 + npm cache
    ├→ Install dependencies
    ├→ Validate batch script (dry-run)
    ├→ Execute batch transactions (14 txs)
    │   ├─ Phase 1: Create 4 streams
    │   ├─ Phase 2: Withdraw from streams
    │   ├─ Phase 3: Top-up streams
    │   ├─ Phase 4: Cancel & read data
    ├→ Execute sweep-back recovery
    └→ Upload logs to artifacts
         ↓
Batch Monitoring Workflow (.github/workflows/batch-monitoring.yml)
    ├→ Parse execution logs
    ├→ Generate summary report
    └→ Post results to GitHub Workflow Summary

```

## Daily Operations

### Scheduled Execution (Automatic)

**When**: Every day at 2:00 AM UTC  
**Network**: Testnet  
**Trigger**: GitHub Actions cron schedule  
**Confirmation**: Check GitHub Actions tab after 2:20 AM UTC

#### Check Results

1. Go to **Actions** tab in GitHub
2. Select **Daily Batch Automation** workflow
3. Find the most recent run (should be from today, 2 AM UTC)
4. Click run name to view execution log
5. Verify all 4 phases completed successfully

#### Expected Output

```
✓ Daily batch execution completed successfully in 28.5s
  Total wallets: 5
  Successful transactions: 14/14
  Total µSTX spent on gas: 700 (14 txs × 50 fee)
  Total STX recovered: 4.2 (from sweep-back)
  Net daily cost: 3.5 STX (non-recoverable)
```

### Manual Execution (Dispatch)

For testing or out-of-schedule runs:

#### Via GitHub UI

1. Go to **Actions** tab
2. Select **Daily Batch Automation** workflow
3. Click **Run workflow** button
4. Choose network: **mainnet** or **testnet**
5. Click **Run workflow** to start

#### Via GitHub CLI

```bash
# Testnet
gh workflow run daily-batch.yml -f network=testnet

# Mainnet
gh workflow run daily-batch.yml -f network=mainnet
```

#### Via curl (if set up)

```bash
curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/[owner]/[repo]/actions/workflows/daily-batch.yml/dispatches \
  -d '{"ref":"main","inputs":{"network":"testnet"}}'
```

### Monitoring Execution

**Real-time monitoring**:
1. Open workflow run in Actions tab
2. Expand each step to see console output
3. Watch for phase completion messages:
   - `[Phase 1/4] Creating streams...`
   - `[Phase 2/4] Withdrawing from streams...`
   - `[Phase 3/4] Adding top-ups...`
   - `[Phase 4/4] Canceling and reading...`

**After completion**:
1. View **Batch Execution Summary** in workflow summary
2. Download batch logs from **Artifacts**
3. Check detailed JSON log: `scripts/logs/batch-YYYY-MM-DD.json`

### Log Format Reference

**Batch logs location**: `scripts/logs/batch-YYYY-MM-DD.json`

**Structure**:
```json
{
  "date": "2024-12-20",
  "network": "testnet",
  "transactions": [
    {
      "txHash": "0x...",
      "function": "create-stream",
      "walletFrom": "ST...",
      "walletTo": "ST...",
      "amount": 5000,
      "status": "confirmed",
      "timestamp": "2024-12-20T02:05:12.000Z"
    },
    ...
  ],
  "sweepSummary": {
    "totalRecovered": 4200000,
    "totalGasSpent": 700,
    "netCost": 3500000
  },
  "durationMs": 28500
}
```

## Troubleshooting

### Workflow Not Running

**Problem**: Scheduled workflow didn't run  
**Checklist**:
- [ ] Check GitHub Actions is enabled in Settings > Actions
- [ ] Verify workflow file syntax in `.github/workflows/daily-batch.yml`
- [ ] Confirm branch is `main` (workflows only trigger on default branch)
- [ ] Check cron time: `0 2 * * *` = 2:00 AM UTC
- [ ] Try manual dispatch to verify workflow works

**Solution**:
```bash
# Verify workflow syntax
act -l

# Manual test
gh workflow run daily-batch.yml -f network=testnet
```

### Batch Fails on Network Error

**Problem**: "Connection refused" or API timeout  
**Likely Cause**: Network instability or API rate limiting  
**Recovery**:
1. Wait 5 minutes for transient issues to resolve
2. Manually re-run workflow via GitHub UI
3. If persistent, check Hiro API status at https://status.hiro.so

**Manual Re-run**:
```bash
gh workflow run daily-batch.yml -f network=testnet
```

### Invalid Secret Error

**Problem**: "Secrets not found" or "Invalid key format"  
**Steps**:
1. Check secrets exist: **Settings > Secrets and variables > Actions**
2. Verify secret names match workflow exactly:
   - Testnet: `DEPLOYER_PRIVATE_KEY_TESTNET`
   - Mainnet: `DEPLOYER_PRIVATE_KEY`
3. Verify private key format (64-char hex, no `0x`)
4. Regenerate deployer wallet if corrupted

**Reference**: [SECRETS_SETUP.md](../docs/SECRETS_SETUP.md)

### Insufficient Funds Error

**Problem**: "Balance too low" during batch or sweep  
**Cause**: Deployer wallet depleted  
**Solution**:
1. Check deployer balance on testnet
2. Request coins from faucet or top-up manually
3. Retry batch execution

**Manual Top-Up (testnet)**:
```bash
curl -X POST https://api.testnet.hiro.so/extended/v1/faucets/stx \
  -H "Content-Type: application/json" \
  -d '{"address":"ST..."}'
```

### Transaction Confirmation Timeout

**Problem**: "Timed out waiting for confirmation"  
**Cause**: Stacks network congestion (rare)  
**Solution**:
1. Wait 10 minutes for network to clear
2. Check Stacks network status at https://www.stacks.co/
3. Manually re-run workflow if needed

**Monitoring**:
- Each transaction waits up to 200 seconds for confirmation
- 10-second polling interval between checks
- 20 retries total before timeout

### Batch Completes but Logs Missing

**Problem**: Workflow shows success but no batch logs in artifacts  
**Cause**: Batch script didn't save logs to `scripts/logs/`  
**Solution**:
1. Check script output for errors
2. Verify `scripts/logs/` directory exists
3. Ensure batch script has write permissions

**Manual Log Check**:
```bash
# After running batch locally
ls -la scripts/logs/
cat scripts/logs/batch-$(date +%Y-%m-%d).json | jq
```

## Performance Metrics

### Expected Metrics

| Metric | Expected | Warning | Critical |
|--------|----------|---------|----------|
| Batch Duration | 25-35s | >45s | >60s |
| Successful TXs | 14/14 | <13 | <10 |
| Gas Spent | 700 µSTX | >1000 | >1500 |
| Funds Recovered | >3 STX | <2 STX | <1 STX |
| Loop Availability | >99% | >95% | <90% |

### Dashboard

**Track historical metrics**:
1. Download batch log from artifacts
2. Extract key metrics from JSON
3. Chart over time (spreadsheet or custom dashboard)

**Sample metrics script**:
```bash
#!/bin/bash
# Extract metrics from all batch logs

for logfile in scripts/logs/batch-*.json; do
  date=$(jq -r '.date' "$logfile")
  txs=$(jq '.transactions | length' "$logfile")
  success=$(jq '[.transactions[] | select(.status == "confirmed")] | length' "$logfile")
  gas=$(jq '.sweepSummary.totalGasSpent' "$logfile")
  recovered=$(jq '.sweepSummary.totalRecovered' "$logfile")
  
  echo "$date,$txs,$success,$gas,$recovered"
done
```

## Best Practices

### Before Going Live

- [ ] Testnet batch runs successfully for 7 consecutive days
- [ ] Secrets configured correctly in GitHub (see SECRETS_SETUP.md)
- [ ] Monitoring workflow captures and reports results correctly
- [ ] Logs parsed correctly and display in workflow summary
- [ ] Team has accessed and reviewed sample logs
- [ ] Mainnet contract deployed and address updated in secrets
- [ ] Mainnet deployer wallet funded and backed up

### Ongoing Operations

- [ ] Monitor workflow runs daily for first week after deployment
- [ ] Review batch logs weekly for anomalies (failed txs, high gas, etc.)
- [ ] Test manual dispatch monthly to verify workflow stability
- [ ] Rotate deployer keys annually or as needed
- [ ] Keep documentation updated with current addresses/contracts
- [ ] Archive logs for compliance and auditing (stored 30 days in artifacts)

### Incident Response

1. **Workflow Failed**: Check logs immediately, manual re-run if network issue
2. **All Transactions Failed**: Check secrets and network connectivity
3. **Sweep-back Failed**: Funds remain in stream wallets, safe (recoverable later)
4. **Out of Sync**: Manually run batch, check block height differences
5. **Key Compromised**: Rotate deployer key immediately, deploy new contract

## Related Documentation

- **Setup**: [SECRETS_SETUP.md](../docs/SECRETS_SETUP.md)
- **Batch Script**: [scripts/batch-transactions.ts](../scripts/batch-transactions.ts)
- **CI/CD Pipeline**: [.github/workflows/ci.yml](.github/workflows/ci.yml)
- **Stacks Docs**: https://docs.stacks.co/
- **Hiro API**: https://docs.hiro.so/

## Workflow Files

**Primary Workflows**:
- `.github/workflows/daily-batch.yml` — Main batch execution
- `.github/workflows/batch-monitoring.yml` — Results monitoring
- `.github/workflows/ci.yml` — Contract tests + frontend build

**Support Files**:
- `scripts/batch-transactions.ts` — Batch execution logic
- `scripts/logs/` — Daily batch logs (JSON)
- `docs/SECRETS_SETUP.md` — Secret configuration guide

## Contact & Support

- **Questions**: See linked documentation above
- **Issues**: Report in GitHub Issues with workflow logs
- **Escalation**: Contact infrastructure team (mainnet issues)
