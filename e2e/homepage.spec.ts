import { test, expect } from './fixtures';

test.describe('Homepage', () => {
  test('renders header with app title and navigation', async ({ page }) => {
    await page.goto('/');

    // App title
    await expect(page.locator('h1')).toContainText('Weather Tracker');

    // Navigation links
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Compare' })).toBeVisible();
  });

  test('shows hero section with search prompt', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Find Weather/i })).toBeVisible();
  });

  test('has a city search input', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByPlaceholder(/search for a city/i);
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
  });

  test('shows "Use My Location" button', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: /use my.*location/i })).toBeVisible();
  });

  test('footer credits OpenWeatherMap', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('footer')).toContainText('OpenWeatherMap');
  });

  test('shows MicroFE badge in header', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('MicroFE')).toBeVisible();
  });
});
