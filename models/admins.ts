import {db} from "../helper/db.js";

export interface Admins {
  telegramId: number;
  state: any;
}

export const adminsCollection = db.collection<Admins>("admins");
