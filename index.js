const { Telegraf } = require("telegraf");
const Telegram = require("telegraf/telegram");
const express = require("express");

const { BOT_TOKEN, DEFAULT_CHAT_IDS, PORT } = process.env;

const telegram = new Telegram(BOT_TOKEN);

let chatsToNotify = DEFAULT_CHAT_IDS ? [...DEFAULT_CHAT_IDS.split(",")] : [];

const expressApp = express();

const bot = new Telegraf(BOT_TOKEN, {
  // Telegram options
  agent: null, // https.Agent instance, allows custom proxy, certificate, keep alive, etc.
  webhookReply: false // Reply via webhook
});

bot.start(ctx => {
  console.log("default chats to notify:", chatsToNotify);

  ctx.reply(
    "Используйте команду /subscribe, чтобы подписаться на уведомление об изменениях"
  );
});

bot.command("/subscribe", ctx => {
  console.log("ctx", ctx);
  const { id: chatId } = ctx.chat || {};

  console.log("new chatId:", chatId);

  if (!chatsToNotify.includes(chatId)) {
    chatsToNotify.push(chatId);
  }
  ctx.reply("Вы успешно подписались");
});

bot.on("text", async function(ctx) {
  const { publisherId, message: { text, html } = {}, resource: { url } = {} } =
    ctx.update || {};
  if (publisherId !== "tfs") {
    return;
  }

  console.log("ctx", ctx);
  console.log("ctx.update", ctx.update);

  try {
    chatsToNotify.forEach(async chatId => {
      await telegram.sendMessage(chatId, `HTML:${html}`, {
        parse_mode: "HTML"
      });
    });
  } catch (e) {
    console.error("error", e);
  }
});

bot.telegram.setWebhook(
  "https://tfs-observer-telegram-bot.herokuapp.com/telegraf/07e4f521f4a38e9e50e08b3f8525efe23fc556fa9b6cb75ad2b987a612fce3e9"
);

expressApp.get("/", (req, res) => res.send("Hello World!"));

expressApp.post("/deploymentComplete", (req, res) => {
  console.log("req.body", req.body);

  chatsToNotify.forEach(async chatId => {
    await telegram.sendMessage(chatId, "Neptune deployment completed", {
      parse_mode: "HTML"
    });
  });

  res.status(200).end();
});

expressApp.use(
  bot.webhookCallback(
    "/telegraf/07e4f521f4a38e9e50e08b3f8525efe23fc556fa9b6cb75ad2b987a612fce3e9"
  )
);

expressApp.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});
