# 🚀 Vesper Protocol

**Real-time per-block sBTC payroll and payment streaming on Bitcoin via Stacks**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Testnet Live](https://img.shields.io/badge/Testnet-Live-brightgreen.svg)](docs/DEPLOYMENT.md)
[![Phase 1 Complete](https://img.shields.io/badge/Phase_1-75%25_Complete-blue.svg)](ROADMAP.md)

## 📋 Overview

Vesper is a decentralized payment streaming protocol built on Stacks that enables real-time, per-block sBTC payroll distributions. Instead of monthly or weekly payouts, Vesper allows employers and service providers to stream payments continuously, with recipients able to withdraw their earnings on-chain as they accrue.

### ✨ Key Features:
- ⏱️ **Per-block streaming**: Payments settle every Stacks block (~10 minutes)
- ₿ **sBTC integration**: Secure Bitcoin settlement via Stacks sBTC
- 🗳️ **DAO governance**: Token holders vote on protocol parameters and upgrades
- ❌ **Cancellable streams**: Payers can cancel active streams with customizable escrow models
- 📦 **Batch payroll**: Pay multiple recipients in a single transaction
- 📊 **Analytics dashboard**: Real-time tracking of payment streams and DAO governance

## 📊 Phase 1 Implementation Status

### ✅ Completed Tasks (Tasks 1.1 - 1.14)

| Task | Feature | Status | Details |
|------|---------|--------|---------|
| **1.1-1.4** | Smart Contract Core | ✅ Complete | Data model, error handling, 9 state functions, 12 getters |
| **1.5** | Unit Tests | ✅ Complete | 28/28 tests passing (100%) |
| **1.6** | Frontend Scaffold | ✅ Complete | Vite 5, React 18, TypeScript, Tailwind CSS |
| **1.7** | Wallet Integration | ✅ Complete | @stacks/connect with Hiro Wallet support |
| **1.8** | Contract Builders & UI | ✅ Complete | 11 contract functions + dark mode system (20+ components) |
| **1.9-1.12** | Frontend Pages | ✅ Complete | Create stream, dashboard, detail, GitHub CI/CD |
| **1.13-1.14** | Feature Branch Sync | ✅ Complete | All features synced to main with latest CI/CD |

### 🚀 Phase 1.15 - Daily Batch Automation (✅ Complete)

**Daily Batch Transaction Script v1** (5 commits)
- ✅ Wallet generation & testnet faucet funding
- ✅ 14-step batch transaction execution (create/withdraw/topup/cancel)
- ✅ Automatic sweep-back fund recovery with gas cost tracking
- ✅ JSON logging with daily batch summaries
- ✅ npm scripts: `npm run batch` (mainnet), `npm run batch:testnet` (testnet)

### 🔄 Phase 1.16 - GitHub Actions Automation (✅ Complete)

**Daily Batch Automation Workflow** (4 commits)
- ✅ Cron-scheduled daily execution at 2 AM UTC on testnet
- ✅ Manual dispatch support for ad-hoc testing (mainnet/testnet)
- ✅ Batch monitoring workflow with log parsing and reporting
- ✅ Complete secrets setup documentation ([SECRETS_SETUP.md](docs/SECRETS_SETUP.md))
- ✅ Daily automation operations runbook ([DAILY_AUTOMATION.md](docs/DAILY_AUTOMATION.md))

### 🔴 Phase 1.17 - Testnet Deployment (IN PROGRESS)

**Deploy Phase 1 to Testnet** (3 commits)
- ✅ Testnet deployment script with validation checks
- ✅ Batch verification script for contract testing
- ⏳ **This commit**: Update README and deployment documentation

**Testnet Resources**:
- 📖 [Testnet Deployment Guide](docs/TESTNET_DEPLOYMENT.md) - Step-by-step deployment
- 🔑 [Secrets Setup Guide](docs/SECRETS_SETUP.md) - GitHub Actions secrets configuration
- 📋 [Daily Automation Runbook](docs/DAILY_AUTOMATION.md) - Operations and troubleshooting

**Next Phase**: After testnet verification
- Phase 2: Mainnet contract deployment
- Phase 3: Production frontend deployment to Vercel
- Phase 4: Mainnet monitoring and alerting

## ⚡ Quick Start

### 📋 Prerequisites
- Node.js 18+ and npm
- Stacks CLI with Clarinet
- A Stacks wallet (Hiro Wallet or similar)

### Local Development

```bash
# Clone repository
git clone https://github.com/Amas-01/Vesper.git
cd Vesper

# Install dependencies
npm install

# Run smart contract tests
npm run test

# Start development frontend
cd frontend && npm run dev

# Build for production
npm run build

# Run daily batch script locally (testnet)
npm run batch:testnet

# Check batch logs
cat scripts/logs/batch-$(date +%Y-%m-%d).json | jq
```

### Deploy to Testnet

See [TESTNET_DEPLOYMENT.md](docs/TESTNET_DEPLOYMENT.md) for detailed testnet deployment instructions.

Automated daily batch execution: [DAILY_AUTOMATION.md](docs/DAILY_AUTOMATION.md)

## 📚 Documentation

- 🗺️ [Roadmap](ROADMAP.md) - Complete Phase 1-3 timeline and task breakdown
- 🏗️ [Architecture](docs/ARCHITECTURE.md) - System design and component overview
- 🗄️ [Data Model](docs/DATA_MODEL.md) - Clarity data structures and storage
- 📝 [Smart Contracts](docs/CONTRACTS.md) - Contract reference and function signatures
- ⚛️ [Frontend Components](docs/FRONTEND_COMPONENTS.md) - React component library
- 🧪 [Testing Strategy](docs/TESTING.md) - Test coverage and execution
- 🚀 [Testnet Deployment](docs/TESTNET_DEPLOYMENT.md) - Step-by-step testnet deployment guide
- ⚙️ [Daily Automation](docs/DAILY_AUTOMATION.md) - Daily batch automation operations runbook
- 🔐 [Secrets Setup](docs/SECRETS_SETUP.md) - GitHub Actions secrets configuration
- 🌐 [CI/CD Pipeline](docs/CI_CD.md) - GitHub Actions workflows and build optimization

## Project Structure

```
Vesper/
├── contracts/                          # Clarity smart contracts
│   └── vesper-core.clar               # Core streaming logic (✅ Complete)
│       ├── Stream data structure       # StreamData type definition
│       ├── State-changing functions    # create, withdraw, cancel, topup, expire
│       └── Read-only functions         # get-stream, get-balance, get-progress, etc.
│
├── frontend/                           # React + TypeScript web application
│   ├── src/
│   │   ├── components/                # React UI components (20+)
│   │   │   ├── layout/               # Header, Footer, Layout wrapper
│   │   │   ├── wallet/               # ConnectWallet, WalletStatus
│   │   │   ├── stream/               # StreamCard, StreamList, Withdraw/Cancel buttons
│   │   │   └── ui/                   # Button, Input, Modal, Badge, Spinner, Toast
│   │   ├── pages/                    # Route pages (4)
│   │   │   ├── Home.tsx              # Landing page with gradients
│   │   │   ├── Dashboard.tsx         # Stream management dashboard
│   │   │   ├── CreateStream.tsx      # Stream creation form
│   │   │   └── StreamDetail.tsx      # Individual stream view with progress
│   │   ├── hooks/                    # React custom hooks (✅ Complete)
│   │   │   ├── useWallet.ts          # Wallet connection & auth
│   │   │   ├── useStream.ts          # Contract state-changing operations
│   │   │   └── useContract.ts        # Read-only contract queries
│   │   ├── lib/                      # Utilities & helpers
│   │   │   ├── contracts.ts          # Contract builders & fetchers (11 functions)
│   │   │   ├── stacks.ts             # Network config & constants
│   │   │   └── utils.ts              # Helper functions
│   │   ├── store/                    # Zustand state management
│   │   │   ├── walletStore.ts        # Wallet state (address, session)
│   │   │   └── streamStore.ts        # Stream data cache
│   │   ├── types/                    # TypeScript interfaces
│   │   │   ├── stream.ts             # Stream, Progress types
│   │   │   └── wallet.ts             # Wallet, Session types
│   │   ├── App.tsx                   # Root component with dark mode
│   │   ├── index.css                 # Dark mode design system (180+ lines)
│   │   └── main.tsx                  # React entry point
│   ├── tailwind.config.js             # Dark palette (vesper + slate-dark)
│   ├── vite.config.ts                 # Vite build configuration
│   └── package.json                   # npm dependencies (327 modules)
│
├── docs/                              # Additional documentation
│   ├── ARCHITECTURE.md                # System design overview
│   ├── DATA_MODEL.md                  # Clarity type definitions
│   ├── CONTRACTS.md                   # Contract function reference
│   ├── FRONTEND_COMPONENTS.md         # UI component catalog
│   ├── TESTING.md                     # Test strategies
│   └── DEPLOYMENT.md                  # Deploy to testnet/mainnet
│
├── tests/                             # Test files
│   └── [Test fixtures and helpers]
│
├── deployments/                       # Deployment configurations
│   └── [Network-specific configs]
│
├── settings/                          # Environment settings (.gitignore protected)
│   └── [Network configs - not tracked]
│
├── ROADMAP.md                         # Phase 1-3 development timeline (✅ Updated)
├── README.md                          # This file
└── LICENSE                            # MIT License

```

## 🔧 Key Technologies

| Layer | Technology | Version |
|-------|-----------|---------|
| Smart Contracts | Clarity / Stacks | v2 |
| Frontend Framework | React | 18.2.0 |
| Build Tool | Vite | 5.4.21 |
| Language | TypeScript | 5.3.3 |
| Styling | Tailwind CSS | 3.3.0 |
| State Management | Zustand | 4.4.0 |
| Routing | React Router | 6.20.0 |
| Wallet Integration | @stacks/connect | 7.2.0 |
| Testing | Clarinet SDK | Latest |

## 🚀 Development Workflow

### Smart Contracts
```bash
cd contracts
clarinet test                    # Run all unit tests
clarinet run                     # Execute contract calls
clarinet test --watch           # Watch mode testing
```

### Frontend
```bash
cd frontend
npm run dev                      # Start dev server (http://localhost:5173)
npm run build                    # Production build
npm run preview                  # Preview production build
npm run lint                     # ESLint checks
```

### Git Workflow
- Feature branches: `feat/task-1.X-*`, `fix/*`, `style/*`
- Batch commits by concern (not one-file-per-commit)
- Detailed PR descriptions with scope/testing/impact
- Squash merge to main after review

## 📋 Branch Strategy

**Current Feature Branches** (Ready for PR):
- `feat/task-1.8-contract-builders` - Smart contract builders & React hooks
- `style/dark-mode-redesign` - Complete dark mode UI system
- `fix/connect-wallet-integration` - ConnectWallet modal & debugging

**Merge Base**: `feat/frontend-vite-init` → Main development branch

## Team

Vesper Protocol is developed by the Stacks community. For inquiries, reach out via [GitHub Discussions](https://github.com/Amas-01/Vesper/discussions).

## License

MIT License - see [LICENSE](LICENSE) file for details

---

**Built on Stacks** | **Bitcoin Settlement** | **Community-Driven**
