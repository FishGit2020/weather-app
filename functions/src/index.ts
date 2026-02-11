import { onRequest } from 'firebase-functions/v2/https';
import type { Request, Response } from 'express';
import { verifyRecaptchaToken } from './recaptcha.js';

// Cache the Apollo Server instance to avoid re-initialization on every request
let serverPromise: Promise<any> | null = null;

async function getServer() {
  if (!serverPromise) {
    serverPromise = (async () => {
      const { ApolloServer } = await import('@apollo/server');
      const { makeExecutableSchema } = await import('@graphql-tools/schema');
      const { typeDefs } = await import('./schema.js');
      const { createResolvers } = await import('./resolvers.js');

      const apiKey = process.env.OPENWEATHER_API_KEY || '';

      const schema = makeExecutableSchema({
        typeDefs,
        resolvers: createResolvers(() => apiKey)
      });

      const server = new ApolloServer({
        schema,
        introspection: true
      });

      await server.start();
      return server;
    })();
  }
  return serverPromise;
}

// Export the Cloud Function
export const graphql = onRequest(
  {
    cors: true,
    maxInstances: 10,
    memory: '512MiB',
    timeoutSeconds: 60,
    secrets: ['OPENWEATHER_API_KEY', 'RECAPTCHA_SECRET_KEY']
  },
  async (req: Request, res: Response) => {
    const server = await getServer();

    // reCAPTCHA v3 verification
    const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecretKey) {
      const token = req.headers['x-recaptcha-token'] as string;
      const result = await verifyRecaptchaToken(token, recaptchaSecretKey);
      if (!result.valid) {
        console.warn('reCAPTCHA verification failed:', result.reason);
        res.status(403).json({
          errors: [{
            message: result.reason || 'reCAPTCHA verification failed',
            extensions: { code: 'UNAUTHENTICATED' }
          }]
        });
        return;
      }
    }

    // Handle the GraphQL request directly without Express
    // Firebase already parses the body, so we use it directly
    const { body, headers } = req;

    try {
      const result = await server.executeOperation(
        {
          query: body.query,
          variables: body.variables,
          operationName: body.operationName
        },
        {
          contextValue: { headers }
        }
      );

      // Send the response
      if (result.body.kind === 'single') {
        res.status(200).json(result.body.singleResult);
      } else {
        // For incremental delivery (rare case)
        res.status(200).json({ data: null, errors: [{ message: 'Incremental delivery not supported' }] });
      }
    } catch (error: any) {
      console.error('GraphQL error:', error);
      res.status(500).json({
        errors: [{ message: error.message || 'Internal server error' }]
      });
    }
  }
);
