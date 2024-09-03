import mongoose from "mongoose";
import dotenv from "dotenv";
import { Logging } from "../lib/utils";

dotenv.config();

async function main() {
  Logging.info("trying to connect to mongodb...");
  await mongoose.connect(process.env.MONGODB_URI as string);
  Logging.info("connect to mongodb was open");
}

main();
