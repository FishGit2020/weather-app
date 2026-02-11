# Weather App - Micro Frontend Architecture

A modern weather application built with **micro frontend architecture**, React, GraphQL, and deployed on Firebase.

**Live Demo:** https://weather-app-d4f7e.web.app

![Built with React](https://img.shields.io/badge/React-18.2-blue)
![Micro Frontends](https://img.shields.io/badge/Micro%20Frontends-Vite%20Federation-green)
![Firebase](https://img.shields.io/badge/Firebase-Hosting%20%2B%20Functions-orange)
![Node.js](https://img.shields.io/badge/Node.js-22-brightgreen)

## Features

- Search for cities worldwide
- Current weather conditions with real-time data
- 7-day weather forecast
- Hourly forecast (48 hours)
- Responsive design with Tailwind CSS
- GraphQL API with caching
- Micro frontend architecture for scalable development

## Architecture

This application uses a **micro frontend architecture** with Vite Module Federation, allowing independent development and deployment of each module.

```
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Hosting                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐    │
│  │    Shell    │  │ City Search │  │ Weather Display  │    │
│  │   (Host)    │  │    (MF)     │  │      (MF)        │    │
│  │  Port 3000  │  │  Port 3001  │  │    Port 3002     │    │
│  └─────────────┘  └─────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Firebase Cloud Functions                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              GraphQL API (Apollo Server)             │   │
│  │                     Port 3003                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   OpenWeather API                            │
└─────────────────────────────────────────────────────────────┘
```

### Micro Frontends

| Module | Description | Exposes |
|--------|-------------|---------|
| **Shell** | Host application, routing, layout | - |
| **City Search** | City search functionality | `CitySearch` component |
| **Weather Display** | Weather visualization | `WeatherDisplay`, `CurrentWeather`, `Forecast` |
| **Shared** | Common utilities, types, Apollo client | Types, hooks, utilities |

### Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Build:** Vite 5, Module Federation
- **API:** Apollo Server 5, GraphQL
- **Data:** OpenWeather API
- **Hosting:** Firebase Hosting + Cloud Functions
- **Runtime:** Node.js 22

## Project Structure

```
weather-app/
├── packages/
│   ├── shared/              # Shared types, utilities, Apollo client
│   │   └── src/
│   │       ├── apollo/      # Apollo Client configuration
│   │       ├── types/       # TypeScript types
│   │       ├── utils/       # Utility functions, event bus
│   │       └── hooks/       # Shared React hooks
│   ├── shell/               # Host micro frontend
│   │   └── src/
│   │       ├── components/  # Layout, ErrorBoundary, Loading
│   │       └── App.tsx      # Main app with routing
│   ├── city-search/         # City search micro frontend
│   │   └── src/
│   │       └── components/  # CitySearch component
│   └── weather-display/     # Weather display micro frontend
│       └── src/
│           └── components/  # Weather components
├── functions/               # Firebase Cloud Functions
│   └── src/
│       ├── index.ts         # GraphQL function entry
│       ├── schema.ts        # GraphQL schema
│       └── resolvers.ts     # GraphQL resolvers
├── src/
│   └── server/              # Local development server
│       ├── graphql/         # GraphQL schema & resolvers
│       └── api/             # Weather & geocoding APIs
├── scripts/
│   └── assemble-firebase.mjs # Firebase build assembly
├── firebase.json            # Firebase configuration
└── package.json             # Root workspace config
```

## Local Development

### Prerequisites

- Node.js 22+
- npm 9+
- OpenWeather API key (free at https://openweathermap.org/api)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd weather-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Create .env file in root
   echo "OPENWEATHER_API_KEY=your_api_key_here" > .env
   echo "PORT=3003" >> .env
   ```

4. **Build shared package**
   ```bash
   npm run build:shared
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This starts:
   - Shell (host): http://localhost:3000
   - City Search MF: http://localhost:3001
   - Weather Display MF: http://localhost:3002
   - GraphQL Server: http://localhost:3003

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start all services for development |
| `npm run build` | Build all packages |
| `npm run test` | Run tests |
| `npm run typecheck` | TypeScript type checking |

## Deployment to Firebase

### Prerequisites

- Firebase account with Blaze plan (pay-as-you-go)
- Firebase CLI installed

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Follow the setup wizard
4. Enable Blaze plan for Cloud Functions

### Step 2: Configure Firebase CLI

```bash
# Login to Firebase
npm run firebase:login

# Update .firebaserc with your project ID
# Edit .firebaserc and replace the project ID with yours
```

### Step 3: Set API Key Secret

```bash
# Set the OpenWeather API key as a Firebase secret
npx firebase functions:secrets:set OPENWEATHER_API_KEY
# Enter your API key when prompted
```

### Step 4: Deploy

```bash
# Full deployment (builds and deploys everything)
npm run firebase:deploy
```

### Deployment Scripts

| Script | Description |
|--------|-------------|
| `npm run firebase:build` | Build all MFs for Firebase |
| `npm run firebase:deploy` | Build and deploy everything |
| `npm run firebase:deploy:hosting` | Deploy hosting only |
| `npm run firebase:deploy:functions` | Deploy functions only |
| `npm run firebase:emulators` | Run Firebase emulators locally |

### Firebase Architecture

After deployment, your app will be available at:

- **Hosting:** `https://<project-id>.web.app`
- **GraphQL API:** `https://us-central1-<project-id>.cloudfunctions.net/graphql`

The `firebase.json` configures:
- Static file hosting for all micro frontends
- URL rewrites to route `/graphql` to Cloud Functions
- CORS headers for module federation

## GraphQL API

### Endpoints

- **Production:** `https://us-central1-weather-app-d4f7e.cloudfunctions.net/graphql`
- **Development:** `http://localhost:3003/graphql`

### Example Queries

```graphql
# Get comprehensive weather data
query Weather($lat: Float!, $lon: Float!) {
  weather(lat: $lat, lon: $lon) {
    current {
      temp
      feels_like
      humidity
      weather {
        main
        description
        icon
      }
    }
    forecast {
      dt
      temp { min max }
      weather { main icon }
    }
    hourly {
      dt
      temp
      weather { icon }
    }
  }
}

# Search for cities
query SearchCities($query: String!) {
  searchCities(query: $query, limit: 5) {
    id
    name
    country
    state
    lat
    lon
  }
}
```

## Module Federation

### How It Works

1. **Shell (Host)** loads remote modules at runtime from City Search and Weather Display
2. **Remote MFs** expose components via `remoteEntry.js`
3. **Shared dependencies** (React, Apollo) are shared to avoid duplication

### Configuration

**Shell (consumer):**
```typescript
// packages/shell/vite.config.ts
federation({
  name: 'shell',
  remotes: {
    citySearch: '/city-search/assets/remoteEntry.js',
    weatherDisplay: '/weather-display/assets/remoteEntry.js'
  },
  shared: ['react', 'react-dom', 'react-router-dom', '@apollo/client']
})
```

**City Search (remote):**
```typescript
// packages/city-search/vite.config.ts
federation({
  name: 'citySearch',
  filename: 'remoteEntry.js',
  exposes: {
    './CitySearch': './src/components/CitySearch.tsx'
  },
  shared: ['react', 'react-dom', 'react-router-dom', '@apollo/client']
})
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENWEATHER_API_KEY` | OpenWeather API key | Yes |
| `PORT` | Server port (default: 3003) | No |
| `NODE_ENV` | Environment (development/production) | No |

## Testing

```bash
# Run all tests
npm test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage
```

## Troubleshooting

### Module Federation Issues

**"City Search module is loading..." stuck**
- Ensure remote MFs are built: `npm run build:remotes`
- In development, remotes must be served via `preview` mode (built files)

### Firebase Deployment Issues

**Cloud Functions timeout during deployment**
- Ensure lazy initialization pattern in `functions/src/index.ts`
- Avoid importing heavy modules at top level

**API key not working**
- Verify secret is set: `npx firebase functions:secrets:access OPENWEATHER_API_KEY`
- Check function has `secrets: ['OPENWEATHER_API_KEY']` in config

## License

MIT
