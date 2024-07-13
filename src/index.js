const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const port = 3000;

const allowedChains = ["alfajores", "rootstock"];

app.use(express.json());

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

// Endpoint to send a warp message
app.post("/send-warp-message", (req, res) => {
  const { amount, origin, destination, recipient } = req.body;

  if (!amount) {
    return res.status(400).send("amount is required");
  }

  const config = path.join(__dirname, "../", process.env.WARP_CONFIG_PATH);
  console.log("config = ", config);
  const command = `hyperlane warp send --relay --amount ${amount} --warp ${config} --origin ${origin} --destination ${destination} --recipient ${recipient}`;
  console.log("Executing command:", command);

  streamCommand(command, res);
});

// Endpoint to send a message
app.post("/send-message", (req, res) => {
  const { origin, destination, body } = req.body;

  if (!allowedChains.includes(origin) || !allowedChains.includes(destination)) {
    return res
      .status(400)
      .send(
        "Invalid origin or destination. Allowed chains are: " +
          allowedChains.join(", ")
      );
  }

  if (!body) {
    return res.status(400).send("body is required");
  }

  const command = `hyperlane send message --origin ${origin} --destination ${destination} --body "${body}" --relay`;
  console.log("Executing command:", command);

  streamCommand(command, res);
});

// Test endpoint
app.get("/test", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
