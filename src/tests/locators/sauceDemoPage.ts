import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for the Sauce Labs "Swag Labs" demo site at https://www.saucedemo.com/.
 *
 * Every locator below was confirmed against the live UI via Playwright MCP
 * browser_snapshot / browser_evaluate on 2026-06-25. The Sauce Demo app exposes
 * a `data-test="..."` attribute on every interactive element we care about,
 * which we use as the primary (and, where possible, only) locator strategy —
 * these hooks are unambiguous and survive CSS refactors.
 */
export class SauceDemoPage {
  readonly page: Page;

  // --- Login page (https://www.saucedemo.com/) ---
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly loginErrorMessage: Locator;

  // --- Inventory page (https://www.saucedemo.com/inventory.html) ---
  readonly inventoryHeading: Locator;
  readonly backpackAddToCartButton: Locator;
  readonly backpackRemoveButton: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  // --- Cart page (https://www.saucedemo.com/cart.html) ---
  readonly cartHeading: Locator;
  readonly cartItems: Locator;
  readonly cartBackpackRow: Locator;
  readonly backpackCartQuantity: Locator;
  readonly backpackCartName: Locator;
  readonly backpackCartDescription: Locator;
  readonly backpackCartPrice: Locator;
  readonly backpackCartRemoveButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // --- Login ---
    // data-test="username" / "password" / "login-button" — observed in live DOM.
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    // The login error container is rendered as the h3 with data-test="error".
    this.loginErrorMessage = page.locator('[data-test="error"]');

    // --- Inventory ---
    // "Products" page label — observed in the live inventory snapshot: it is a
    // <span class="title" data-test="title">Products</span>, NOT a heading role.
    // The earlier `getByRole('heading', { name: 'Products' })` locator timed out
    // because the span has no implicit/explicit heading role. Pin to the
    // data-test attribute the app actually exposes.
    this.inventoryHeading = page.locator('[data-test="title"]', { hasText: 'Products' });
    // Toggle states for the Sauce Labs Backpack (data-test swaps between add/remove).
    this.backpackAddToCartButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
    this.backpackRemoveButton = page.locator('[data-test="remove-sauce-labs-backpack"]');
    // Header cart link / badge. The badge element only renders when count > 0.
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');

    // --- Cart ---
    // "Your Cart" is also a <span class="title" data-test="title"> — same pattern
    // as the inventory heading. Match by text rather than heading role.
    this.cartHeading = page.locator('[data-test="title"]', { hasText: 'Your Cart' });
    // All cart rows share data-test="inventory-item".
    this.cartItems = page.locator('[data-test="inventory-item"]');
    // Narrow to the Sauce Labs Backpack row by filtering on its product-name locator.
    this.cartBackpackRow = this.cartItems.filter({
      has: page.locator('[data-test="inventory-item-name"]', { hasText: 'Sauce Labs Backpack' }),
    });
    this.backpackCartQuantity = this.cartBackpackRow.locator('[data-test="item-quantity"]');
    this.backpackCartName = this.cartBackpackRow.locator('[data-test="inventory-item-name"]');
    this.backpackCartDescription = this.cartBackpackRow.locator('[data-test="inventory-item-desc"]');
    this.backpackCartPrice = this.cartBackpackRow.locator('[data-test="inventory-item-price"]');
    this.backpackCartRemoveButton = this.cartBackpackRow.locator('[data-test="remove-sauce-labs-backpack"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  // --- High-level actions used by the step definitions ---

  async openLogin(): Promise<void> {
    await this.page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
    await this.usernameInput.waitFor({ state: 'visible' });
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    // The login button is an <input type="submit"> — clicking it triggers a
    // full form submit + redirect to /inventory.html. We have to await the
    // navigation explicitly because Playwright's click() does not wait for
    // cross-page navigations by default, and headless-false launches (see
    // hooks.ts) have been seen to race the implicit wait.
    await Promise.all([
      this.page.waitForURL(/\/inventory\.html/, { timeout: 20000 }),
      this.loginButton.click(),
    ]);
    // Belt-and-braces: the inventory heading only renders on /inventory.html.
    await this.inventoryHeading.waitFor({ state: 'visible', timeout: 20000 });
  }

  async addBackpackToCart(): Promise<void> {
    await this.backpackAddToCartButton.waitFor({ state: 'visible' });
    await this.backpackAddToCartButton.click();
    // Wait for the toggle to complete: the "Remove" button + the badge both appear.
    await this.backpackRemoveButton.waitFor({ state: 'visible' });
    await expect(this.cartBadge).toHaveText('1');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
    await this.page.waitForURL(/\/cart\.html$/);
    await this.cartHeading.waitFor({ state: 'visible' });
  }

  async removeBackpackFromCart(): Promise<void> {
    await this.backpackCartRemoveButton.waitFor({ state: 'visible' });
    await this.backpackCartRemoveButton.click();
    // Wait for the backpack row to disappear from the cart list.
    await expect(this.cartBackpackRow).toHaveCount(0);
  }
}
