import { Web3 } from "web3";
import { spawn } from "child_process";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const warp_config = path.resolve(__dirname, process.env.WARP_CONFIG_PATH!);
const usdcAddressCelo = "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B";

const hyperlane_relayer = "0x632b39e5fe4eaafdf21601b2bc206ca0f602c85a";
const usdcAbi = [
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

const streamCommand = (command: string, res: any) => {
  const child = spawn("sh", ["-c", command], {
    env: { ...process.env, HYP_KEY: process.env.HYP_KEY },
  });

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Transfer-Encoding", "chunked");

  child.stdout.on("data", (data) => {
    res.write(data.toString());
  });

  child.stderr.on("data", (data) => {
    res.write(data.toString());
  });

  child.on("close", (code) => {
    res.write(`\nProcess exited with code ${code}\n`);
    res.end();
  });

  child.on("error", (err) => {
    res.status(500).send(`Failed to start subprocess: ${err.message}`);
  });
};

async function startListening() {
  try {
    const web3 = new Web3("wss://alfajores-forno.celo-testnet.org/ws");
    const networkId = await web3.eth.net.getId();
    console.log("networkId = ", networkId);

    const usdcContract = new web3.eth.Contract(usdcAbi, usdcAddressCelo!);

    const subscription = usdcContract.events.Transfer({
      filter: { to: hyperlane_relayer },
    });

    subscription.on("data", async (event: any) => {
      const { from, to, value } = event.returnValues;
      console.log(`Transfer detected: from ${from}, to ${to}, value ${value}`);

      const command = `hyperlane warp send --relay --amount ${value} --warp ${warp_config} --origin alfajores --destination rootstock --recipient ${from}`;
      console.log("Executing command:", command);

      // Create a dummy response object for logging
      const res = {
        write: console.log,
        end: () => console.log("Stream ended"),
        setHeader: () => {},
        status: () => res,
        send: console.log,
      };

      streamCommand(command, res);
    });

    subscription.on("error", (error: any) => {
      console.error("Error on event", error);
    });

    const unsubscribe = async () => {
      console.log("Unsubscribing from events...");
      await subscription.unsubscribe();
    };

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      await unsubscribe();
      process.exit();
    });

    process.on("SIGTERM", async () => {
      await unsubscribe();
      process.exit();
    });
  } catch (error) {
    console.error("Error starting listener:", error);
  }
}

startListening();
