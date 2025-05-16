# Sol-Breakout-ZK

A Next.js application that uses Zero Knowledge proofs with Solana state compression for issuing tokens and validating participation.

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Rust and Cargo (for Solana program development)
- Solana CLI tools
- Anchor framework

## Project Structure

- `/app`: Next.js frontend application
- `/cpop-program`: Compressed Proof of Participation Solana program
- `/solana-program`: Core Solana program for ZK verification
- `/cpop-interface`: Interface for the cPOP program

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Quadwinner/Sol-Breakout-ZK.git
cd Sol-Breakout-ZK
```

### 2. Install frontend dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up local Solana validator (for development)

```bash
solana-test-validator
```

### 4. Install and build the cPOP program

```bash
cd cpop-program
npm install
# or
yarn install
anchor build
```

### 5. Deploy the cPOP program (development)

```bash
anchor deploy
```

### 6. Run the frontend application

```bash
cd ..
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Features

- Create and manage token distribution campaigns
- Generate ZK proofs of participation
- User-friendly UI for campaign management
- Wallet integration for Solana
- State compression for efficient token issuance

## Testing

To run tests for the cPOP program:

```bash
cd cpop-program
anchor test
```

## Development Workflow

1. Start the local Solana validator
2. Deploy the cPOP program
3. Run the frontend application
4. Make changes to the code
5. Test changes with the test suite

## Common Issues

- If you encounter errors with the Solana connection, ensure your local validator is running
- For wallet connection issues, make sure you have a Solana wallet extension installed in your browser
- If program deployment fails, check your Solana CLI configuration

# cPOP Interface: Compressed Proof of Participation

A platform for creating and distributing compressed proof of participation tokens using ZK Compression on Solana. This solution enables event organizers to distribute participation rewards at a fraction of the cost of traditional tokens.

![cPOP Interface](https://i.imgur.com/placeholder.png)

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Cost Benefits of ZK Compression](#cost-benefits-of-zk-compression)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage Guide](#usage-guide)
  - [Creating a Campaign](#creating-a-campaign)
  - [Distributing Tokens](#distributing-tokens)
  - [Viewing Rewards](#viewing-rewards)
- [Application Structure](#application-structure)
- [Component Architecture](#component-architecture)
- [Solana Integration](#solana-integration)
- [ZK Compression Details](#zk-compression-details)
- [Troubleshooting](#troubleshooting)
- [Development Roadmap](#development-roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Overview

cPOP Interface is a Next.js application designed to leverage Solana's ZK Compression technology for distributing proof of participation tokens at significantly reduced costs. The platform enables event organizers, DAOs, and communities to create and distribute participation rewards to their members without the prohibitive costs associated with traditional token minting and distribution.

## Key Features

- **Create Compressed Token Campaigns**: Set up campaigns with custom metadata and token economics
- **Distribute at Scale**: Send tokens to thousands of participants cost-effectively (up to 1000x cheaper)
- **ZK Verification**: Verify participation with zero-knowledge proofs for enhanced privacy
- **Participant Dashboard**: View and manage earned reward tokens
- **Solana Pay Integration**: Redeem tokens for real-world benefits and rewards
- **Campaign Analytics**: Track distribution metrics and participant engagement
- **Wallet Integration**: Seamless connection with popular Solana wallets

## Architecture

The application follows a modern web architecture:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Next.js UI     │────▶│  Solana         │────▶│  ZK Compression │
│  Components     │     │  Integration    │     │  Services       │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │                       │
        │                        │                       │
        ▼                        ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                  Solana Blockchain (Dev/Mainnet)                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Cost Benefits of ZK Compression

By leveraging ZK Compression on Solana, this platform enables:
- **Up to 1000x cheaper token operations** compared to traditional SPL tokens
- **Significantly reduced gas fees** for mass distributions
- **Ability to scale to millions of participants** without prohibitive costs
- **Minimal on-chain footprint** while maintaining verifiability

A typical distribution of 10,000 tokens:
- Traditional SPL Tokens: ~20 SOL (~$2000)
- Compressed Tokens: ~0.02 SOL (~$2)

## Technology Stack

- **Frontend**:
  - Next.js 14.x with App Router
  - TypeScript for type safety
  - Tailwind CSS for styling
  - React Hooks for state management

- **Blockchain**:
  - Solana (devnet/mainnet)
  - @solana/web3.js for blockchain interaction
  - @solana/wallet-adapter for wallet connections

- **ZK Compression**:
  - Light Protocol's compressed token libraries
  - State compression algorithms

- **RPC Provider**:
  - Helius for enhanced Solana RPC access
  - Custom RPC fallback mechanism

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Solana CLI (optional for local testing)
- A Solana wallet (Phantom, Solflare, etc.)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/cpop-interface.git
cd cpop-interface
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser (or http://localhost:3001 if port 3000 is already in use).

### Environment Variables

Create a `.env.local` file in the root directory with the following:

```
# Required: Solana RPC URLs
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_HELIUS_RPC_URL=https://your-helius-rpc-url.helius.xyz/api/v0

# Optional: Analytics and monitoring
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_TESTNET=true
NEXT_PUBLIC_ENABLE_MAINNET=false
```

## Usage Guide

### Creating a Campaign

1. Connect your Solana wallet using the button in the header
2. Navigate to the "Create Campaign" page
3. Fill in the campaign details:
   - Campaign name and description
   - Token name and symbol
   - Total supply
   - Distribution parameters
   - End date
   - Optional: upload campaign image
4. Review and confirm the details
5. Approve the transaction with your wallet
6. Your campaign will be created and you'll be redirected to the campaign details page

### Distributing Tokens

1. Navigate to your campaign details page
2. Click on "Distribute Tokens"
3. Choose one of the distribution methods:
   - Manual entry: Enter wallet addresses and amounts
   - CSV upload: Upload a CSV file with addresses and amounts
   - API integration: Use the provided API endpoint
4. Review the distribution details
5. Approve the transaction with your wallet
6. Monitor the distribution progress in real-time

### Viewing Rewards

1. Connect your wallet
2. Navigate to "My Rewards"
3. View all compressed tokens you've received
4. Filter by campaign or token type
5. View detailed information about each reward
6. Redeem or transfer tokens as needed

## Application Structure

```
├── app/                      # Next.js App Router
│   ├── campaigns/            # Campaign-related pages
│   ├── components/           # Reusable UI components
│   ├── lib/                  # Utility functions and hooks
│   ├── rewards/              # Reward management pages
│   └── services/             # External service integrations
├── public/                   # Static assets
└── ...config files
```

## Component Architecture

The application uses a component-based architecture:

- **Layout Components**: Define the overall structure of the app
- **Page Components**: Represent individual routes and pages
- **Feature Components**: Implement specific features (campaign creation, token distribution)
- **UI Components**: Reusable UI elements (buttons, cards, forms)
- **Provider Components**: Provide context and state to child components

## Solana Integration

The application integrates with Solana using:

- **Wallet Adapter**: For connecting to user wallets
- **Transaction Building**: Custom transaction building for compressed token operations
- **State Management**: For tracking transaction status and user balances
- **RPC Communication**: For querying the blockchain state

## ZK Compression Details

This platform utilizes ZK Compression techniques to:

1. **Compress Token Data**: Reduce on-chain storage requirements
2. **Bundle Transactions**: Combine multiple operations into single transactions
3. **Verify Authenticity**: Use zero-knowledge proofs to verify token validity
4. **Maintain Privacy**: Allow selective disclosure of participation details

## Troubleshooting

### Common Issues

#### "Wallet Not Connected" Error
- Ensure your browser has a Solana wallet extension installed
- Check that you've approved the connection request
- Try refreshing the page and reconnecting

#### Transaction Failed
- Check your wallet has sufficient SOL for gas fees
- Verify you're connected to the correct network (devnet/mainnet)
- Inspect the transaction in Solana Explorer for detailed error information

#### Page Doesn't Load
- Clear browser cache and cookies
- Update to the latest wallet extension version
- Try a different browser

### Getting Help

If you encounter issues not covered here:
- Check the GitHub issues page
- Join our Discord community for support
- Submit a detailed bug report with steps to reproduce

## Development Roadmap

### Current Status

This project is in active development. The current implementation includes:

- Complete UI for campaign creation, management, and token distribution
- Integration with Solana wallet adapters
- ZK Compression implementation for token creation and distribution

### Future Enhancements

#### Q2 2024
- Enhanced analytics dashboard for campaign organizers
- Integration with more identity verification systems

#### Q3 2024
- Mobile app for easier reward claiming and usage
- Support for token marketplaces and trading

#### Q4 2024
- Multi-chain support (Ethereum, etc.)
- DAO governance tools for campaign management

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please ensure your code follows our coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Solana Foundation](https://solana.com/) for blockchain infrastructure
- [Light Protocol](https://www.lightprotocol.com/) for ZK Compression technology
- [Helius](https://helius.xyz/) for enhanced RPC capabilities
- All contributors who have helped shape this project

---

Built for the ZK Compression track as part of the Solana hackathon.

For questions or support, contact us at support@example.com # Sol-Breakout-ZK
