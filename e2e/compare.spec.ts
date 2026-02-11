import { test, expect } from './fixtures';

test.describe('Weather Compare page', () => {
  test('renders compare page with heading', async ({ page }) => {
    await page.goto('/compare');

    await expect(page.getByRole('heading', { name: 'Compare Weather' })).toBeVisible();
  });

  test('shows instruction for adding favorites', async ({ page }) => {
    await page.goto('/compare');

    // Since user is not logged in, it should show a message about needing favorites/recent cities
    await expect(page.getByText(/favorites|recent/i).first()).toBeVisible();
  });
});
