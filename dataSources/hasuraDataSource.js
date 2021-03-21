const DataSource = require("./DataSource");
const { addSubscriber, updateSubscriber } = require("../graphql/mutations");

const { HASURA_API_URL, HASURA_GRAPHQL_ADMIN_SECRET } = process.env;

class HasuraDataSource extends DataSource {
  constructor({ baseUrl, headers }) {
    super({ baseUrl, headers });
  }

  async post(operationsDoc, operationName, variables = {}) {
    return super.post(
      "",
      {
        query: operationsDoc,
        variables: variables,
        operationName: operationName,
      },
      this.headers
    );
  }

  addSubscriber(subscriber = {}) {
    const { id, chatId, name, subscriptions } = subscriber;

    return this.post(addSubscriber, "ModifySubscribers", {
      objects: [
        {
          id, //uuidv4(),
          chatId,
          name,
          subscriptions,
        },
      ],
    });
  }

  updateSubscriber(subscriberId, updates = {}) {
    const { subscriptions } = updates;
    return this.post(updateSubscriber, "ModifySubscribers", {
      id: subscriberId,
      subscriptions,
    });
  }
}

const operationsDoc = `
  query MyQuery {
    __typename
  }
`;

module.exports = new HasuraDataSource({
  baseUrl: HASURA_API_URL,
  headers: { "x-hasura-admin-secret": HASURA_GRAPHQL_ADMIN_SECRET },
});
