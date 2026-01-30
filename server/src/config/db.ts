import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

const connectDb = async () => {
  try {
    await mongoose.connect(MONGO_URL as string);
    console.log("Connnected to db");
  } catch (er) {
    console.log("Mongo Connection Error :", er);
    process.exit(1);
  }
};

export default connectDb;
