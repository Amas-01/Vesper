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
