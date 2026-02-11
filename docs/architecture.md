# Micro Frontend Architecture Analysis

A comprehensive analysis of the Weather Tracker application architecture, covering micro frontend communication, data flow, persistence, and key implementation patterns.

## Table of Contents

- [High-Level Architecture](#high-level-architecture)
- [Micro Frontends](#micro-frontends)
- [Inter-MFE Communication](#inter-mfe-communication)
- [Data Flow](#data-flow)
- [Persistence & Storage](#persistence--storage)
- [GraphQL & Apollo Client](#graphql--apollo-client)
- [Authentication & User Profile](#authentication--user-profile)
- [Theme System](#theme-system)
- [Key Files Reference](#key-files-reference)

---

## High-Level Architecture

```
+-------------------------------------------------------------+
|                    Firebase Hosting                          |
+-------------------------------------------------------------+
|  +-----------+  +-------------+  +--------------------+     |
|  |   Shell   |  | City Search |  | Weather Display    |     |
|  |  (Host)   |  |    (MFE)    |  |      (MFE)         |     |
|  | Port 3000 |  |  Port 3001  |  |    Port 3002       |     |
|  +-----------+  +-------------+  +--------------------+     |
+-------------------------------------------------------------+
                          |
                          v
+-------------------------------------------------------------+
|                Firebase Cloud Functions                      |
|  +-----------------------------------------------------+   |
|  |            GraphQL API (Apollo Server)               |   |
|  |                   Port 3003                          |   |
|  +-----------------------------------------------------+   |
+-------------------------------------------------------------+
                          |
                          v
+-------------------------------------------------------------+
|                   OpenWeather API                            |
+-------------------------------------------------------------+
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS |
| **Build** | Vite 5, Module Federation |
| **API** | Apollo Server 5, GraphQL |
| **Data Source** | OpenWeather API |
| **Hosting** | Firebase Hosting + Cloud Functions |
| **Auth** | Firebase Auth (Google OAuth) |
| **Database** | Cloud Firestore |
| **Runtime** | Node.js 22 |

---

## Micro Frontends

### Shell (Host) - `packages/shell/`

The orchestrator that loads and composes the remote micro frontends.

**Responsibilities:**
- Application routing (React Router v6)
- Layout: sticky header, navigation, footer
- Authentication context (Firebase Auth)
- Theme context (dark/light mode)
- Loading remote MFEs via Module Federation

**Route Structure:**
```
/                  -> Home (CitySearchWrapper + UseMyLocation)
/weather/:coords   -> WeatherDisplay MFE (lazy-loaded)
/*                 -> 404 NotFound
```

**Provider Hierarchy:**
```
ApolloProvider
  -> AuthProvider
    -> ThemeProvider
      -> ThemeSync (side-effect component)
      -> BrowserRouter
        -> Layout (Outlet)
          -> Routes
```

### City Search (Remote MFE) - `packages/city-search/`

Exposes `CitySearch` component via Module Federation.

**Key Behavior:**
- Input focus with empty query -> shows "Recent Searches" dropdown (up to 5 cities)
- Typing triggers a 300ms debounced GraphQL `searchCities` query
- City selection publishes `CITY_SELECTED` event via event bus
- Click-outside detection closes all dropdowns
- Receives `recentCities` as a prop from the shell's `CitySearchWrapper`

**Module Federation Config:**
```typescript
federation({
  name: 'citySearch',
  filename: 'remoteEntry.js',
  exposes: {
    './CitySearch': './src/components/CitySearch.tsx'
  },
  shared: ['react', 'react-dom', 'react-router-dom', '@apollo/client']
})
```

### Weather Display (Remote MFE) - `packages/weather-display/`

Exposes `WeatherDisplay`, `CurrentWeather`, and `Forecast` components.

**Key Behavior:**
- Extracts `lat,lon` from URL params (`/weather/:coords`)
- Listens for `CITY_SELECTED` DOM events from other MFEs
- Uses `useWeatherData(lat, lon, true)` hook with real-time subscriptions
- Renders: `CurrentWeather`, `HourlyForecast`, `Forecast`
- Shows a "Live" badge when WebSocket subscription is active

**Data Displayed:**
| Component | Data Points |
|-----------|------------|
| **CurrentWeather** | Temperature, feels-like, weather icon, description, humidity, wind speed + direction, pressure, cloudiness |
| **HourlyForecast** | 48-hour forecast with temp, icon, rain probability |
| **Forecast** | 7-day grid with date, icon, max/min temps, description, rain probability |

### Shared Package - `packages/shared/`

Library consumed by all micro frontends. Not a standalone app.

**Exports (via barrel `src/index.ts`):**
- Apollo Client factory & singleton (`createApolloClient`, `getApolloClient`)
- GraphQL queries & fragments (`GET_WEATHER`, `SEARCH_CITIES`, etc.)
- Event bus (`eventBus`, `MFEvents`, `subscribeToMFEvent`)
- Types (`City`, `CurrentWeather`, `ForecastDay`, etc.)
- Hooks (`useWeatherData`)
- Utility functions (weather icons, formatting)

---

## Inter-MFE Communication

### Event Bus

A singleton event bus (`packages/shared/src/utils/eventBus.ts`) using two delivery mechanisms:

1. **In-process listeners** — for same-bundle communication (e.g., shell components)
2. **DOM CustomEvents** — for cross-MFE communication via `window.dispatchEvent`

```typescript
class EventBusImpl {
  private listeners: Map<string, Set<EventCallback>>;

  subscribe(event, callback)    // In-process listener, returns unsubscribe fn
  publish(event, data)          // Fires local listeners + dispatches DOM event
}

// For listening to events from OTHER micro frontends (DOM-level)
function subscribeToMFEvent(event, callback)  // window.addEventListener wrapper
```

### Event Types

```typescript
const MFEvents = {
  CITY_SELECTED:        'mf:city-selected',
  WEATHER_LOADED:       'mf:weather-loaded',
  NAVIGATION_REQUEST:   'mf:navigation-request',
  THEME_CHANGED:        'mf:theme-changed',
  USER_LOCATION_CHANGED: 'mf:user-location-changed'
}
```

### Communication Flows

**City Selection (primary flow):**
```
CitySearch.tsx                          CitySearchWrapper.tsx
(city-search MFE)                       (shell)
     |                                       |
     |-- eventBus.publish(CITY_SELECTED) --> eventBus.subscribe(CITY_SELECTED)
     |                                       |
     |                                       +--> addCity() -> Firestore
     |
     +-- navigate(/weather/:coords)
                                        WeatherDisplay.tsx
                                        (weather-display MFE)
                                             |
                                        subscribeToMFEvent(CITY_SELECTED)
                                             |
                                             +--> setLocation() -> fetch weather
```

**Geolocation Flow:**
```
UseMyLocation.tsx (shell)
     |
     +--> navigator.geolocation.getCurrentPosition()
     |
     +--> REVERSE_GEOCODE GraphQL query
     |
     +--> sessionStorage.setItem('selectedCity', ...)
     |
     +--> navigate(/weather/:lat,:lon)
```

---

## Data Flow

### Complete Data Flow Diagram

```
SHELL APP (Host)
|
+-- AuthProvider (Context)
|   +-- Firebase Auth subscription (onAuthStateChanged)
|   +-- User profile state (Firestore)
|   +-- Recent cities state
|
+-- ThemeProvider (Context)
|   +-- Theme state ('light' | 'dark')
|   +-- localStorage persistence
|   +-- System preference detection (prefers-color-scheme)
|
+-- ApolloProvider
|   +-- GraphQL client (HTTP + WS links)
|   +-- In-memory cache (normalized by lat/lon)
|
+-- Layout
    +-- ThemeToggle -> updateDarkMode() -> Firestore
    +-- UserMenu -> signIn/signOut -> Firebase Auth
    |
    +-- CitySearchWrapper (loads CitySearch MFE)
    |   +-- Listens to CITY_SELECTED event
    |   +-- Saves city to Firestore via addCity()
    |   +-- Passes recentCities as prop to CitySearch
    |
    +-- WeatherDisplay MFE
        +-- Listens to CITY_SELECTED event
        +-- useWeatherData hook
        +-- Queries GraphQL via Apollo
        +-- Renders current + forecast + hourly
```

---

## Persistence & Storage

### Firebase Firestore — User Profile

**Document path:** `users/{uid}`

```typescript
interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  darkMode: boolean;
  recentCities: RecentCity[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface RecentCity {
  id: string;           // "{lat},{lon}"
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  searchedAt: Date;
}
```

**Recent Cities Rules:**
- Deduplicated by `id` on save (existing entry removed before prepend)
- Sorted by recency (newest first)
- Hard limit of 10 cities
- Only saved when user is authenticated

### Browser LocalStorage — Theme

| Key | Value | Purpose |
|-----|-------|---------|
| `'theme'` | `'light'` or `'dark'` | Fast theme restore on page load (before Firestore loads) |

### Browser SessionStorage — Geolocation

| Key | Value | Purpose |
|-----|-------|---------|
| `'selectedCity'` | City JSON | Temporary storage after reverse geocode lookup |

### Apollo In-Memory Cache

- Cache normalization by `lat` and `lon` coordinates
- Fetch policies: `cache-and-network` for watch queries, `network-only` for one-off queries
- Shared across all MFEs via the same Apollo Client instance

---

## GraphQL & Apollo Client

### Client Configuration

```typescript
// packages/shared/src/apollo/client.ts

// Environment-aware endpoint detection
const graphqlUrl = isProduction
  ? '/graphql'                          // Firebase Functions proxy
  : 'http://localhost:3003/graphql';    // Local dev server

// WebSocket subscriptions only in development
const wsUrl = isDev
  ? 'ws://localhost:3003/graphql'
  : null;                               // Disabled in production
```

**Cache Type Policies:**
```typescript
typePolicies: {
  Query: {
    fields: {
      weather:         { keyArgs: ['lat', 'lon'] },
      currentWeather:  { keyArgs: ['lat', 'lon'] },
      forecast:        { keyArgs: ['lat', 'lon'] },
      hourlyForecast:  { keyArgs: ['lat', 'lon'] },
    }
  }
}
```

### Queries & Subscription

| Query | Parameters | Returns |
|-------|-----------|---------|
| `GET_WEATHER` | `lat, lon` | `current` + `forecast[]` + `hourly[]` |
| `GET_CURRENT_WEATHER` | `lat, lon` | `CurrentWeather` |
| `GET_FORECAST` | `lat, lon` | `ForecastDay[]` |
| `GET_HOURLY_FORECAST` | `lat, lon` | `HourlyForecast[]` |
| `SEARCH_CITIES` | `query, limit` | `City[]` |
| `REVERSE_GEOCODE` | `lat, lon` | `City` |
| `WEATHER_UPDATES` (subscription) | `lat, lon` | `WeatherUpdate` (real-time) |

All weather queries share a `WeatherConditionFragment` for consistent field selection.

### useWeatherData Hook

```typescript
// packages/shared/src/hooks/useWeatherData.ts

function useWeatherData(lat, lon, enableRealtime) {
  // Always runs: HTTP query
  const { data, loading, error } = useQuery(GET_WEATHER, { variables: { lat, lon } });

  // Dev only: WebSocket subscription
  useSubscription(WEATHER_UPDATES, {
    skip: isProduction || !enableRealtime,
    variables: { lat, lon },
    onData: ({ data }) => { /* merge subscription data */ }
  });

  return {
    current,      // Subscription data takes priority over query data
    forecast,
    hourly,
    loading,
    error,
    isLive,       // True when subscription is active
    lastUpdate    // Timestamp of last subscription update
  };
}
```

---

## Authentication & User Profile

### Auth Flow

```
User clicks "Sign In"
     |
     v
signInWithPopup(auth, GoogleAuthProvider)
     |
     v
ensureUserProfile(user)          // Creates Firestore doc if first login
     |
     v
onAuthStateChanged fires
     |
     v
AuthProvider:
  +-- setUser(firebaseUser)
  +-- getUserProfile(uid)        // Fetch from Firestore
  +-- setProfile(profile)
  +-- setRecentCities(profile.recentCities)
```

### Profile Operations

| Function | Description |
|----------|------------|
| `ensureUserProfile(user)` | Creates Firestore doc on first login |
| `getUserProfile(uid)` | Reads profile from Firestore |
| `addRecentCity(uid, city)` | Deduplicates, prepends, caps at 10, writes to Firestore |
| `getRecentCities(uid)` | Reads `recentCities` from profile |
| `updateUserDarkMode(uid, darkMode)` | Updates dark mode preference |

---

## Theme System

### Dual-Layer Persistence

The theme system uses two persistence layers for different purposes:

1. **LocalStorage** — fast restore on page load (avoids flash of wrong theme)
2. **Firestore** — cross-device sync for authenticated users

### Initialization Priority

```
1. Read localStorage('theme')
2. If not set, check system preference: matchMedia('prefers-color-scheme: dark')
3. Apply 'dark' class to <html> element
4. After auth loads: ThemeSync reads profile.darkMode from Firestore
5. If profile preference differs, override local theme
```

### ThemeSync Component

A side-effect-only component (`renders null`) that bridges auth and theme contexts:

```
Auth profile loads -> ThemeSync reads profile.darkMode -> setThemeFromProfile()
```

---

## Key Files Reference

| Component | File Path | Purpose |
|-----------|-----------|---------|
| **App (Shell)** | `packages/shell/src/App.tsx` | Routing, lazy MFE loading |
| **Layout** | `packages/shell/src/components/Layout.tsx` | Header, footer, outlet |
| **CitySearchWrapper** | `packages/shell/src/components/CitySearchWrapper.tsx` | MFE host, event listener, city persistence |
| **UseMyLocation** | `packages/shell/src/components/UseMyLocation.tsx` | Geolocation + reverse geocode |
| **AuthContext** | `packages/shell/src/context/AuthContext.tsx` | User state, recent cities, profile ops |
| **ThemeContext** | `packages/shell/src/context/ThemeContext.tsx` | Theme state, localStorage, system pref |
| **ThemeSync** | `packages/shell/src/components/ThemeSync.tsx` | Auth -> theme sync |
| **Firebase Lib** | `packages/shell/src/lib/firebase.ts` | Firestore CRUD, auth functions |
| **CitySearch** | `packages/city-search/src/components/CitySearch.tsx` | Search UI, debounce, event publishing |
| **WeatherDisplay** | `packages/weather-display/src/components/WeatherDisplay.tsx` | Weather UI, event listener, subscriptions |
| **CurrentWeather** | `packages/weather-display/src/components/CurrentWeather.tsx` | Current conditions display |
| **Forecast** | `packages/weather-display/src/components/Forecast.tsx` | 7-day forecast grid |
| **Event Bus** | `packages/shared/src/utils/eventBus.ts` | Cross-MFE communication |
| **Apollo Client** | `packages/shared/src/apollo/client.ts` | GraphQL setup, caching |
| **Queries** | `packages/shared/src/apollo/queries.ts` | GraphQL queries & subscription |
| **useWeatherData** | `packages/shared/src/hooks/useWeatherData.ts` | Weather data fetching + real-time |
| **GraphQL Server** | `server/index.ts` | Local dev Express + Apollo + WebSocket |
| **GraphQL Schema** | `server/graphql/schema.ts` | Type definitions + subscription |
| **GraphQL Resolvers** | `server/graphql/resolvers.ts` | Query + subscription resolvers |
| **Firebase Functions** | `functions/src/index.ts` | Production GraphQL Cloud Function |

---

## Project Structure

```
weather-app/
+-- packages/
|   +-- shared/                  # Shared types, utilities, Apollo client
|   |   +-- src/
|   |       +-- apollo/          # Client factory, queries, fragments
|   |       +-- types/           # TypeScript interfaces
|   |       +-- utils/           # Event bus, weather helpers
|   |       +-- hooks/           # useWeatherData
|   |       +-- index.ts         # Barrel exports
|   +-- shell/                   # Host micro frontend
|   |   +-- src/
|   |       +-- components/      # Layout, ErrorBoundary, CitySearchWrapper, etc.
|   |       +-- context/         # AuthContext, ThemeContext
|   |       +-- lib/             # Firebase integration
|   |       +-- App.tsx          # Routes & providers
|   +-- city-search/             # City search micro frontend
|   |   +-- src/
|   |       +-- components/      # CitySearch
|   +-- weather-display/         # Weather display micro frontend
|       +-- src/
|           +-- components/      # WeatherDisplay, CurrentWeather, Forecast
+-- server/                      # Local development GraphQL server
|   +-- api/                     # OpenWeather & geocoding API clients
|   +-- graphql/                 # Schema, resolvers, pubsub
|   +-- middleware/              # Server-side caching
|   +-- types/                   # Server TypeScript types
+-- functions/                   # Firebase Cloud Functions (production)
|   +-- src/
|       +-- index.ts             # Cloud Function entry
|       +-- schema.ts            # GraphQL schema (production)
|       +-- resolvers.ts         # Self-contained resolvers
+-- scripts/
|   +-- assemble-firebase.mjs   # Firebase build assembly
+-- firebase.json               # Firebase hosting + functions config
+-- package.json                # Root workspace config (pnpm)
+-- pnpm-workspace.yaml        # Workspace package declarations
```
