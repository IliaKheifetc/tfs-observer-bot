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

    console.log("workItemsCreatedHandler subscribers", subscribers);

    subscribers.forEach(async subscriber => {
      try {
        await bot.telegram.sendMessage(subscriber.chatId, html, {
          parse_mode: "HTML"
        });
      } catch (e) {
        console.error("error occurred when notifying about new work item: ", e);
      }
    });
  });
};

module.exports = {
  workItemsCreatedHandler
};
