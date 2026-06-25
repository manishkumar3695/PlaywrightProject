import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

// --- Constants (hoisted per project convention — no magic strings) ---
const EVENTHUB_URL = 'https://eventhub.rahulshettyacademy.com/';
const DEMO_EMAIL = 'manish123@gmail.com';
const DEMO_PASSWORD = 'Manish9@@';

// --- Scenario-scoped scratch state ---
// Held on the World so a single scenario can capture values mid-flow (e.g. the
// first card's booking id) and then assert against them later. The fresh
// browser per scenario (hooks.ts) ensures this never leaks between scenarios.
type ScenarioState = {
  firstBookingId?: string;
};
function state(world: CustomWorld): ScenarioState {
  if (!(world as any).__bookingsState) {
    (world as any).__bookingsState = {} as ScenarioState;
  }
  return (world as any).__bookingsState as ScenarioState;
}

// --- Background ---

Given('I am signed in to EventHub as the demo user', async function (this: CustomWorld) {
  await this.page.goto(EVENTHUB_URL, { waitUntil: 'domcontentloaded' });
  await this.pageLocator.testPage.userEmailInput.waitFor({ state: 'visible' });
  await this.pageLocator.testPage.userEmailInput.fill(DEMO_EMAIL);
  await this.pageLocator.testPage.passwordInput.fill(DEMO_PASSWORD);
  await this.pageLocator.testPage.signInButton.click();
  // Wait for the dashboard shell to render before navigating to My Bookings.
  await this.page.waitForLoadState('networkidle');
  // Sanity-check that the nav link we'll click in the next step is present.
  // The live UI exposes a "My Bookings" link in three places (top nav, hero CTA,
  // footer); the canonical nav one carries data-testid="nav-bookings". Pin to
  // that test id rather than the multi-match role-based fallback.
  await this.page.getByTestId('nav-bookings').waitFor({ state: 'visible', timeout: 15000 });
});

Given('I open the My Bookings page', async function (this: CustomWorld) {
  await this.page.getByTestId('nav-bookings').click();
  await this.pageLocator.testPage.bookingsHeading.waitFor({ state: 'visible', timeout: 15000 });
  await expect(this.page).toHaveURL(/\/bookings$/);
});

// --- TC-SMK-001 assertions ---

Then('the My Bookings page header should be visible', async function (this: CustomWorld) {
  await expect(this.pageLocator.testPage.bookingsHeading).toBeVisible({ timeout: 15000 });
  await expect(this.pageLocator.testPage.bookingsHeading).toHaveText(/^my bookings$/i);
});

Then('the Clear all bookings button should be visible', async function (this: CustomWorld) {
  const clearBtn = this.page.getByRole('button', { name: /clear all bookings/i });
  await expect(clearBtn).toBeVisible();
});

Then('at least one booking card should be rendered', async function (this: CustomWorld) {
  // The My Bookings page renders bookings as cards with data-testid="booking-card".
  // Use that as the source of truth rather than the visual card class.
  const cards = this.page.locator('[data-testid="booking-card"]');
  await expect.poll(async () => await cards.count(), { timeout: 10000 })
    .toBeGreaterThanOrEqual(1);
});

Then('the first booking card should have a booking id, status badge, and event name', async function (this: CustomWorld) {
  const firstCard = this.page.locator('[data-testid="booking-card"]').first();

  // Booking id (e.g. "#67865") — present and non-empty.
  const bookingId = firstCard.locator('[data-testid="booking-id"]');
  await expect(bookingId).toBeVisible();
  const bookingIdText = (await bookingId.innerText()).trim();
  expect(bookingIdText.length).toBeGreaterThan(0);

  // Status badge — text matches confirmed or cancelled (case-insensitive).
  const statusBadge = firstCard.locator('[data-testid="booking-status"], .status, .badge')
    .filter({ hasText: /^(confirmed|cancelled|canceled|pending|completed)$/i })
    .first();
  // Fallback: any element inside the card whose text matches a status word.
  const fallbackStatus = firstCard.locator(':text-matches("\\\\b(confirmed|cancelled|canceled)\\\\b", "i")').first();
  const status = (await statusBadge.count()) > 0 ? statusBadge : fallbackStatus;
  await expect(status).toBeVisible();

  // Event name — an h3 inside the first card, non-empty.
  const eventName = firstCard.locator('h3').first();
  await expect(eventName).toBeVisible();
  const eventNameText = (await eventName.innerText()).trim();
  expect(eventNameText.length).toBeGreaterThan(0);
});

Then('the first booking card should have View Details and Cancel Booking actions', async function (this: CustomWorld) {
  const firstCard = this.page.locator('[data-testid="booking-card"]').first();

  // View Details — link or button with that label, scoped to the first card.
  const viewDetails = firstCard.getByRole('link', { name: /view details/i })
    .or(firstCard.getByRole('button', { name: /view details/i }));
  await expect(viewDetails.first()).toBeVisible();

  // Cancel Booking — button on the first card (live UI uses data-testid="cancel-booking-btn").
  const cancelBtn = firstCard.locator('[data-testid="cancel-booking-btn"]')
    .or(firstCard.getByRole('button', { name: /^cancel( booking)?$/i }));
  await expect(cancelBtn.first()).toBeVisible();
});

// --- TC-POS-001 actions ---

When('I capture the first booking card\'s booking id', async function (this: CustomWorld) {
  const idText = (await this.page
    .locator('[data-testid="booking-card"]')
    .first()
    .locator('[data-testid="booking-id"]')
    .innerText()).trim();
  // Strip a leading "#" if present so the value can be embedded in a URL.
  const id = idText.replace(/^#/, '');
  if (!id) {
    throw new Error('First booking card has no booking id.');
  }
  state(this).firstBookingId = id;
});

When('I click View Details on the first booking card', async function (this: CustomWorld) {
  const firstCard = this.page.locator('[data-testid="booking-card"]').first();
  const viewDetails = firstCard.getByRole('link', { name: /view details/i })
    .or(firstCard.getByRole('button', { name: /view details/i }));
  await viewDetails.first().click();
  // The detail page navigates to /bookings/:id — wait for the H1 (event name) to render.
  await this.page.locator('h1').first().waitFor({ state: 'visible', timeout: 15000 });
});

Then('the URL should contain the captured booking id', async function (this: CustomWorld) {
  const id = state(this).firstBookingId;
  if (!id) {
    throw new Error('First booking id was not captured.');
  }
  // The route encodes the id WITHOUT the leading "#" — the URL is /bookings/<digits>.
  // The captured id may include a "#" prefix; match the digits only.
  const digits = id.replace(/\D/g, '');
  expect(digits.length).toBeGreaterThan(0);
  await expect.poll(async () => new URL(this.page.url()).pathname, { timeout: 10000 })
    .toMatch(new RegExp(`/bookings/${digits}$`));
});

Then('the booking detail page should show the Event Customer Payment Refund and Booking Information sections', async function (this: CustomWorld) {
  for (const heading of [
    'Event Details',
    'Customer Details',
    'Payment Summary',
    'Refund',
    'Booking Information',
  ]) {
    const h = this.page.getByRole('heading', { name: new RegExp(`^${heading}$`, 'i') });
    await expect(h).toBeVisible({ timeout: 10000 });
  }
});

Then('the Payment Summary should show at least 1 ticket and a non-zero total', async function (this: CustomWorld) {
  // Scope to the Payment Summary section so we don't accidentally read the
  // tickets count from somewhere else on the page.
  const paymentSection = this.page.locator(':has(h2:has-text("Payment Summary"))').last();
  const sectionText = (await paymentSection.innerText()).toLowerCase();

  // Tickets — pull an integer from the line.
  const ticketsMatch = sectionText.match(/tickets?\s*[:\-]?\s*(\d+)/);
  if (!ticketsMatch) {
    throw new Error(`Could not find "Tickets" integer in Payment Summary text: "${sectionText}"`);
  }
  const ticketCount = Number.parseInt(ticketsMatch[1], 10);
  expect(ticketCount).toBeGreaterThanOrEqual(1);

  // Total Paid — pull a currency value.
  const totalMatch = sectionText.match(/total paid\s*[:\-]?\s*\$?\s*([\d,]+(?:\.\d{1,2})?)/);
  if (!totalMatch) {
    throw new Error(`Could not find "Total Paid" amount in Payment Summary text: "${sectionText}"`);
  }
  const totalPaid = Number.parseFloat(totalMatch[1].replace(/,/g, ''));
  expect(totalPaid).toBeGreaterThan(0);
});

When('I click Back to My Bookings', async function (this: CustomWorld) {
  const back = this.page.getByRole('link', { name: /back to my bookings/i })
    .or(this.page.getByRole('button', { name: /back to my bookings/i }));
  await back.first().click();
  await this.pageLocator.testPage.bookingsHeading.waitFor({ state: 'visible', timeout: 15000 });
});
