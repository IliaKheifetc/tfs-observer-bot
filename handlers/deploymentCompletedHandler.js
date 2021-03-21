module.exports = ({ app: fastifyInstance, bot, state }) => {
  fastifyInstance.post("/deploymentCompleted", (req, reply) => {
    console.log("req.body", req.body);
    const { createdDate, detailedMessage } = req.body;

    state.subscribers.forEach(async subscriber => {
      try {
        await bot.telegram.sendMessage(
          subscriber.chatId,
          `${detailedMessage.html}\n${createdDate}`,
          {
            parse_mode: "HTML"
          }
        );
      } catch (e) {
        console.error(
          "error occurred when sending notification about completed deployment",
          e
        );
      }
    });

    reply.code(200).send();
  });
};
