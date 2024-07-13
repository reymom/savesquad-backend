const express = require("express");
const { exec } = require("child_process");
const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const port = 3000;

// Replace with your USDC contract address and ABI
const usdcAddress = process.env.USDC_CELO_ADDRESS;
const usdcAbi = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

// Replace with your Celo provider URL
const provider = new ethers.providers.JsonRpcProvider(
  process.env.CELO_INFURA_URL
);
const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, provider);

const streamCommand = (command, res) => {
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

usdcContract.on("Transfer", async (from, to, value, event) => {
  console.log(
    `Transfer detected: from ${from}, to ${to}, value ${value.toString()}`
  );

  const recipient = to;
  const amount = value;

  const command = `hyperlane warp send --relay --amount ${amount.toString()} --warp ${
    process.env.WARP_CONFIG_PATH
  } --origin celo --destination rootstock --recipient ${recipient}`;
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
