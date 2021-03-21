const moment = require("moment-timezone");

const formatDate = (date) =>
  moment(date).tz("Europe/Moscow").format("DD.MM.YYYY HH:mm");

const getSubscriberFromState = (state, ctx) => {
  const {
    id: chatId,
    first_name: firstName = "",
    last_name: lastName = "",
    username = "",
  } = ctx.chat || {};

  console.log("ctx.chat", ctx.chat);

  return state.subscribers.find((subscriber) => subscriber.chatId === chatId);
};

const getSubscriberChatData = (ctx) => {
  return {
    id: ctx.chat.id,
    firstName: ctx.chat.first_name,
    lastName: ctx.chat.last_name,
    username: ctx.chat.username,
  };
};

const hasSubscription = (subscriber, subscriptionType) =>
  Boolean(subscriber.subscriptions?.has(subscriptionType));

const convertArrayToDbFormat = (arr) => `{${arr.join(",")}}`;

const getCommandsList = (commandsData) =>
  commandsData.map((commandData) => `/${commandData.command}`);

module.exports = {
  convertArrayToDbFormat,
  formatDate,
  getCommandsList,
  getSubscriberFromState,
  getSubscriberChatData,
  hasSubscription,
};
