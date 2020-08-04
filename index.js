const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command("/hello", ctx => {
  ctx.reply("How are you doing?");
});

bot.hears(/.*/, async (ctx, next) => {
  const { publisherId } = ctx.update || {};
  if (publisherId !== "tfs") {
    return;
  }
  console.log("ctx", ctx);
  console.log("ctx.update", ctx.update);
  const {
    message: { text, html },
    resource: { url }
  } = ctx.update;

  await ctx.reply("Text:" + text);
  await ctx.reply("HTML:" + html);
  await ctx.reply("Url:" + url);

  await next();
});

bot.telegram.setWebhook(
  "https://tfs-observer-telegram-bot.herokuapp.com/telegraf/07e4f521f4a38e9e50e08b3f8525efe23fc556fa9b6cb75ad2b987a612fce3e9"
);

bot.startWebhook(
  "/telegraf/07e4f521f4a38e9e50e08b3f8525efe23fc556fa9b6cb75ad2b987a612fce3e9",
  null,
  process.env.PORT
);
