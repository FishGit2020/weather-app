import { test as base, Page } from '@playwright/test';

/** Sample GraphQL response payloads for mocking the /graphql endpoint. */

const now = Math.floor(Date.now() / 1000);

export const mockCurrentWeather = {
  temp: 22,
  feels_like: 20,
  temp_min: 18,
  temp_max: 25,
  pressure: 1013,
  humidity: 65,
  weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
  wind: { speed: 3.5, deg: 180, gust: 5.2 },
  clouds: { all: 10 },
  dt: now,
  timezone: 3600,
  sunrise: now - 20000,
  sunset: now + 20000,
  visibility: 10000,
};

export const mockForecast = Array.from({ length: 7 }, (_, i) => ({
  dt: now + 86400 * (i + 1),
  temp: { min: 15 + i, max: 25 + i, day: 22 + i, night: 16 + i },
  weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
  humidity: 60,
  wind_speed: 4,
  pop: 0.1,
}));

export const mockHourly = Array.from({ length: 24 }, (_, i) => ({
  dt: now + 3600 * i,
  temp: 18 + Math.sin(i / 24 * Math.PI * 2) * 5,
  weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
  pop: 0.1,
  wind_speed: 3.5,
}));

export const mockSearchCities = [
  { id: '51.5074,-0.1278', name: 'London', country: 'GB', state: 'England', lat: 51.5074, lon: -0.1278 },
  { id: '51.5,-0.08', name: 'London Bridge', country: 'GB', state: 'England', lat: 51.5, lon: -0.08 },
];

/**
 * Intercept GraphQL requests and return mock data so e2e tests
 * don't depend on a live OpenWeather API key.
 */
export async function mockGraphQL(page: Page) {
  await page.route('**/graphql', async (route) => {
    const request = route.request();

    // Only intercept POST (GraphQL queries)
    if (request.method() !== 'POST') {
      return route.continue();
    }

    let body: any;
    try {
      body = request.postDataJSON();
    } catch {
      return route.continue();
    }

    const operationName = body?.operationName;

    if (operationName === 'GetWeather') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            weather: {
              current: mockCurrentWeather,
              forecast: mockForecast,
              hourly: mockHourly,
            },
          },
        }),
      });
    }

    if (operationName === 'GetCurrentWeather') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { currentWeather: mockCurrentWeather },
        }),
      });
    }

    if (operationName === 'SearchCities') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { searchCities: mockSearchCities },
        }),
      });
    }

    if (operationName === 'ReverseGeocode') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            reverseGeocode: [mockSearchCities[0]],
          },
        }),
      });
    }

    // Default: pass through
    return route.continue();
  });
}

/** Extended test fixture that sets up GraphQL mocks for every test. */
export const test = base.extend<{ mockApi: void }>({
  mockApi: [async ({ page }, use) => {
    await mockGraphQL(page);
    await use();
  }, { auto: true }],
});

export { expect } from '@playwright/test';
