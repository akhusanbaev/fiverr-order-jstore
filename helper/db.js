import { MongoClient } from "mongodb";
import { MONGO_URI } from "./config.js";
export const db = new MongoClient(MONGO_URI).db("fiverr-order-jstore");
