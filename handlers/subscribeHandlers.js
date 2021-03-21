const hasuraDataSource = require("../dataSources/hasuraDataSource");
const { addSubscriber, updateSubscriber } = require("../graphql/mutations");

const { SUBSCRIPTION_TYPES } = require("../constants");
const {
  getSubscriberFromState,
  getSubscriberChatData,
  hasSubscription,
} = require("../utils");

const addOrUpdateSubscriber = ({
  subscriber,
  subscriberChatData = {},
  subscriptionTypeId,
  state,
}) => {
  if (subscriber) {
    subscriber.subscriptions.add(subscriptionTypeId);
    const newSubscriptions = `{${Array.from(subscriber.subscriptions).join(
      ","
    )}}`;

    // return hasuraDataSource.post(updateSubscriber, "ModifySubscribers", {
    //   id: subscriber.id,
    //   subscriptions: newSubscriptions,
    // });

    return hasuraDataSource.updateSubscriber(subscriber.id, {
      subscriptions: newSubscriptions,
    });
  }

  // return hasuraDataSource.post(addSubscriber, "ModifySubscribers", {
  //   objects: [
  //     {
  //       id: ++state.currentMaxId, //uuidv4(),
  //       chatId,
  //       name:
  //         firstName || lastName || username
  //           ? [firstName, lastName, username].filter(Boolean).join(" ")
  //           : "new_subscriber",
  //       // subscribe to userStoryTransitionedFromStagingToClosed by default, for now
  //       subscriptions: `{${subscriptionId}}`,
  //     },
  //   ],
  // });

  const { id: chatId, firstName, lastName, username } = subscriberChatData;

  const newSubscriber = {
    id: ++state.currentMaxId,
    chatId,
    name:
      firstName || lastName || username
        ? [firstName, lastName, username].filter(Boolean).join(" ")
        : "new_subscriber",

    subscriptions: new Set([subscriptionTypeId]),
  };

  state.subscribers.push(newSubscriber);

  return hasuraDataSource.addSubscriber({
    ...newSubscriber,
    subscriptions: `{${subscriptionTypeId}}`,
  });
};

const createSubscribeHandler = ({
  commandName,
  state,
  subscriptionTypeId,
}) => async (ctx) => {
  const subscriber = getSubscriberFromState(state, ctx);
  const subscriberChatData = getSubscriberChatData(ctx);
  const getSubscriberId = () => {
    const newValue = ++state.currentMaxId;

    return newValue;
  };

  // TODO: what is the best place to put that check??
  if (subscriber && hasSubscription(subscriber, subscriptionTypeId)) {
    return ctx.reply("Вы уже подписаны");
  }

  try {
    const response = await addOrUpdateSubscriber({
      subscriber,
      subscriberChatData,
      subscriptionTypeId,
      state,
    });

    if (response.errors) {
      throw new Error(response.errors);
    }

    ctx.reply("Вы успешно подписались");
  } catch (e) {
    console.error(`Error when running "${commandName}" command handler`, e);
  }
};

module.exports = ({ bot, state }) => {
  bot.command("/subscribe", async (ctx) => {
    const {
      id: chatId,
      first_name: firstName = "",
      last_name: lastName = "",
      username = "",
    } = ctx.chat || {};

    const hasSomeSubscription = state.subscribers.some(
      (subscriber) => subscriber.chatId === chatId
    );

    if (hasSomeSubscription) {
      // ctx.reply("Вы уже подписаны");
      //
      // return;
    }

    state.subscribers.push({ chatId });

    try {
      const response = await hasuraDataSource.post(
        addSubscriber,
        "ModifySubscribers",
        {
          objects: [
            {
              id: ++state.currentMaxId, //uuidv4(),
              chatId,
              name:
                firstName || lastName || username
                  ? [firstName, lastName, username].filter(Boolean).join(" ")
                  : "new_subscriber",
              // subscribe to userStoryTransitionedFromStagingToClosed by default, for now
              subscriptions: `{
                ${SUBSCRIPTION_TYPES.userStoryTransitionedFromStagingToClosed}
              }`,
            },
          ],
        }
      );

      if (response.errors) {
        throw new Error(response.errors);
      }
    } catch (e) {
      console.error("error", e);
    }

    ctx.reply("Вы успешно подписались");
  });

  bot.command(
    "/subscribe_to_us_transitions",
    createSubscribeHandler({
      commandName: "subscribe_to_us_transitions",
      state,
      subscriptionTypeId:
        SUBSCRIPTION_TYPES.userStoryTransitionedFromStagingToClosed,
    })
  );

  bot.command(
    "/subscribe_to_work_items_created",
    createSubscribeHandler({
      commandName: "subscribe_to_work_items_created",
      state,
      subscriptionTypeId: SUBSCRIPTION_TYPES.workItemCreated,
      // errorMessage:
      //   "error when handling subscribe_to_work_items_created command",
    })
  );

  bot.command(
    "/subscribe_to_pr_comments",
    createSubscribeHandler({
      commandName: "subscribe_to_pr_comments",
      state,
      subscriptionTypeId: SUBSCRIPTION_TYPES.pullRequestCommentAddedOrEdited,
    })
  );
};
