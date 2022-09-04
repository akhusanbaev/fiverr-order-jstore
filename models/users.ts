import {db} from "../helper/db.js";
import {ObjectId} from "mongodb";

export interface Users {
  _id: ObjectId;
  telegramId: number;
  firstName: string;
  regDate: Date;
}

export const usersCollection = db.collection<Users>("users");
