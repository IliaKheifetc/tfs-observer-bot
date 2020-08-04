const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN, {
  // Telegram options
  agent: null, // https.Agent instance, allows custom proxy, certificate, keep alive, etc.
  webhookReply: true // Reply via webhook
});

bot.command("/hello", ctx => {
  ctx.reply("How are you doing?");
});

bot.startWebhook(
  "/d3cf3429a76b8ef1d2d94d826c27a7e2a04e8f10d5c6ec494e2055baea9bef17",
  null,
  4500
);
bot.telegram.setWebhook(
  "https://tfs-observer-telegram-bot.herokuapp.com/telegraf/d3cf3429a76b8ef1d2d94d826c27a7e2a04e8f10d5c6ec494e2055baea9bef17"
);

// bot.launch({
//   webhook: {
//     domain:
//       "https://tfs-observer-telegram-bot.herokuapp.com/telegraf/d3cf3429a76b8ef1d2d94d826c27a7e2a04e8f10d5c6ec494e2055baea9bef17",
//     port: 4500
//   }
// });
