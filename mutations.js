const addSubscriber = `mutation ModifySubscribers($objects: [subscribers_insert_input!]!) {
  insert_subscribers(objects: $objects) {
    affected_rows
  }
}`;

module.exports = { addSubscriber };
