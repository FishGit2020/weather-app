import 'dotenv/config';
import { createServer as createHttpServer } from 'node:http';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware as apolloExpressMiddleware } from '@as-integrations/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { typeDefs } from './graphql/schema.js';
import { resolvers, cleanupSubscriptions } from './graphql/resolvers.js';

const port = process.env.PORT || 3003;

async function startServer() {
  const app = express();
  const httpServer = createHttpServer(app);

  // Create GraphQL schema
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  });

  // Create WebSocket server for GraphQL subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql'
  });

  // Set up WebSocket handling for subscriptions
  const serverCleanup = useServer(
    {
      schema,
      onConnect: () => {
        console.log('Client connected to WebSocket');
      },
      onDisconnect: () => {
        console.log('Client disconnected from WebSocket');
      }
    },
    wsServer
  );

  // Create Apollo Server
  const apolloServer = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
              cleanupSubscriptions();
            }
          };
        }
      }
    ],
    introspection: true
  });

  await apolloServer.start();

  // Middleware
  app.use(compression());
  app.use(express.json());

  // Apollo GraphQL endpoint
  app.use(
    '/graphql',
    cors(),
    apolloExpressMiddleware(apolloServer, {
      context: async ({ req }) => ({
        headers: req.headers
      })
    })
  );

  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).send('Internal Server Error');
  });

  // Start HTTP server (this will also handle WebSocket connections)
  httpServer.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`GraphQL endpoint: http://localhost:${port}/graphql`);
    console.log(`WebSocket subscriptions: ws://localhost:${port}/graphql`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await apolloServer.stop();
    httpServer.close(() => {
      console.log('HTTP server closed');
    });
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});
