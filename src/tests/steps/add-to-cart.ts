import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

// Sauce Demo is a stateless (per-session) demo app — every scenario gets a fresh
// browser context from src/tests/support/hooks.ts, so we don't need to reset
// cart state between scenarios. Scoped state on the World keeps any
// cross-step values (e.g. captured quantities) for assertions within a scenario.
type SauceState = {
  capturedQuantity?: string;
  capturedName?: string;
  capturedPrice?: string;
  capturedDesc?: string;
};

const SAUCE_DEMO_BASE_URL = 'https://www.saucedemo.com/';

Given('I open the Sauce Demo login page', async function (this: CustomWorld) {
  (this as unknown as { __sauceState: SauceState }).__sauceState = {};
  await this.pageLocator.sauceDemoPage.openLogin();
});

Given(
  'I log in to Sauce Demo as {string} with password {string}',
  async function (this: CustomWorld, username: string, password: string) {
    await this.pageLocator.sauceDemoPage.login(username, password);
  },
);

Then('the cart badge should not be visible', async function (this: CustomWorld) {
  await expect(this.pageLocator.sauceDemoPage.cartBadge).toHaveCount(0);
});

Then('the cart badge displays {string}', async function (this: CustomWorld, text: string) {
  await expect(this.pageLocator.sauceDemoPage.cartBadge).toHaveText(text);
});

Then('the cart badge should display {string}', async function (this: CustomWorld, text: string) {
  // Alias of "the cart badge displays {string}" — kept so the feature file
  // can use either phrasing without forcing a rewrite.
  await expect(this.pageLocator.sauceDemoPage.cartBadge).toHaveText(text);
});

When('I add the Sauce Labs Backpack to the cart from inventory', async function (this: CustomWorld) {
  await this.pageLocator.sauceDemoPage.addBackpackToCart();
});

Then(
  'the Sauce Labs Backpack inventory button should be labelled {string}',
  async function (this: CustomWorld, expected: string) {
    // After toggling, the Add button is gone and the Remove button is present with the expected label.
    await expect(this.pageLocator.sauceDemoPage.backpackAddToCartButton).toHaveCount(0);
    await expect(this.pageLocator.sauceDemoPage.backpackRemoveButton).toBeVisible();
    await expect(this.pageLocator.sauceDemoPage.backpackRemoveButton).toHaveText(expected);
  },
);

Given('the Sauce Labs Backpack has been added to the cart from inventory', async function (this: CustomWorld) {
  await this.pageLocator.sauceDemoPage.addBackpackToCart();
});

When('I open the cart page', async function (this: CustomWorld) {
  await this.pageLocator.sauceDemoPage.openCart();
});

Then('the Sauce Labs Backpack cart row should show quantity {string}', async function (this: CustomWorld, expected: string) {
  const state = (this as unknown as { __sauceState: SauceState }).__sauceState;
  await expect(this.pageLocator.sauceDemoPage.backpackCartQuantity).toHaveText(expected);
  state.capturedQuantity = expected;
});

Then(
  'the Sauce Labs Backpack cart row should show name {string}',
  async function (this: CustomWorld, expected: string) {
    const state = (this as unknown as { __sauceState: SauceState }).__sauceState;
    await expect(this.pageLocator.sauceDemoPage.backpackCartName).toHaveText(expected);
    state.capturedName = expected;
  },
);

Then(
  'the Sauce Labs Backpack cart row should show price {string}',
  async function (this: CustomWorld, expected: string) {
    const state = (this as unknown as { __sauceState: SauceState }).__sauceState;
    await expect(this.pageLocator.sauceDemoPage.backpackCartPrice).toHaveText(expected);
    state.capturedPrice = expected;
  },
);

Then(
  'the Sauce Labs Backpack cart row should show a description beginning with {string}',
  async function (this: CustomWorld, prefix: string) {
    const state = (this as unknown as { __sauceState: SauceState }).__sauceState;
    const text = (await this.pageLocator.sauceDemoPage.backpackCartDescription.textContent()) ?? '';
    expect(text.startsWith(prefix)).toBe(true);
    state.capturedDesc = text;
  },
);

Then('the Sauce Labs Backpack cart row should show a Remove button', async function (this: CustomWorld) {
  await expect(this.pageLocator.sauceDemoPage.backpackCartRemoveButton).toBeVisible();
  await expect(this.pageLocator.sauceDemoPage.backpackCartRemoveButton).toHaveText('Remove');
});

When('I remove the Sauce Labs Backpack from the cart', async function (this: CustomWorld) {
  await this.pageLocator.sauceDemoPage.removeBackpackFromCart();
});

Then('the Sauce Labs Backpack cart row should no longer be visible', async function (this: CustomWorld) {
  await expect(this.pageLocator.sauceDemoPage.cartBackpackRow).toHaveCount(0);
});
