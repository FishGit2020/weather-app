import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import type { Request, Response } from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';
import crypto from 'crypto';
import { verifyRecaptchaToken } from './recaptcha.js';

// Initialize Firebase Admin (idempotent)
if (getApps().length === 0) {
  initializeApp();
}

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

// ─── Weather Alert Subscriptions ────────────────────────────────────

/**
 * Firestore schema:
 *   alertSubscriptions/{docId}
 *     - token: string (FCM token)
 *     - cities: Array<{ lat: number, lon: number, name: string }>
 *     - createdAt: Timestamp
 *     - updatedAt: Timestamp
 */

/**
 * Callable function: subscribe an FCM token to weather alerts for given cities.
 */
export const subscribeToAlerts = onCall(
  { maxInstances: 5 },
  async (request) => {
    const { token, cities } = request.data as {
      token: string;
      cities: Array<{ lat: number; lon: number; name: string }>;
    };

    if (!token || typeof token !== 'string') {
      throw new HttpsError('invalid-argument', 'FCM token is required');
    }
    if (!cities || !Array.isArray(cities) || cities.length === 0) {
      throw new HttpsError('invalid-argument', 'At least one city is required');
    }

    const db = getFirestore();
    const subsRef = db.collection('alertSubscriptions');

    // Upsert: find existing doc by token or create new
    const existing = await subsRef.where('token', '==', token).limit(1).get();

    if (!existing.empty) {
      await existing.docs[0].ref.update({
        cities,
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      await subsRef.add({
        token,
        cities,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return { success: true };
  }
);

// Severe weather condition IDs from OpenWeather API
// See: https://openweathermap.org/weather-conditions
const SEVERE_WEATHER_IDS = new Set([
  200, 201, 202, 210, 211, 212, 221, 230, 231, 232, // Thunderstorm
  502, 503, 504, 511,                                  // Heavy rain / freezing rain
  602, 611, 612, 613, 615, 616, 620, 621, 622,        // Heavy snow / sleet
  711, 731, 751, 761, 762,                             // Smoke, dust, volcanic ash
  771, 781,                                            // Squall, tornado
]);

/**
 * Scheduled function: runs every 30 minutes to check weather for subscribed cities.
 * Sends FCM push notification for severe weather alerts.
 */
export const checkWeatherAlerts = onSchedule(
  {
    schedule: 'every 30 minutes',
    memory: '256MiB',
    timeoutSeconds: 120,
    secrets: ['OPENWEATHER_API_KEY'],
  },
  async () => {
    const db = getFirestore();
    const messaging = getMessaging();
    const apiKey = process.env.OPENWEATHER_API_KEY || '';

    if (!apiKey) {
      console.warn('OPENWEATHER_API_KEY not set — skipping weather alerts');
      return;
    }

    // Fetch all subscriptions
    const snapshot = await db.collection('alertSubscriptions').get();
    if (snapshot.empty) {
      console.log('No alert subscriptions found');
      return;
    }

    // Deduplicate cities across all subscriptions
    const cityMap = new Map<string, { lat: number; lon: number; name: string; tokens: string[] }>();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const token = data.token as string;
      const cities = data.cities as Array<{ lat: number; lon: number; name: string }>;

      for (const city of cities) {
        const key = `${city.lat.toFixed(2)},${city.lon.toFixed(2)}`;
        const existing = cityMap.get(key);
        if (existing) {
          existing.tokens.push(token);
        } else {
          cityMap.set(key, { ...city, tokens: [token] });
        }
      }
    }

    console.log(`Checking weather for ${cityMap.size} unique cities`);

    // Check weather for each city
    const staleTokens: string[] = [];

    for (const [, city] of cityMap) {
      try {
        const response = await axios.get(
          'https://api.openweathermap.org/data/2.5/weather',
          { params: { lat: city.lat, lon: city.lon, appid: apiKey, units: 'metric' }, timeout: 5000 }
        );

        const weather = response.data.weather as Array<{ id: number; main: string; description: string }>;
        const hasSevere = weather.some(w => SEVERE_WEATHER_IDS.has(w.id));

        if (hasSevere) {
          const severity = weather.find(w => SEVERE_WEATHER_IDS.has(w.id))!;
          const temp = Math.round(response.data.main.temp);

          console.log(`Severe weather in ${city.name}: ${severity.description}`);

          // Send FCM to all subscribed tokens for this city
          for (const token of city.tokens) {
            try {
              await messaging.send({
                token,
                notification: {
                  title: `⚠️ Weather Alert: ${city.name}`,
                  body: `${severity.main} — ${severity.description} (${temp}°C)`,
                },
                data: {
                  lat: String(city.lat),
                  lon: String(city.lon),
                  cityName: city.name,
                },
                webpush: {
                  fcmOptions: {
                    link: `/weather/${city.lat},${city.lon}?name=${encodeURIComponent(city.name)}`,
                  },
                },
              });
            } catch (err: any) {
              // Token is invalid/expired — mark for cleanup
              if (err.code === 'messaging/registration-token-not-registered' ||
                  err.code === 'messaging/invalid-registration-token') {
                staleTokens.push(token);
              }
              console.error(`Failed to send to token ${token.slice(0, 10)}...:`, err.message);
            }
          }
        }
      } catch (err: any) {
        console.error(`Failed to fetch weather for ${city.name}:`, err.message);
      }
    }

    // Clean up stale tokens
    if (staleTokens.length > 0) {
      console.log(`Cleaning up ${staleTokens.length} stale tokens`);
      const batch = db.batch();
      for (const token of staleTokens) {
        const docs = await db.collection('alertSubscriptions').where('token', '==', token).get();
        docs.forEach(doc => batch.delete(doc.ref));
      }
      await batch.commit();
    }
  }
);

// ─── Stock Proxy (Finnhub) ──────────────────────────────────────────

const stockCache = new NodeCache();

/**
 * Proxy for Finnhub stock API.
 * Routes:
 *   GET /stock/search?q=...
 *   GET /stock/quote?symbol=...
 *   GET /stock/profile?symbol=...
 *   GET /stock/candles?symbol=...&resolution=D&from=...&to=...
 */
export const stockProxy = onRequest(
  {
    cors: true,
    maxInstances: 10,
    memory: '256MiB',
    timeoutSeconds: 30,
    secrets: ['FINNHUB_API_KEY'],
  },
  async (req: Request, res: Response) => {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'FINNHUB_API_KEY not configured' });
      return;
    }

    const path = req.path.replace(/^\/stock\//, '');
    const baseUrl = 'https://finnhub.io/api/v1';
    let url: string;
    let cacheKey: string;
    let cacheTTL: number;

    switch (path) {
      case 'search': {
        const q = req.query.q as string;
        if (!q) { res.status(400).json({ error: 'q parameter required' }); return; }
        url = `${baseUrl}/search?q=${encodeURIComponent(q)}`;
        cacheKey = `stock:search:${q}`;
        cacheTTL = 300; // 5 min
        break;
      }
      case 'quote': {
        const symbol = req.query.symbol as string;
        if (!symbol) { res.status(400).json({ error: 'symbol parameter required' }); return; }
        url = `${baseUrl}/quote?symbol=${encodeURIComponent(symbol)}`;
        cacheKey = `stock:quote:${symbol}`;
        cacheTTL = 30; // 30 sec
        break;
      }
      case 'profile': {
        const symbol = req.query.symbol as string;
        if (!symbol) { res.status(400).json({ error: 'symbol parameter required' }); return; }
        url = `${baseUrl}/stock/profile2?symbol=${encodeURIComponent(symbol)}`;
        cacheKey = `stock:profile:${symbol}`;
        cacheTTL = 3600; // 1 hr
        break;
      }
      case 'candles': {
        const symbol = req.query.symbol as string;
        const resolution = (req.query.resolution as string) || 'D';
        const from = req.query.from as string;
        const to = req.query.to as string;
        if (!symbol || !from || !to) { res.status(400).json({ error: 'symbol, from, to parameters required' }); return; }
        url = `${baseUrl}/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}`;
        cacheKey = `stock:candles:${symbol}:${resolution}:${from}:${to}`;
        cacheTTL = 300; // 5 min
        break;
      }
      default:
        res.status(404).json({ error: `Unknown stock route: ${path}` });
        return;
    }

    // Check cache
    const cached = stockCache.get<any>(cacheKey);
    if (cached) {
      res.status(200).json(cached);
      return;
    }

    try {
      const response = await axios.get(url, {
        headers: { 'X-Finnhub-Token': apiKey },
        timeout: 10000,
      });
      stockCache.set(cacheKey, response.data, cacheTTL);
      res.status(200).json(response.data);
    } catch (err: any) {
      console.error(`Stock proxy error (${path}):`, err.message);
      res.status(err.response?.status || 500).json({
        error: err.response?.data?.error || err.message || 'Failed to fetch stock data',
      });
    }
  }
);

// ─── Podcast Proxy (PodcastIndex) ──────────────────────────────────

const podcastCache = new NodeCache();

/**
 * Generate PodcastIndex API auth headers.
 * Auth requires: X-Auth-Key, X-Auth-Date, Authorization (SHA-1 of key+secret+timestamp)
 */
function getPodcastIndexHeaders(apiKey: string, apiSecret: string): Record<string, string> {
  const ts = Math.floor(Date.now() / 1000);
  const hash = crypto.createHash('sha1').update(`${apiKey}${apiSecret}${ts}`).digest('hex');
  return {
    'X-Auth-Key': apiKey,
    'X-Auth-Date': String(ts),
    'Authorization': hash,
    'User-Agent': 'MyCircle/1.0',
  };
}

/**
 * Proxy for PodcastIndex API.
 * Routes:
 *   GET /podcast/search?q=...
 *   GET /podcast/trending
 *   GET /podcast/episodes?feedId=...
 */
export const podcastProxy = onRequest(
  {
    cors: true,
    maxInstances: 10,
    memory: '256MiB',
    timeoutSeconds: 30,
    secrets: ['PODCASTINDEX_API_KEY', 'PODCASTINDEX_API_SECRET'],
  },
  async (req: Request, res: Response) => {
    const apiKey = process.env.PODCASTINDEX_API_KEY;
    const apiSecret = process.env.PODCASTINDEX_API_SECRET;
    if (!apiKey || !apiSecret) {
      res.status(500).json({ error: 'PodcastIndex API credentials not configured' });
      return;
    }

    const path = req.path.replace(/^\/podcast\//, '');
    const baseUrl = 'https://api.podcastindex.org/api/1.0';
    let url: string;
    let cacheKey: string;
    let cacheTTL: number;

    switch (path) {
      case 'search': {
        const q = req.query.q as string;
        if (!q) { res.status(400).json({ error: 'q parameter required' }); return; }
        url = `${baseUrl}/search/byterm?q=${encodeURIComponent(q)}`;
        cacheKey = `podcast:search:${q}`;
        cacheTTL = 300; // 5 min
        break;
      }
      case 'trending': {
        url = `${baseUrl}/podcasts/trending?max=20`;
        cacheKey = 'podcast:trending';
        cacheTTL = 3600; // 1 hr
        break;
      }
      case 'episodes': {
        const feedId = req.query.feedId as string;
        if (!feedId) { res.status(400).json({ error: 'feedId parameter required' }); return; }
        url = `${baseUrl}/episodes/byfeedid?id=${encodeURIComponent(feedId)}&max=20`;
        cacheKey = `podcast:episodes:${feedId}`;
        cacheTTL = 600; // 10 min
        break;
      }
      default:
        res.status(404).json({ error: `Unknown podcast route: ${path}` });
        return;
    }

    // Check cache
    const cached = podcastCache.get<any>(cacheKey);
    if (cached) {
      res.status(200).json(cached);
      return;
    }

    try {
      const headers = getPodcastIndexHeaders(apiKey, apiSecret);
      const response = await axios.get(url, { headers, timeout: 10000 });
      podcastCache.set(cacheKey, response.data, cacheTTL);
      res.status(200).json(response.data);
    } catch (err: any) {
      console.error(`Podcast proxy error (${path}):`, err.message);
      res.status(err.response?.status || 500).json({
        error: err.response?.data?.description || err.message || 'Failed to fetch podcast data',
      });
    }
  }
);
