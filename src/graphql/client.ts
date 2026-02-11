import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

// Check if we're on the client side
const isBrowser = typeof window !== 'undefined';

// HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: isBrowser ? `http://${window.location.host}/graphql` : 'http://localhost:3000/graphql'
});

// WebSocket link for subscriptions (only on client)
let wsLink: GraphQLWsLink | null = null;

if (isBrowser) {
  const wsClient = createClient({
    url: `ws://${window.location.host}/graphql`,
    connectionParams: () => ({
      // Add any auth tokens here if needed
    }),
    on: {
      connected: () => console.log('WebSocket connected'),
      closed: () => console.log('WebSocket closed'),
      error: (error) => console.error('WebSocket error:', error)
    }
  });

  wsLink = new GraphQLWsLink(wsClient);
}

// Split link: send subscriptions to WebSocket, everything else to HTTP
const splitLink = isBrowser && wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      httpLink
    )
  : httpLink;

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          weather: {
            // Cache based on lat/lon
            keyArgs: ['lat', 'lon']
          },
          currentWeather: {
            keyArgs: ['lat', 'lon']
          },
          forecast: {
            keyArgs: ['lat', 'lon']
          },
          hourlyForecast: {
            keyArgs: ['lat', 'lon']
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all'
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    }
  },
  connectToDevTools: process.env.NODE_ENV === 'development'
});
