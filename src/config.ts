import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const USDC_ADDRESSES = {
  alfajores: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B",
  arbitrumsepolia: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  basesepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};

export const WSS_PROVIDERS = {
  alfajores: "wss://alfajores-forno.celo-testnet.org/ws",
  arbitrumsepolia: `wss://arbitrum-sepolia.infura.io/ws/v3/${process.env.INFURA_API_KEY}`,
  basesepolia: `wss://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
};

export const HYPERLANE_RELAYER = "0x632b39e5fe4eaafdf21601b2bc206ca0f602c85a";

export const USDC_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
];
