import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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
import { createServer as createViteServer } from 'vite';
import type { ViteDevServer } from 'vite';
import { typeDefs } from './graphql/schema.js';
import { resolvers, cleanupSubscriptions } from './graphql/resolvers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3003;
const base = process.env.BASE || '/';

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
      // Proper shutdown for HTTP server
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Proper shutdown for WebSocket server
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
    introspection: true, // Enable GraphQL Playground in dev
    includeStacktraceInErrorResponses: !isProduction
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

  // Vite middleware for dev or static files for production
  let vite: ViteDevServer | undefined;

  if (!isProduction) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
      base
    });
    app.use(vite.middlewares);
  } else {
    const sirv = (await import('sirv')).default;
    app.use(base, sirv(path.resolve(__dirname, '../../dist/client'), {
      extensions: []
    }));
  }

  // SSR Handler for all other routes
  app.use('*', async (req, res, next) => {
    try {
      const url = req.originalUrl.replace(base, '');

      let template: string;
      let render: (url: string) => Promise<{ html: string }>;

      if (!isProduction) {
        template = fs.readFileSync(
          path.resolve(__dirname, '../../index.html'),
          'utf-8'
        );
        template = await vite!.transformIndexHtml(url, template);

        render = (await vite!.ssrLoadModule('/src/server/entry-server.tsx')).render;
      } else {
        template = fs.readFileSync(
          path.resolve(__dirname, '../../dist/client/index.html'),
          'utf-8'
        );

        render = (await import('../../dist/server/entry-server.js')).render;
      }

      const { html: appHtml } = await render(url);

      const html = template.replace(`<!--ssr-outlet-->`, appHtml);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e: any) {
      if (!isProduction) {
        vite!.ssrFixStacktrace(e as Error);
      }
      next(e);
    }
  });

  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).send('Internal Server Error');
  });

  // Start HTTP server (this will also handle WebSocket connections)
  httpServer.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(`📊 GraphQL endpoint: http://localhost:${port}/graphql`);
    console.log(`🔌 WebSocket subscriptions: ws://localhost:${port}/graphql`);
    console.log(`📱 SSR enabled for all routes`);
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
