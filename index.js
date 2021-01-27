const { Telegraf } = require("telegraf");
const Telegram = require("telegraf/telegram");
const express = require("express");

const { fetchGraphQL } = require("./fetchFromApi");
const { getSubscribers } = require("./queries");
const { addSubscriber } = require("./mutations");
const { formatDate } = require("./utils");

const {
  workItemsCreatedHandler
} = require("./handlers/workItemsCreatedHandler");

const { BOT_TOKEN, DEFAULT_CHAT_IDS, PORT, IS_TEST = false } = process.env;

const telegram = new Telegram(BOT_TOKEN);

// let chatsToNotify = DEFAULT_CHAT_IDS
//   ? [...DEFAULT_CHAT_IDS.split(",").map(item => item.trim())]
//   : [];

let state = {
  subscribers: []
};

const initChatsToNotify = async () => {
  try {
    const { data } = await fetchGraphQL(getSubscribers, "MyQuery");

    state.subscribers = data ? data.subscribers : [];

    console.log({ IS_TEST });
    console.log(typeof IS_TEST);

    if (IS_TEST) {
      state.subscribers = state.subscribers.slice(0, 2);
    }

    console.log({ subscribers: state.subscribers });
  } catch (e) {
    console.error("error", e);
  }
};

initChatsToNotify();

const expressApp = express();

const bot = new Telegraf(BOT_TOKEN, {
  // Telegram options
  agent: null, // https.Agent instance, allows custom proxy, certificate, keep alive, etc.
  webhookReply: false // Reply via webhook
});

bot.telegram.setWebhook(
  "https://tfs-observer-telegram-bot.herokuapp.com/telegraf/07e4f521f4a38e9e50e08b3f8525efe23fc556fa9b6cb75ad2b987a612fce3e9"
);

bot.start(ctx => {
  console.log("subscribers to notify:", state.subscribers);

  ctx.reply(
    "Используйте команду /subscribe, чтобы подписаться на уведомление об изменениях"
  );
});

bot.command("/subscribe", ctx => {
  console.log("ctx", ctx);
  const { id: chatId } = ctx.chat || {};

  console.log("new chatId:", chatId);

  // todo use appropriate mutation here!
  if (!state.subscribers.some(subscriber => subscriber.chatId === chatId)) {
    state.subscribers.push({ chatId });
  }

  try {
    fetchGraphQL(addSubscriber, "ModifySubscribers", {
      objects: [
        {
          id: state.subscribers.length + 1,
          chatId,
          name: "new_subscriber"
        }
      ]
    });
  } catch (e) {
    console.error("error", e);
  }

  ctx.reply("Вы успешно подписались");
});

workItemsCreatedHandler({ bot, state });

expressApp.use(
  bot.webhookCallback(
    "/telegraf/07e4f521f4a38e9e50e08b3f8525efe23fc556fa9b6cb75ad2b987a612fce3e9"
  )
);
expressApp.use(express.json());

expressApp.get("/", (req, res) => res.send("Hello World!"));

expressApp.post("/deploymentCompleted", (req, res) => {
  console.log("req.body", req.body);
  const { createdDate, detailedMessage } = req.body;

  state.subscribers.forEach(async subscriber => {
    try {
      await telegram.sendMessage(
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

  res.status(200).end();
});

expressApp.post("/pullRequestCommentPosted", (req, res) => {
  console.log("req.body", req.body);
  const {
    createdDate,
    message: { html },
    resource: {
      comment: { author, content, publishedDate }
    }
  } = req.body;

  const formattedDate = formatDate(publishedDate);

  state.subscribers.slice(0, 2).forEach(async subscriber => {
    try {
      await telegram.sendMessage(
        subscriber.chatId,
        `${html}: "${content}", \n${formattedDate}`,
        {
          parse_mode: "HTML"
        }
      );
    } catch (e) {
      console.error(
        "error occurred when sending notification about pr comment",
        e
      );
    }
  });

  res.status(200).end();
});

expressApp.post("/userStoryChanged", (req, res) => {
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
    res.status(200).end();
    return;
  }

  state.subscribers.forEach(async subscriber => {
    try {
      await telegram.sendMessage(subscriber.chatId, html, {
        parse_mode: "HTML"
      });
    } catch (e) {
      console.error(
        "error occurred when sending notification about US transition Staging -> Closed",
        e
      );
    }
  });

  res.status(200).end();
});

expressApp.listen(PORT, async () => {
  console.log(`app listening on port ${PORT}!`);
});
