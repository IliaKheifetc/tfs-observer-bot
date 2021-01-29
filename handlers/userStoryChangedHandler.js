const userStoryChangedHandler = ({ app, bot }) => {
  app.post("/userStoryChanged", (req, res) => {
    console.log("userStoryChanged");
    console.log("req.body", req.body);

    const {
      message: { html } = {},
      resource: { _links, fields = {} } = {}
    } = req.body;

    //console.log({ _links });

    for (let prop in fields) {
      console.log({ prop });
      console.log("fields[prop]", fields[prop]);
    }

    const hasTransitionedFromStagingToClosed = Object.keys(fields).some(
      fieldKey =>
        fieldKey.includes("Kanban.Column") &&
        fields[fieldKey].oldValue === "Staging" &&
        fields[fieldKey].newValue === "Closed"
    );

    console.log({ hasTransitionedFromStagingToClosed });

    if (!hasTransitionedFromStagingToClosed) {
      res.code(200).send();
      return;
    }

    state.subscribers.forEach(async subscriber => {
      try {
        await bot.telegram.sendMessage(subscriber.chatId, html, {
          parse_mode: "HTML"
        });
      } catch (e) {
        console.error(
          "error occurred when sending notification about US transition Staging -> Closed",
          e
        );
      }
    });

    res.code(200).send();
  });
};

module.exports = {
  userStoryChangedHandler
};
