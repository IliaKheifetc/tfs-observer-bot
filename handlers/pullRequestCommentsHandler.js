const { formatDate } = require("../utils");
const { hasSubscription } = require("../utils");
const { SUBSCRIPTION_TYPES } = require("../constants");

module.exports = ({ app: fastifyInstance, bot, state }) => {
  fastifyInstance.post("/pullRequestCommentPosted", (req, reply) => {
    console.log("req.body", req.body);
    const {
      createdDate,
      message: { html },
      resource: {
        comment: {
          author,
          content,
          isDeleted: isCommentDeleted,
          publishedDate,
        },
        pullRequest: { createdBy },
      },
    } = req.body;

    const formattedDate = formatDate(publishedDate);

    console.log("state.subscribers", state.subscribers);

    state.subscribers.forEach(async (subscriber) => {
      if (
        !hasSubscription(
          subscriber,
          SUBSCRIPTION_TYPES.pullRequestCommentAddedOrEdited
        )
      ) {
        return;
      }

      const message = isCommentDeleted
        ? `${html}, \n${formattedDate}`
        : `${html}: "${content}", \n${formattedDate}`;

      try {
        await bot.telegram.sendMessage(subscriber.chatId, message, {
          parse_mode: "HTML",
        });
      } catch (e) {
        console.error(
          "error occurred when sending notification about pr comment",
          e
        );
      }
    });

    reply.code(200).send();
  });
};
