# SaveSquad Backend

## Project Overview

This project is a backend service for managing and interacting with various blockchain networks. It also contains the smart contracts for our protocol and the configurations for deploying the hyperlane contracts and warp routes.

It contains a backend service that listens for `Transfer` events of USDC on different networks and initiates cross-chain transfers using Hyperlane warp routes. It is used in [ethglobal2024frontend](https://github.com/enjojoy/ethglobal2024frontend).

This is a project created for the Hackathon of ETH Global Brussels 2024.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js
- npm or yarn
- TypeScript
- ts-node

### Installation

1. Clone the repository:

```sh
git clone https://github.com/reymom/savesquad-backend.git
cd savesquad-backend
```

2. Install dependencies:

```sh
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following environment variables:

```sh
HYP_KEY=relayer-private-key
WARP_CONFIG_PATH=configs/warp_routes/USDC/alfajores-arbitrumsepolia-basesepolia-rootstock-config.yaml
INFURA_API_KEY=your-api-key
ALCHEMY_API_KEY=your-api-key
```

### Running the Project

To start listening for Transfer events and handle cross-chain transfers:

```sh
npx ts-node src/index.ts
```

### Project Components

`configs/`
Contains configuration files for Hyperlane and warp routes.

`contracts/`

- `SaveSquad.sol`: SaveSquad main contract.
- `Staking.sol`: Staking contract for the pools in SaveSquad.
- `WtRBTC.sol`: Wrapped `tRBTC` contract. Used for testing warp routes.
- `WUSDC.sol`: Wrapped `USDC` contract deployed in Rootstock.

`src/`
The backend service that simulates the relayer, listens to transactions and acts as the bridge using hyperlane warp routes.
