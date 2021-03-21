const { hasSubscription } = require("../utils");
const { SUBSCRIPTION_TYPES } = require("../constants");

const workItemsCreatedHandler = ({ app, bot, state: { subscribers } }) => {
  app.post("/workItemCreated", async (req, res) => {
    const {
      publisherId,
      message: { text, html } = {},
      resource: { url } = {},
    } = req.body || {};

    if (publisherId !== "tfs") {
      return;
    }

    console.log({ req });

    console.log("workItemCreatedHandler subscribers", subscribers);

    subscribers.forEach(async (subscriber) => {
      if (!hasSubscription(subscriber, SUBSCRIPTION_TYPES.workItemCreated)) {
        console.log("Subscriber is not subscribed ", subscriber);

        return;
      }

      try {
        await bot.telegram.sendMessage(subscriber.chatId, html, {
          parse_mode: "HTML",
        });
      } catch (e) {
        console.error("error occurred when notifying about new work item: ", e);
      }
    });

    res.code(200).send();
  });
};

module.exports = workItemsCreatedHandler;
