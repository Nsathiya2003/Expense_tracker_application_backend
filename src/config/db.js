import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

console.log("process.env----", process.env.MONGODB_URL);
export const ConnectDB = async () => {
  if (isConnected) return;

  try {
    const connect = mongoose.connect(process.env.MONGODB_URL, {});
    console.log("Database connected");
  } catch (err) {
    console.log("Error occured to connect database", err);
  }
};
