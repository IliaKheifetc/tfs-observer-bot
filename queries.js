const getSubscribers = `query MyQuery {
  subscribers {
    id
    name
    chatId
  }
}`;

module.exports = { getSubscribers };
