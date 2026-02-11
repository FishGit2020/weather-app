import { test, expect } from './fixtures';

test.describe('Navigation', () => {
  test('Home link returns to homepage', async ({ page }) => {
    await page.goto('/weather/51.5074,-0.1278?name=London');
    await page.getByRole('link', { name: 'Home' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /Find Weather/i })).toBeVisible();
  });

  test('Compare link navigates to compare page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Compare' }).click();

    await expect(page).toHaveURL('/compare');
    await expect(page.getByRole('heading', { name: /Compare Weather/i })).toBeVisible();
  });

  test('clicking app title navigates to home', async ({ page }) => {
    await page.goto('/compare');
    await page.getByRole('link', { name: /weather tracker/i }).click();

    await expect(page).toHaveURL('/');
  });

  test('404 page for unknown routes', async ({ page }) => {
    await page.goto('/some-nonexistent-page');

    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Page not found')).toBeVisible();
  });
});
