# 🚀 Vesper Protocol

**Real-time per-block sBTC payroll and payment streaming on Bitcoin via Stacks**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Testnet Live](https://img.shields.io/badge/Testnet-Live-brightgreen.svg)](docs/DEPLOYMENT.md)

## 📋 Overview

Vesper is a decentralized payment streaming protocol built on Stacks that enables real-time, per-block sBTC payroll distributions. Instead of monthly or weekly payouts, Vesper allows employers and service providers to stream payments continuously, with recipients able to withdraw their earnings on-chain as they accrue.

### ✨ Key Features:
- ⏱️ **Per-block streaming**: Payments settle every Stacks block (~10 minutes)
- ₿ **sBTC integration**: Secure Bitcoin settlement via Stacks sBTC
- 🗳️ **DAO governance**: Token holders vote on protocol parameters and upgrades
- ❌ **Cancellable streams**: Payers can cancel active streams with customizable escrow models
- 📦 **Batch payroll**: Pay multiple recipients in a single transaction
- 📊 **Analytics dashboard**: Real-time tracking of payment streams and DAO governance

## ⚡ Quick Start

### 📋 Prerequisites
- Node.js 18+ and npm
- Stacks CLI with Clarinet
- A Stacks wallet (Hiro Wallet or similar)

### Local Development

```bash
# Clone repository
git clone https://github.com/vesper-protocol/vesper-protocol.git
cd vesper-protocol

# Install dependencies
npm install

# Run smart contract tests
clarinet test

# Start development frontend
npm run dev

# Build for production
npm run build
```

### Deploy to Testnet

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed testnet and mainnet deployment instructions.

## 📚 Documentation

- 🗺️ [Roadmap](ROADMAP.md) - Development phases and timeline
- 🏗️ [Architecture](docs/ARCHITECTURE.md) - System design and component overview
- 🗄️ [Data Model](docs/DATA_MODEL.md) - Clarity data structures and storage
- 📝 [Smart Contracts](docs/CONTRACTS.md) - Contract reference and function signatures
- ⚛️ [Frontend Components](docs/FRONTEND_COMPONENTS.md) - React component library
- 🧪 [Testing Strategy](docs/TESTING.md) - Test coverage and execution
- 🚀 [Deployment Guide](docs/DEPLOYMENT.md) - Testnet and mainnet deployment
- 🔐 [Security](docs/SECURITY.md) - Audit process and known limitations

## Project Structure

```
vesper-protocol/
├── contracts/              # Clarity smart contracts
│   ├── core/              # Core streaming logic
│   ├── dao/               # DAO governance
│   └── registry/          # Contract registry
├── frontend/              # React + TypeScript application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page layouts
│   │   └── services/      # Stacks integration
│   └── public/
├── scripts/               # Utility and deployment scripts
├── tests/                 # Integration and end-to-end tests
└── docs/                  # Additional documentation

```

## Team

Vesper Protocol is developed by the Stacks community. For inquiries, reach out via our GitHub discussions.

## License

MIT License - see [LICENSE](LICENSE) file for details

---

**Built on Stacks** | **Bitcoin Settlement** | **Community-Driven**
