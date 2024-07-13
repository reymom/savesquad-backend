import { spawn } from "child_process";

export const streamCommand = (command: string, res: any) => {
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

export const handleTransferEvent = async (
  event: any,
  chain: string,
  warpConfig: string,
  res: any
) => {
  const { from, to, value } = event.returnValues;
  console.log(
    `Transfer detected on ${chain}: from ${from}, to ${to}, value ${value}`
  );

  const command = `hyperlane warp send --relay --amount ${value} --warp ${warpConfig} --origin ${chain} --destination rootstock --recipient ${from}`;
  console.log("Executing command:", command);

  streamCommand(command, res);
};
