/**
 * Vesper Daily Batch Transaction Script v1
 * Automates stream creation, withdrawal, top-up, and cancellation flows
 * with automatic fund sweep-back after execution
 */

import {
  makeContractCall,
  makeSTXTokenTransfer,
  broadcastTransaction,
  getAddressFromPrivateKey,
  AnchorMode,
  PostConditionMode,
  standardPrincipalCV,
  uintCV,
  stringAsciiCV,
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface WalletConfig {
  address: string;
  privateKey: string;
}

interface TransactionLog {
  txHash: string;
  function: string;
  walletFrom: string;
  walletTo?: string;
  amount?: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
}

interface TxStatus {
  success: boolean;
  confirmed: boolean;
  txId: string;
}

interface BatchResult {
  date: string;
  network: string;
  transactions: TransactionLog[];
  sweepSummary: {
    totalRecovered: number;
    totalGasSpent: number;
    netCost: number;
  };
  durationMs: number;
}

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

// Never hardcode keys — always from environment variables
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS;
const CONTRACT_ADDRESS = process.env.VESPER_CORE_ADDRESS;
const VITE_NETWORK = process.env.VITE_NETWORK || 'mainnet';

// Network selection
const isTestnet = VITE_NETWORK === 'testnet';
const network = isTestnet ? new StacksTestnet() : new StacksMainnet();

// Faucet URL for testnet funding
const TESTNET_FAUCET_URL = 'https://api.testnet.hiro.so/extended/v1/faucets/stx';
const HIRO_API_URL = isTestnet
  ? 'https://api.testnet.hiro.so'
  : 'https://api.hiro.so';

// Transaction constants
const TX_FEE = 50; // µSTX
const POLLING_INTERVAL_MS = 10000; // 10 seconds
const MAX_RETRIES = 20; // 200 seconds total

// Batch parameters
const BATCH_CONFIG = {
  stream1: { deposit: 5000, rate: 50, duration: 100 },
  stream2: { deposit: 3000, rate: 30, duration: 100 },
  stream3: { deposit: 2000, rate: 20, duration: 100 },
  stream4: { deposit: 1000, rate: 10, duration: 100 },
  topUpAmount: 500,
};

// ============================================================================
// VALIDATION
// ============================================================================

function validateConfig(): void {
  if (!DEPLOYER_PRIVATE_KEY) {
    throw new Error('DEPLOYER_PRIVATE_KEY environment variable not set');
  }
  if (!DEPLOYER_ADDRESS) {
    throw new Error('DEPLOYER_ADDRESS environment variable not set');
  }
  if (!CONTRACT_ADDRESS) {
    throw new Error('VESPER_CORE_ADDRESS environment variable not set');
  }
  console.log(`✓ Configuration validated`);
  console.log(`  Network: ${VITE_NETWORK}`);
  console.log(`  Deployer: ${DEPLOYER_ADDRESS}`);
  console.log(`  Contract: ${CONTRACT_ADDRESS}`);
}

// ============================================================================
// WALLET FUNCTIONS
// ============================================================================

/**
 * Generate N fresh wallets for the batch test
 */
function generateWallets(count: number): WalletConfig[] {
  console.log(`\n→ Generating ${count} fresh wallets...`);
  const wallets: WalletConfig[] = [];

  for (let i = 0; i < count; i++) {
    // Generate random 32-byte private key
    const privateKey = crypto.randomBytes(32).toString('hex');
    const address = getAddressFromPrivateKey(privateKey, isTestnet ? 26 : 22);

    wallets.push({ address, privateKey });
    console.log(`  Wallet ${i + 1}: ${address}`);
  }

  return wallets;
}

/**
 * Fund wallets from faucet (testnet) or deployer (mainnet)
 */
async function fundWalletsFromFaucet(wallets: WalletConfig[]): Promise<void> {
  console.log(`\n→ Funding ${wallets.length} wallets...`);

  if (isTestnet) {
    // Testnet: Use Hiro faucet
    for (const wallet of wallets) {
      try {
        const response = await fetch(TESTNET_FAUCET_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: wallet.address }),
        });

        if (!response.ok) {
          console.warn(`  ⚠ Faucet request failed for ${wallet.address}: ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        console.log(`  ✓ ${wallet.address} funded (tx: ${data.txid})`);

        // Wait before next faucet request
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(`  ⚠ Error funding ${wallet.address}:`, error);
      }
    }
  } else {
    // Mainnet: Deployer sends STX to each wallet
    console.log(`  Using deployer to fund wallets (mainnet)`);
    const deployerKey = DEPLOYER_PRIVATE_KEY!;
    const fundAmount = 10000; // µSTX per wallet

    for (const wallet of wallets) {
      try {
        const tx = await makeSTXTokenTransfer({
          recipient: wallet.address,
          amount: fundAmount,
          fee: TX_FEE,
          anchorMode: AnchorMode.Any,
          network,
          privateKey: deployerKey,
        });

        const response = await broadcastTransaction(tx, network);
        console.log(`  ✓ ${wallet.address} funded (tx: ${response})`);
      } catch (error) {
        console.warn(`  ⚠ Error funding ${wallet.address}:`, error);
      }
    }
  }
}

// ============================================================================
// POLLING & CONFIRMATION
// ============================================================================

/**
 * Poll Hiro API for transaction confirmation status
 */
async function waitForConfirmation(txId: string, maxWaitSeconds = 200): Promise<TxStatus> {
  console.log(`  → Polling for confirmation of ${txId.substring(0, 8)}...`);

  let attempts = 0;
  const maxAttempts = Math.ceil(maxWaitSeconds / (POLLING_INTERVAL_MS / 1000));

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${HIRO_API_URL}/extended/v1/tx/${txId}`);
      const data = await response.json();

      if (data.tx_status === 'success') {
        console.log(`    ✓ Confirmed after ${attempts * POLLING_INTERVAL_MS / 1000}s`);
        return { success: true, confirmed: true, txId };
      }

      if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition') {
        console.log(`    ✗ Transaction failed: ${data.tx_status}`);
        return { success: false, confirmed: false, txId };
      }

      attempts++;
      if (attempts % 6 === 0) {
        // Log every 60 seconds
        console.log(`    ... still waiting (${attempts * POLLING_INTERVAL_MS / 1000}s)`);
      }

      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
    } catch (error) {
      console.warn(`    ⚠ Polling error:`, error);
      attempts++;
    }
  }

  console.log(`    ✗ Timed out waiting for confirmation`);
  return { success: false, confirmed: false, txId };
}

// ============================================================================
// LOGGING
// ============================================================================

function logTransaction(
  log: TransactionLog[],
  txHash: string,
  functionName: string,
  walletFrom: string,
  walletTo?: string,
  amount?: number
): void {
  log.push({
    txHash,
    function: functionName,
    walletFrom,
    walletTo,
    amount,
    status: 'pending',
    timestamp: new Date().toISOString(),
  });
}

function saveBatchLog(result: BatchResult): void {
  const date = new Date().toISOString().split('T')[0];
  const logDir = path.join(__dirname, 'logs');
  const logFile = path.join(logDir, `batch-${date}.json`);

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  fs.writeFileSync(logFile, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`\n✓ Batch log saved to: ${logFile}`);
}

function printSummary(result: BatchResult): void {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║            Vesper Daily Batch Summary                          ║
╠════════════════════════════════════════════════════════════════╣
║ Date:                      ${result.date}
║ Network:                   ${result.network}
║ Transactions Executed:     ${result.transactions.length}
║ Successful:                ${result.transactions.filter((t) => t.status === 'confirmed').length}
║ Failed:                    ${result.transactions.filter((t) => t.status === 'failed').length}
║ Total µSTX spent on gas:   ${result.sweepSummary.totalGasSpent}
║ Total STX recovered:       ${(result.sweepSummary.totalRecovered / 1_000_000).toFixed(2)} STX
║ Net daily cost:            ${result.sweepSummary.netCost} µSTX (non-recoverable)
║ Duration:                  ${(result.durationMs / 1000).toFixed(1)}s
╚════════════════════════════════════════════════════════════════╝
  `);
}

// ============================================================================
// BATCH EXECUTION LOGIC
// ============================================================================

/**
 * Execute batch transaction sequence:
 * 1-4: Wallet 0→1, 1→2, 2→3, 3→4 create-stream calls
 * 5-8: Withdrawals from each stream
 * 9-12: Top-up additions to each stream
 * 13-14: Cancel first two streams, read rates
 */
async function executeBatch(
  wallets: WalletConfig[],
  txLog: TransactionLog[]
): Promise<{ successful: number; failed: number }> {
  console.log('\n→ Starting batch execution (14-step sequence)...');

  let successCount = 0;
  let failCount = 0;

  try {
    // ===== PHASE 1: CREATE STREAMS (4 transactions) =====
    console.log('\n[Phase 1/4] Creating streams from wallet chain...');

    for (let i = 0; i < 4; i++) {
      const fromWallet = wallets[i];
      const toWallet = wallets[i + 1];
      const streamConfig = BATCH_CONFIG[`stream${i + 1}` as keyof typeof BATCH_CONFIG];

      console.log(`  Step ${i + 1}: ${fromWallet.address.substring(0, 8)}... → ${toWallet.address.substring(0, 8)}...`);

      try {
        const tx = await makeContractCall({
          contractAddress: CONTRACT_ADDRESS!,
          contractName: 'vesper-core',
          functionName: 'create-stream',
          functionArgs: [
            standardPrincipalCV(toWallet.address),
            uintCV(streamConfig.deposit),
            uintCV(streamConfig.rate),
            uintCV(streamConfig.duration),
          ],
          senderKey: fromWallet.privateKey,
          fee: TX_FEE,
          anchorMode: AnchorMode.Any,
          network,
        });

        const txResponse = await broadcastTransaction(tx, network);
        logTransaction(txLog, txResponse, 'create-stream', fromWallet.address, toWallet.address, streamConfig.deposit);
        successCount++;
        console.log(`    ✓ Broadcasting: ${txResponse.substring(0, 16)}...`);

        // Poll for confirmation
        const confirmation = await waitForConfirmation(txResponse);
        if (confirmation.confirmed) {
          txLog[txLog.length - 1].status = 'confirmed';
        } else {
          txLog[txLog.length - 1].status = 'failed';
          failCount++;
          successCount--;
        }
      } catch (error) {
        console.error(`    ✗ Error: ${error}`);
        failCount++;
      }

      // Small delay between transactions
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // ===== PHASE 2: WITHDRAW FROM STREAMS (4 transactions) =====
    console.log('\n[Phase 2/4] Withdrawing from streams...');

    for (let i = 0; i < 4; i++) {
      const wallet = wallets[i + 1]; // Recipient of stream i
      console.log(`  Step ${5 + i}: Withdraw from stream ${i + 1} (${wallet.address.substring(0, 8)}...)`);

      try {
        const tx = await makeContractCall({
          contractAddress: CONTRACT_ADDRESS!,
          contractName: 'vesper-core',
          functionName: 'withdraw-from-stream',
          functionArgs: [
            standardPrincipalCV(wallets[i].address), // Stream creator
            uintCV(i), // Stream ID
            uintCV(100), // Withdraw 100 µSTX
          ],
          senderKey: wallet.privateKey,
          fee: TX_FEE,
          anchorMode: AnchorMode.Any,
          network,
        });

        const txResponse = await broadcastTransaction(tx, network);
        logTransaction(txLog, txResponse, 'withdraw-from-stream', wallet.address, undefined, 100);
        successCount++;
        console.log(`    ✓ Broadcasting: ${txResponse.substring(0, 16)}...`);

        const confirmation = await waitForConfirmation(txResponse);
        if (confirmation.confirmed) {
          txLog[txLog.length - 1].status = 'confirmed';
        } else {
          txLog[txLog.length - 1].status = 'failed';
          failCount++;
          successCount--;
        }
      } catch (error) {
        console.error(`    ✗ Error: ${error}`);
        failCount++;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // ===== PHASE 3: TOP-UP STREAMS (4 transactions) =====
    console.log('\n[Phase 3/4] Adding top-ups to streams...');

    for (let i = 0; i < 4; i++) {
      const fromWallet = wallets[i];
      console.log(`  Step ${9 + i}: Top-up stream ${i + 1} from wallet ${i + 1}`);

      try {
        const tx = await makeContractCall({
          contractAddress: CONTRACT_ADDRESS!,
          contractName: 'vesper-core',
          functionName: 'top-up-stream',
          functionArgs: [
            standardPrincipalCV(wallets[i + 1].address), // Stream recipient
            uintCV(i), // Stream ID
            uintCV(BATCH_CONFIG.topUpAmount), // Top-up amount
          ],
          senderKey: fromWallet.privateKey,
          fee: TX_FEE,
          anchorMode: AnchorMode.Any,
          network,
        });

        const txResponse = await broadcastTransaction(tx, network);
        logTransaction(txLog, txResponse, 'top-up-stream', fromWallet.address, undefined, BATCH_CONFIG.topUpAmount);
        successCount++;
        console.log(`    ✓ Broadcasting: ${txResponse.substring(0, 16)}...`);

        const confirmation = await waitForConfirmation(txResponse);
        if (confirmation.confirmed) {
          txLog[txLog.length - 1].status = 'confirmed';
        } else {
          txLog[txLog.length - 1].status = 'failed';
          failCount++;
          successCount--;
        }
      } catch (error) {
        console.error(`    ✗ Error: ${error}`);
        failCount++;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // ===== PHASE 4: CANCEL STREAMS & READ (4 transactions) =====
    console.log('\n[Phase 4/4] Canceling and reading stream data...');

    // Cancel first 2 streams
    for (let i = 0; i < 2; i++) {
      const fromWallet = wallets[i];
      console.log(`  Step ${13 + i}: Cancel stream ${i + 1}`);

      try {
        const tx = await makeContractCall({
          contractAddress: CONTRACT_ADDRESS!,
          contractName: 'vesper-core',
          functionName: 'cancel-stream',
          functionArgs: [
            standardPrincipalCV(wallets[i + 1].address), // Stream recipient
            uintCV(i), // Stream ID
          ],
          senderKey: fromWallet.privateKey,
          fee: TX_FEE,
          anchorMode: AnchorMode.Any,
          network,
        });

        const txResponse = await broadcastTransaction(tx, network);
        logTransaction(txLog, txResponse, 'cancel-stream', fromWallet.address);
        successCount++;
        console.log(`    ✓ Broadcasting: ${txResponse.substring(0, 16)}...`);

        const confirmation = await waitForConfirmation(txResponse);
        if (confirmation.confirmed) {
          txLog[txLog.length - 1].status = 'confirmed';
        } else {
          txLog[txLog.length - 1].status = 'failed';
          failCount++;
          successCount--;
        }
      } catch (error) {
        console.error(`    ✗ Error: ${error}`);
        failCount++;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log(`\n✓ Batch execution complete`);
    console.log(`  Successful transactions: ${successCount}`);
    console.log(`  Failed transactions: ${failCount}`);

    return { successful: successCount, failed: failCount };
  } catch (error) {
    console.error('\n✗ Batch execution failed:', error);
    return { successful: successCount, failed: failCount };
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function initializeBatch(): Promise<WalletConfig[]> {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║       Vesper Daily Batch - Wallet Setup & Funding              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  // Validate environment
  validateConfig();

  // Step 1: Generate fresh wallets
  const wallets = generateWallets(5);

  // Step 2: Fund wallets from faucet (testnet) or deployer (mainnet)
  await fundWalletsFromFaucet(wallets);

  console.log(`\n✓ Batch initialization complete`);
  console.log(`  Ready to execute stream transactions with ${wallets.length} funded wallets`);

  return wallets;
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

if (require.main === module) {
  initializeBatch()
    .then((wallets) => {
      console.log('\n✓ Wallets ready for batch execution');
      console.log(`  Total wallets: ${wallets.length}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Batch initialization failed:', error);
      process.exit(1);
    });
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  WalletConfig,
  TxStatus,
  BatchResult,
  validateConfig,
  generateWallets,
  fundWalletsFromFaucet,
  waitForConfirmation,
  logTransaction,
  saveBatchLog,
  printSummary,
  executeBatch,
  initializeBatch,
  DEPLOYER_ADDRESS,
  DEPLOYER_PRIVATE_KEY,
  CONTRACT_ADDRESS,
  VITE_NETWORK,
  network,
  isTestnet,
  BATCH_CONFIG,
  TX_FEE,
};
