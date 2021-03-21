const { Telegraf } = require("telegraf");
const Telegram = require("telegraf/telegram");
//const express = require("express");
const fastify = require("fastify");
const middie = require("middie");
const { v4: uuidv4 } = require("uuid");

require("./environmentVarsSetup");

const HasuraDataSource = require("./dataSources/hasuraDataSource");
const { getSubscribers } = require("./graphql/queries");

const {
  deploymentCompletedHandler,
  getStagingUserStoriesHandler,
  pullRequestCommentsHandler,
  subscribeHandlers,
  unsubscribeHandlers,
  userStoryChangedHandler,
  workItemsCreatedHandler,
} = require("./handlers/index");

const { BOT_TOKEN, PORT, WEB_HOOK_URL_BASE, WEB_HOOK_SECRET } = process.env;
const IS_TEST = process.env.IS_TEST === "true";
const TEST_USERS_CHAT_IDS = [-392583350, 80464348];

const { BOT_COMMANDS } = require("./constants");
const { getCommandsList } = require("./utils");

console.log("process.env", process.env);

const start = async () => {
  const fastifyInstance = fastify();
  try {
    await fastifyInstance.register(middie);

    const telegram = new Telegram(BOT_TOKEN);

    let state = { subscribers: [] };

    const setCommands = async () => {
      try {
        const result = await telegram.setMyCommands(BOT_COMMANDS);
        console.log("setMyCommands success");
      } catch (e) {
        console.log("error", e);
      }

      try {
        const response = await telegram.getMyCommands();
        console.log("response", response);
      } catch (e) {
        console.log("error", e);
      }
    };

    const initState = async () => {
      try {
        const { data, errors } = await HasuraDataSource.post(
          getSubscribers,
          "MyQuery"
        );

        if (errors) {
          throw new Error(errors[0]?.message);
        }

        if (data?.subscribers) {
          state.subscribers.push(...data.subscribers);
          state.subscribers.forEach((subscriber) => {
            subscriber.subscriptions = new Set(subscriber.subscriptions);
          });
        }

        state.subscribers.forEach((subscriber) => {
          console.log("subscriber.subscriptions", subscriber.subscriptions);
        });

        console.log({ IS_TEST });

        state.currentMaxId = state.subscribers.reduce(
          (max, subscriber) => (subscriber.id > max ? subscriber.id : max),
          0
        );

        if (IS_TEST) {
          state.subscribers = state.subscribers.filter((subscriber) =>
            TEST_USERS_CHAT_IDS.includes(subscriber.chatId)
          );
        }

        console.log({ subscribers: state.subscribers });
      } catch (e) {
        console.error("error when requesting subscribers: ", e);
      }
    };

    await initState();
    await setCommands();

    const bot = new Telegraf(BOT_TOKEN, {
      // Telegram options
      agent: null,
      webhookReply: false,
    }); // https.Agent instance, allows custom proxy, certificate, keep alive, etc. // Reply via webhook

    bot.telegram.setWebhook(`${WEB_HOOK_URL_BASE}${WEB_HOOK_SECRET}`);

    fastifyInstance.use(bot.webhookCallback(WEB_HOOK_SECRET));

    bot.start((ctx) => {
      console.log("subscribers to notify:", state.subscribers);

      const commandsList = getCommandsList(BOT_COMMANDS).join(",\n");

      ctx.replyWithHTML(
        `Бот поддерживает следующие команды:\n${commandsList}\n` +
          `Описание команд можно посмотреть, написав / в поле для ввода сообщения или нажав на / в правой части этого поля`
      );
    });

    subscribeHandlers({ bot, state });
    unsubscribeHandlers({ bot, state });
    getStagingUserStoriesHandler({ bot });
    userStoryChangedHandler({ app: fastifyInstance, bot, state });
    deploymentCompletedHandler({ app: fastifyInstance, bot, state });
    pullRequestCommentsHandler({ app: fastifyInstance, bot, state });
    workItemsCreatedHandler({ app: fastifyInstance, bot, state });
    // expressApp.use(
    //   bot.webhookCallback(
    //     "/telegraf/07e4f521f4a38e9e50e08b3f8525efe23fc556fa9b6cb75ad2b987a612fce3e9"
    //   )
    // );
    // expressApp.use(express.json());

    bot.hears("check", async (ctx) => {
      console.log("check");
      await ctx.reply("what's up");
    });

    fastifyInstance.get("/", (req, reply) => reply.send("Hello World!"));

    fastifyInstance.listen(Number(PORT), "0.0.0.0", async (error) => {
      if (error) {
        console.log("Error when starting the server", error);
      }
      console.log(`app listening on port ${PORT}!`);
    });
  } catch (e) {
    console.error("error when running start", e);
  }
};

start();
