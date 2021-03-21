const addSubscriber = `mutation ModifySubscribers($objects: [subscribers_insert_input!]!) {
  insert_subscribers(objects: $objects) {
    affected_rows
  }
}`;

const updateSubscriber = `mutation ModifySubscribers($id: Int!, $subscriptions: _int4) {
    update_subscribers_by_pk(pk_columns: {id: $id}, _set: {subscriptions: $subscriptions}) {
      id
    }
  }`;

module.exports = { addSubscriber, updateSubscriber };
