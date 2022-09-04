import {db} from "../helper/db.js";

export interface Settings {
  welcomeMessage: string;
}

export const settingsCollection = db.collection<Settings>("settings");
