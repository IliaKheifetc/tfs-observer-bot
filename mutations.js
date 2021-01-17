const addSubscriber = `mutation ModifySubscribers($objects: [subscribers_insert_input!]!) {
  insert_subscribers(objects: $objects) {
    id
    name
    chatId
  }
}`;

module.exports = { addSubscriber };
