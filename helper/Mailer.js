import { usersCollection } from "../models/users.js";
export class Mailer {
    constructor(bot) {
        this.bot = null;
        this.bot = bot;
    }
    mail(from_chat_id, message_id) {
        usersCollection.find().map(u => u.telegramId).toArray().then((uid) => {
            if (!uid.length)
                return;
            for (let i = 0; i < uid.length; i++) {
                this.bot.copyMessage(uid[i], from_chat_id, message_id).catch(() => { return; });
            }
        }).catch(console.log);
    }
}
