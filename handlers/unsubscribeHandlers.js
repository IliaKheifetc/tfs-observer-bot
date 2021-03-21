const hasuraDataSource = require("../dataSources/hasuraDataSource");
const {
  convertArrayToDbFormat,
  getSubscriberFromState,
  getSubscriberChatData,
  hasSubscription,
} = require("../utils");
const { SUBSCRIPTION_TYPES } = require("../constants");

const createUnsubscribeHandler = ({
  state,
  subscriptionTypeId,
  subscriptionDescription,
}) => async (ctx) => {
  const subscriber = getSubscriberFromState(state, ctx);

  if (!subscriber || !hasSubscription(subscriber, subscriptionTypeId)) {
    await ctx.reply("Вы не были ранее подписаны на данные оповещения");
    return;
  }

  const newSubscriptions = Array.from(subscriber.subscriptions).filter(
    (subscriptionId) => subscriptionId !== subscriptionTypeId
  );

  try {
    const { errors } = await hasuraDataSource.updateSubscriber(subscriber.id, {
      subscriptions: convertArrayToDbFormat(newSubscriptions),
    });
    if (errors) {
      throw new Error(errors);
    }

    subscriber.subscriptions.delete(subscriptionTypeId);

    ctx.reply("Вы успешно отписались");
  } catch (e) {
    console.log(
      `error occurred when unsubscribing from ${subscriptionDescription} events`,
      e
    );
  }
};

module.exports = ({ bot, state }) => {
  bot.command(
    "/unsubscribe_from_us_transitions",
    createUnsubscribeHandler({
      state,
      subscriptionTypeId:
        SUBSCRIPTION_TYPES.userStoryTransitionedFromStagingToClosed,
      subscriptionDescription: `"user stories transiotions"`,
    })
  );

  bot.command(
    "/unsubscribe_from_w_i_created",
    createUnsubscribeHandler({
      state,
      subscriptionTypeId: SUBSCRIPTION_TYPES.workItemCreated,
      subscriptionDescription: `"work items created"`,
    })
  );

  bot.command(
    "/unsubscribe_from_pr_comments",
    createUnsubscribeHandler({
      state,
      subscriptionTypeId: SUBSCRIPTION_TYPES.pullRequestCommentAddedOrEdited,
      subscriptionDescription: `"pull request commented on/edited/deleted"`,
    })
  );
};
