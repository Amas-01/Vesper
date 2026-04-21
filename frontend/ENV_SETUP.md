# Environment Configuration Guide

## Setup

For development, copy .env.example to create your environment file:

```bash
# For testnet development (default)
cp .env.example .env.testnet

# For mainnet (production)
cp .env.example .env.mainnet
```

## Variables

- `VITE_NETWORK`: Set to 'testnet' or 'mainnet' (default: 'testnet')
- `VITE_VESPER_CORE_ADDRESS`: Smart contract address for vesper-core
- `VITE_VESPER_DAO_ADDRESS`: DAO contract address (Phase 2)
- `VITE_VESPER_REGISTRY_ADDRESS`: Registry contract address (Phase 2)

## Testnet Configuration

```dotenv
VITE_NETWORK=testnet
VITE_VESPER_CORE_ADDRESS=ST2DZ6FXXVR5DJHCR6Z7J71F3ZG00ATF2AFNQAPMD.vesper-core
VITE_VESPER_DAO_ADDRESS=
VITE_VESPER_REGISTRY_ADDRESS=
```

## Mainnet Configuration

```dotenv
VITE_NETWORK=mainnet
VITE_VESPER_CORE_ADDRESS=[TO BE DEPLOYED]
VITE_VESPER_DAO_ADDRESS=[TO BE DEPLOYED]
VITE_VESPER_REGISTRY_ADDRESS=[TO BE DEPLOYED]
```

## Notes

- Environment files (.env.testnet, .env.mainnet) are git-ignored for security
- Never commit actual secret values or private keys
- Default dev server uses testnet configuration
