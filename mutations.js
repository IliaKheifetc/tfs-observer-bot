const addSubscriber = `mutation addSubscriber($objects: [subscribers_insert_input!]!) {
  insert_subscribers(objects: $objects) {
    id
    name
    chatId
  }
}`;

module.exports = { addSubscriber };
