import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { ApolloLink, Observable } from "apollo-link";
import { USER_QUERY, PLANET_QUERY } from "./queries";

const cache = new InMemoryCache();
const queryRequiresVariable = ({ variableName, operation }) =>
  operation.query.definitions?.some(({ variableDefinitions }) =>
    variableDefinitions?.some(
      ({ variable }) => variable.name.value === variableName
    )
  );

const injectVariables = async operation => {
  const variableName = "planetId";
  if (
    queryRequiresVariable({
      variableName,
      operation
    })
  ) {
    const results = await client.query({
      query: USER_QUERY,
      fetchPolicy: "cache-first"
    });
    const planetId = results?.data?.user?.planetId;

    operation.variables[variableName] = planetId;
  }
};

const variableInjectionLink = new ApolloLink(
  (operation, forward) =>
    new Observable(observer => {
      let handle;
      Promise.resolve(operation)
        .then(oper => injectVariables(oper))
        .then(() => {
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer)
          });
        })
        .catch(observer.error.bind(observer));

      return () => {
        if (handle) handle.unsubscribe();
      };
    })
);

const client = new ApolloClient({
  connectToDevTools: true,
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
      if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    variableInjectionLink,
    new HttpLink({
      uri: "http://localhost:4000/graphql",
      credentials: "same-origin"
    })
  ]),
  cache
});

export default client;

// const userExistsOnCache = !!cache.data.data.ROOT_QUERY?.user;
// console.log("reading from: ", userExistsOnCache ? "cache" : "network");
// // if (userExistsOnCache) {
// // From cache
// const results = await client.query({
//   query: USER_QUERY,
//   fetchPolicy: "cache-first"
// });
// // planetId = results.user.planetId;
// const planetId = results?.data?.user?.planetId;
// // console.log("---READING FROM CACHE", planetId);
// // } else {
// // From network
// // const results = await client.query({ query: USER_QUERY });
// // planetId = results?.data?.user?.planetId;
// // console.log("---READING FROM NETWORK", planetId);
// // }
