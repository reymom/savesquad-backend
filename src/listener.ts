import Web3 from "web3";
import {
  USDC_ABI,
  USDC_ADDRESSES,
  WSS_PROVIDERS,
  HYPERLANE_RELAYER,
} from "./config";
import { handleTransferEvent } from "./utils";

export const startListening = async (
  chain: keyof typeof USDC_ADDRESSES,
  warpConfig: string
) => {
  try {
    const providerUrl = WSS_PROVIDERS[chain];
    const usdcAddress = USDC_ADDRESSES[chain];

    const web3 = new Web3(providerUrl);
    const networkId = await web3.eth.net.getId();
    console.log(`${chain} networkId = `, networkId);

    const usdcContract = new web3.eth.Contract(USDC_ABI, usdcAddress!);

    const subscription = usdcContract.events.Transfer({
      filter: { to: HYPERLANE_RELAYER },
    });

    // Create a dummy response object for logging
    const res = {
      write: console.log,
      end: () => console.log("Stream ended"),
      setHeader: () => {},
      status: () => res,
      send: console.log,
    };
    subscription.on("data", async (event: any) => {
      handleTransferEvent(event, chain, warpConfig, res);
    });

    subscription.on("error", (error: any) => {
      console.error(`Error on ${chain} event`, error);
    });

    const unsubscribe = async () => {
      console.log(`Unsubscribing from ${chain} events...`);
      await subscription.unsubscribe();
    };

    process.on("SIGINT", async () => {
      await unsubscribe();
      process.exit();
    });

    process.on("SIGTERM", async () => {
      await unsubscribe();
      process.exit();
    });
  } catch (error) {
    console.error(`Error starting ${chain} listener:`, error);
  }
};
