import dotenv from "dotenv";
import path from "path";
import { startListening } from "./listener";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const warpConfig = path.resolve(
  __dirname,
  "../",
  process.env.WARP_CONFIG_PATH!
);

startListening("alfajores", warpConfig);
startListening("arbitrumsepolia", warpConfig);
startListening("basesepolia", warpConfig);
