const fetch = require("node-fetch");

const API_URL = "https://tfs-observer-db.hasura.app/v1/graphql";

async function fetchGraphQL(operationsDoc, operationName, variables = {}) {
  const result = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      query: operationsDoc,
      variables: variables,
      operationName: operationName
    })
  });

  return await result.json();
}

const operationsDoc = `
  query MyQuery {
    __typename
  }
`;

// function fetchMyQuery() {
//   return fetchGraphQL(operationsDoc, "MyQuery", {});
// }

// async function startFetchMyQuery() {
//   const { errors, data } = await fetchMyQuery();
//
//   if (errors) {
//     // handle those errors like a pro
//     console.error(errors);
//   }
//
//   // do something great with this precious data
//   console.log(data);
// }
//
// startFetchMyQuery();

module.exports = { fetchGraphQL };
