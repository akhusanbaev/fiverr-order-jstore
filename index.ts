import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import {ADMIN_TELEGRAM_ID, PORT} from "./helper/config.js";
import {bot} from "./helper/bot.js";
import {settingsCollection} from "./models/settings.js";
import {InlineKeyboardMarkup} from "node-telegram-bot-api";
import {usersCollection} from "./models/users.js";
import {ObjectId} from "mongodb";
import {adminsCollection} from "./models/admins.js";
import {Mailer} from "./helper/Mailer.js";


const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get(`/`, (req, res) => {
  res.send(`HELLO WORLD!`)
})

const mainMenuInlineKeyboard: InlineKeyboardMarkup = {
  inline_keyboard: [
    [{text: `📃 Rules`, callback_data: "rules"}, {text: `📣 Channel`, url: "https://t.me/+TFMP-NdVnsNc11pS"}],
    [{text: `📢 Help`, url: "https://t.me/ozgur_bbh"}, {text: `🏪 Store`, url: "https://t.me/+TFMP-NdVnsNc11pS"}]
  ]
};

adminsCollection.findOne().then(res => {
  if (res) return;
  adminsCollection.insertOne({telegramId: ADMIN_TELEGRAM_ID, state: ""}).catch(console.log);
}).catch(console.log);
settingsCollection.findOne().then(res => {
  if (res) return;
  settingsCollection.insertOne({welcomeMessage: "Welcome!"}).catch(console.log);
}).catch(console.log);

bot.on("message", async msg => {
  try {
    if (!msg.from) return;
    if (msg.chat.type !== "private") return;
    const user = await usersCollection.findOne({telegramId: msg.chat.id});
    if (!user) await usersCollection.insertOne({telegramId: msg.chat.id, _id: new ObjectId(), regDate: new Date(), firstName: msg.from.first_name});
    if (msg.text && msg.text === "/start") {
      const settings = await settingsCollection.findOne();
      if (!settings) return;
      return bot.sendMessage(msg.chat.id, settings.welcomeMessage, {reply_markup: mainMenuInlineKeyboard});
    }
    const admin = await adminsCollection.findOne({telegramId: msg.chat.id});
    if (!admin) return ;
    if (msg.text && msg.text === "/edit_msg") {
      await adminsCollection.updateOne({_id: admin._id}, {$set: {state: "edit-msg"}});
      return bot.sendMessage(msg.chat.id, "Send a new message which will appear on the main page");
    }
    if (msg.text && msg.text === "/mail") {
      await adminsCollection.updateOne({_id: admin._id}, {$set: {state: "mail"}});
      return bot.sendMessage(msg.chat.id, "Send here a message which will be mailed to users");
    }
    if (admin.state === "edit-msg") {
      const settings = await settingsCollection.findOne();
      if (!settings) return;
      await settingsCollection.updateOne({_id: settings._id}, {$set: {welcomeMessage: msg.text}});
      await adminsCollection.updateOne({_id: admin._id}, {$set: {state: ""}});
      return bot.sendMessage(msg.chat.id, "Updated");
    }
    if (admin.state === "mail") {
      const mailer = new Mailer(bot);
      mailer.mail(msg.chat.id, msg.message_id);
      await adminsCollection.updateOne({_id: admin._id}, {$set: {state: ""}});
      return bot.sendMessage(msg.chat.id, "Mailing has been started!");
    }
  } catch (e) {
    console.log(e);
  }
});

bot.on("callback_query", async query => {
  try {
    if (!query.message) return;
    if (query.data === "rules") return bot.sendMessage(query.message.chat.id, `Check time 15mins only\nNo 16 or 17\nIdc if ya cooking or riding or driving\nIf ya busy lmk when to send log\nAfter 15mins what so ever you are on your own.\n\nUse good sock\nOther vpn’s are tripping\n\nCARRIER PIN IS NEVER GUARANTEED UNLESS MENTIONED (checked)\nAnd for spammer\n\nIf ya a spammer who has no shop to sell\n\nCome at me\nPayment after 24hrs\nLog should be good no resell one complain and ya ass will be kicked out of here\nIts a small community but respectfully treats like family\n\nIf i see your sent log posted other places I’llremove it from our store\n\nI would rather sell my own shit other than yours.\n\nNo fucking brotherhood,\nIf ya good to me and i am good to you we in strict business\n\nThanks to all member in our store for being here looking forward to it`, {reply_markup: {inline_keyboard: [[{text: `🌐 Menu`, callback_data: "exit"}]]}});
    if (query.data === "exit") {
      const settings = await settingsCollection.findOne();
      if (!settings) return;
      return bot.sendMessage(query.message.chat.id, settings.welcomeMessage, {reply_markup: mainMenuInlineKeyboard});
    }
  } catch (e) {
    console.log(e);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
