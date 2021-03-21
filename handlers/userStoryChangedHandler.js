const { debounce } = require("lodash");
const tfsDataSource = require("../dataSources/tfsDataSource");

const { hasSubscription } = require("../utils");
const { SUBSCRIPTION_TYPES } = require("../constants");

const checkIfStagingIsVacantAndNotify = async (bot, subscribers) => {
  const stagingUserStories = await tfsDataSource.getStagingUserStories();

  if (!Array.isArray(stagingUserStories) || stagingUserStories.length > 0) {
    return;
  }

  subscribers.forEach(async (subscriber, index) => {
    if (
      !hasSubscription(
        subscriber,
        SUBSCRIPTION_TYPES.userStoryTransitionedFromStagingToClosed
      )
    ) {
      console.log("Subscriber is not subscribed ", subscriber);
      return;
    }

    try {
      bot.telegram.sendMessage(subscriber.chatId, "Staging свободен!");
    } catch (e) {
      console.error(
        "error occurred when sending notification about US transition Staging -> Closed",
        e
      );
    }
  });
};

const debouncedCheckStagingAndNotify = debounce(
  checkIfStagingIsVacantAndNotify,
  4000
);

const userStoryChangedHandler = ({ app, bot, state: { subscribers } }) => {
  app.post("/userStoryChanged", async (req, res) => {
    const {
      message: { html } = {},
      resource: { _links, fields = {} } = {},
    } = req.body;

    for (let prop in fields) {
      console.log(prop, fields[prop]);
    }

    const hasTransitionedFromStagingToClosed = Object.keys(fields).some(
      (fieldKey) =>
        fieldKey.includes("Kanban.Column") &&
        fields[fieldKey].oldValue === "Staging" &&
        fields[fieldKey].newValue === "Closed"
    );

    console.log({
      hasTransitionedFromStagingToClosed,
    });

    if (!hasTransitionedFromStagingToClosed) {
      res.code(200).send();
      return;
    }

    subscribers.forEach(async (subscriber) => {
      if (
        !hasSubscription(
          subscriber,
          SUBSCRIPTION_TYPES.userStoryTransitionedFromStagingToClosed
        )
      ) {
        console.log("Subscriber is not subscribed ", subscriber);
        return;
      }

      try {
        await bot.telegram.sendMessage(subscriber.chatId, html, {
          parse_mode: "HTML",
        });
      } catch (e) {
        console.error(
          "error occurred when sending notification about US transition Staging -> Closed",
          e
        );
      }
    });

    debouncedCheckStagingAndNotify(bot, subscribers);

    res.code(200).send();
  });
};

module.exports = userStoryChangedHandler;
