import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { getRecaptchaToken } from '../utils/recaptcha';

// Check if we're on the client side
const isBrowser = typeof window !== 'undefined';
const isProduction = isBrowser && !window.location.hostname.includes('localhost');

// Create Apollo Client factory function for micro frontends
export function createApolloClient(graphqlUrl?: string, wsUrl?: string) {
  // In production (Firebase), use relative URL which routes to Cloud Function
  // In development, use the local GraphQL server on port 3003
  const defaultGraphqlUrl = isBrowser
    ? isProduction
      ? '/graphql'
      : `http://${window.location.hostname}:3003/graphql`
    : 'http://localhost:3003/graphql';

  // WebSocket subscriptions are not supported in Firebase Cloud Functions
  // In production, we'll skip WebSocket connection
  const defaultWsUrl = isBrowser && !isProduction
    ? `ws://${window.location.hostname}:3003/graphql`
    : null;

  const httpLink = new HttpLink({
    uri: graphqlUrl || defaultGraphqlUrl
  });

  // reCAPTCHA v3 link: attaches a fresh token to every HTTP request
  const recaptchaLink = setContext(async (operation, { headers }) => {
    // Convert PascalCase operation name to snake_case for reCAPTCHA action
    const action = (operation.operationName || 'graphql')
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toLowerCase();
    const token = await getRecaptchaToken(action);
    return {
      headers: {
        ...headers,
        ...(token ? { 'x-recaptcha-token': token } : {})
      }
    };
  });

  const httpWithRecaptcha = recaptchaLink.concat(httpLink);

  let wsLink: GraphQLWsLink | null = null;

  // Only create WebSocket connection in development (not supported in Firebase)
  const finalWsUrl = wsUrl || defaultWsUrl;
  if (isBrowser && finalWsUrl) {
    const wsClient = createClient({
      url: finalWsUrl,
      connectionParams: () => ({}),
      on: {
        connected: () => console.log('WebSocket connected'),
        closed: () => console.log('WebSocket closed'),
        error: (error) => console.error('WebSocket error:', error)
      }
    });
    wsLink = new GraphQLWsLink(wsClient);
  }

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
        httpWithRecaptcha
      )
    : httpWithRecaptcha;

  return new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            weather: { keyArgs: ['lat', 'lon'] },
            currentWeather: { keyArgs: ['lat', 'lon'] },
            forecast: { keyArgs: ['lat', 'lon'] },
            hourlyForecast: { keyArgs: ['lat', 'lon'] }
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
    }
  });
}

// Default singleton client
let defaultClient: ApolloClient | null = null;

export function getApolloClient(): ApolloClient {
  if (!defaultClient) {
    defaultClient = createApolloClient();
  }
  return defaultClient;
}

export { ApolloClient, InMemoryCache };
