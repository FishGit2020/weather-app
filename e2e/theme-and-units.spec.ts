import { test, expect } from './fixtures';

test.describe('Theme toggle', () => {
  test('toggles dark mode on the page', async ({ page }) => {
    await page.goto('/');

    // The theme toggle button has aria-label "Switch to dark mode" or "Switch to light mode"
    const themeButton = page.getByRole('button', { name: /switch to (dark|light) mode/i });

    const html = page.locator('html');
    const wasDark = await html.evaluate(el => el.classList.contains('dark'));

    await themeButton.click();
    await page.waitForTimeout(300);

    const isDark = await html.evaluate(el => el.classList.contains('dark'));
    expect(isDark).not.toBe(wasDark);
  });
});

test.describe('Unit toggle', () => {
  test('switches between Celsius and Fahrenheit', async ({ page }) => {
    await page.goto('/');

    // Unit toggle button shows "°C" or "°F"
    const unitButton = page.getByRole('button', { name: /°[CF]/ });
    await expect(unitButton).toBeVisible();

    const initialText = await unitButton.textContent();

    await unitButton.click();
    await page.waitForTimeout(300);

    const newText = await unitButton.textContent();
    expect(newText).not.toBe(initialText);
  });
});
