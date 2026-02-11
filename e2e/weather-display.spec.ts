import { test, expect } from './fixtures';

test.describe('Weather Display', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to a weather page with mock coordinates
    await page.goto('/weather/51.5074,-0.1278?name=London');
  });

  test('shows city name', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'London' })).toBeVisible({ timeout: 15_000 });
  });

  test('displays current temperature', async ({ page }) => {
    // Mock returns 22°C — the large hero temperature is text-6xl
    await expect(page.locator('.text-6xl').filter({ hasText: /22/ })).toBeVisible({ timeout: 15_000 });
  });

  test('shows weather details like humidity and wind', async ({ page }) => {
    // The mock data has humidity: 65 and wind speed. Check the details grid renders.
    await expect(page.getByText('Humidity')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('65%')).toBeVisible();
  });

  test('displays hourly forecast section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /hourly forecast/i })).toBeVisible({ timeout: 15_000 });
  });

  test('displays 7-day forecast section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /7-day forecast/i })).toBeVisible({ timeout: 15_000 });
  });

  test('shows sunrise/sunset section', async ({ page }) => {
    await expect(page.getByText(/sunrise/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/sunset/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('shows "What to Wear" suggestions', async ({ page }) => {
    await expect(page.getByText(/what to wear/i)).toBeVisible({ timeout: 15_000 });
  });

  test('shows weather map section', async ({ page }) => {
    await expect(page.getByText(/weather map/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('share button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /share/i })).toBeVisible({ timeout: 15_000 });
  });
});
