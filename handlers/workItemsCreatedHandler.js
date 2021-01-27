const workItemsCreatedHandler = ({ bot, state: { subscribers } }) => {
  bot.on("text", async function(ctx) {
    const {
      publisherId,
      message: { text, html } = {},
      resource: { url } = {}
    } = ctx.update || {};
    if (publisherId !== "tfs") {
      return;
    }

    console.log("ctx", ctx);
    console.log("ctx.update", ctx.update);

    console.log("bot.telegram.sendMessage", bot.telegram.sendMessage);
    console.log({ subscribers });

    try {
      subscribers.forEach(async subscriber => {
        await bot.telegram.sendMessage(subscriber.chatId, html, {
          parse_mode: "HTML"
        });
      });
    } catch (e) {
      console.error("error", e);
    }
  });
};

module.exports = {
  workItemsCreatedHandler
};
