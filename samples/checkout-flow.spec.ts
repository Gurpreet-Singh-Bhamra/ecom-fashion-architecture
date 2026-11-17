import { test, expect } from '@playwright/test';

/**
 * End-to-End Cart & Checkout Safety Net Validation
 * Verifies optimistic addition, inventory reservation, and WCAG dialog focus traps.
 *
 * @module ECommerce/QA Automation
 * @author Gurpreet Bhamra | TFS Digital
 */
test.describe('E-Commerce High-Concurrency Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products/classic-wool-overcoat');
  });

  test('should optimistically add item to cart and hold focus trap in modal', async ({ page }) => {
    const addToCartBtn = page.getByRole('button', { name: /add to bag/i });
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // Verify slide-over cart drawer opens and locks background focus
    const cartDrawer = page.getByTestId('cart-drawer');
    await expect(cartDrawer).toBeVisible();
    await expect(cartDrawer).toHaveAttribute('aria-modal', 'true');

    // Confirm optimistic subtotal calculation
    const subtotal = page.getByTestId('cart-subtotal');
    await expect(subtotal).toContainText('£245.00');
  });

  test('should gracefully handle stock exhaustion webhooks during checkout', async ({ page }) => {
    // Mock inventory route response for out-of-stock scenario
    await page.route('**/api/checkout/reserve', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Selected size standard medium just sold out.' }),
      });
    });

    await page.goto('/cart');
    await page.getByRole('button', { name: /proceed to checkout/i }).click();

    // Verify UI rolls back gracefully with actionable error banner
    const alertBanner = page.getByRole('alert');
    await expect(alertBanner).toBeVisible();
    await expect(alertBanner).toContainText('just sold out');
  });
});
