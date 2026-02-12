import { test, expect } from './fixtures';

test.describe('Podcast Player', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/podcasts');
  });

  test('renders podcast page with title', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: /podcasts/i })).toBeVisible({ timeout: 15_000 });
  });

  test('has a podcast search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/search podcasts/i)).toBeVisible({ timeout: 15_000 });
  });

  test('shows trending section with podcast cards', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 2, name: 'Trending' })).toBeVisible({ timeout: 15_000 });

    // Should show trending podcast cards from mock data (use exact to avoid matching "Trending Show 10")
    await expect(page.getByRole('heading', { name: 'Trending Show 1', exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Host 1').first()).toBeVisible();
  });

  test('shows multiple trending podcasts', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Trending Show 1', exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Trending Show 2', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Trending Show 3', exact: true })).toBeVisible();
  });

  test('trending cards have subscribe buttons', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Trending Show 1', exact: true })).toBeVisible({ timeout: 15_000 });

    // Each card should have a subscribe button
    const subscribeButtons = page.getByRole('button', { name: /^Subscribe /i });
    await expect(subscribeButtons.first()).toBeVisible();
  });

  test('typing in search shows podcast results', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search podcasts/i);
    await expect(searchInput).toBeVisible({ timeout: 15_000 });
    await searchInput.fill('Tech');

    // Wait for mock search results
    await expect(page.getByText('Tech Talk Daily').first()).toBeVisible({ timeout: 10_000 });
  });

  test('clicking a trending podcast shows episodes', async ({ page }) => {
    // Wait for trending to load and click first card
    const firstCard = page.getByRole('button', { name: /^Trending Show 1 /i });
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.click();

    // Should show episodes section
    await expect(page.getByRole('heading', { name: /episodes/i })).toBeVisible({ timeout: 10_000 });
  });

  test('podcast detail shows episode list', async ({ page }) => {
    const firstCard = page.getByRole('button', { name: /^Trending Show 1 /i });
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.click();

    // Should show episodes from mock data
    await expect(page.getByText(/Episode 1: Great Content/)).toBeVisible({ timeout: 10_000 });
  });

  test('can navigate back from podcast detail', async ({ page }) => {
    const firstCard = page.getByRole('button', { name: /^Trending Show 1 /i });
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.click();

    // Wait for episodes to load, then click the back link (it's the link/button with just "Trending" text)
    await expect(page.getByRole('heading', { name: /episodes/i })).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'Trending', exact: true }).click();

    // Should see trending section again
    await expect(page.getByRole('heading', { level: 2, name: 'Trending' })).toBeVisible({ timeout: 10_000 });
  });
});
