import mongoose from "mongoose";
import config from "./env";

export async function connectDB(): Promise<void> {
  await mongoose.connect(config.mongodbUri, {
    dbName: config.mongodbDb
  });
}

export async function closeDB(): Promise<void> {
  await mongoose.disconnect();
}
