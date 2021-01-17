const { Telegraf } = require("telegraf");
const Telegram = require("telegraf/telegram");
const express = require("express");
const moment = require("moment-timezone");

const { BOT_TOKEN, DEFAULT_CHAT_IDS, PORT } = process.env;

const telegram = new Telegram(BOT_TOKEN);

let chatsToNotify = DEFAULT_CHAT_IDS
  ? [...DEFAULT_CHAT_IDS.split(",").map(item => item.trim())]
  : [];

const expressApp = express();

const bot = new Telegraf(BOT_TOKEN, {
  // Telegram options
  agent: null, // https.Agent instance, allows custom proxy, certificate, keep alive, etc.
  webhookReply: false // Reply via webhook
});

bot.telegram.setWebhook(
  "https://tfs-observer-telegram-bot.herokuapp.com/telegraf/07e4f521f4a38e9e50e08b3f8525efe23fc556fa9b6cb75ad2b987a612fce3e9"
);

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

expressApp.use(
  bot.webhookCallback(
    "/telegraf/07e4f521f4a38e9e50e08b3f8525efe23fc556fa9b6cb75ad2b987a612fce3e9"
  )
);
expressApp.use(express.json());

expressApp.get("/", (req, res) => res.send("Hello World!"));

expressApp.post("/deploymentCompleted", (req, res) => {
  console.log("req.body", req.body);
  const { createdDate, detailedMessage } = req.body;

  chatsToNotify.forEach(async chatId => {
    await telegram.sendMessage(
      chatId,
      `${detailedMessage.html}\n${createdDate}`,
      {
        parse_mode: "HTML"
      }
    );
  });

  res.status(200).end();
});

expressApp.post("/pullRequestCommentPosted", (req, res) => {
  console.log("req.body", req.body);
  const {
    createdDate,
    message: { html },
    resource: {
      comment: { author, content, publishedDate }
    }
  } = req.body;

  const formattedDate = moment(publishedDate)
    .tz("Europe/Moscow")
    .format("DD.MM.YYYY HH:mm");

  chatsToNotify.slice(0, 2).forEach(async chatId => {
    await telegram.sendMessage(
      chatId,
      `${html}: "${content}", \n${formattedDate}`,
      {
        parse_mode: "HTML"
      }
    );
  });

  res.status(200).end();
});

expressApp.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});
