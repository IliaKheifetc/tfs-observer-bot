const getSubscribers = `query MyQuery {
  subscribers {
    id
    name
    chatId
    subscriptions
  }
}`;

module.exports = { getSubscribers };
