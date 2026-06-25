---
name: ground-locators-in-mcp-snapshot
description: Always run browser_navigate + browser_snapshot via Playwright MCP on the live page BEFORE writing any locator; never trust the JSON's UI description as ground truth.
metadata:
  type: feedback
---

When converting a test-case JSON into automation, you MUST verify every element you reference against a Playwright MCP `browser_snapshot` of the live page before writing the locator. The JSON is an *intent*, not ground truth — its element names, headings, table columns, button labels, and placeholder text are commonly inferred by the upstream QA agent and frequently wrong.

**Why:** The 2026-06-24 bookings-tab run produced a JSON describing a "Total Bookings" counter, a search input with placeholder "Search booking, customer, venue...", a "Create New Booking" button, and a table with 8 columns (Booking ID, Booking Name, Customer Name, Event Type, Venue, Event Date, Guest Count, Status). NONE of those existed on the live `/bookings` page. The page was actually a card list (data-testid="booking-card") with no inputs at all. The agent wrote all the locators from the JSON and every step timed out at runtime. After the user asked me to "execute and fix the error", the agent had to throw away most of the original work and rewrite the feature + steps + POM. The user then asked for the qa-testcase-generator AND the ui-test-automator to be updated to use Playwright MCP. Both agent files now mandate MCP-grounded work as of 2026-06-24.

**How to apply:**
1. Before writing any locator, call `browser_navigate` to the page, authenticate if needed with `browser_fill_form` + `browser_click`, then `browser_snapshot` (and/or `browser_evaluate` with `document.querySelectorAll(...)`).
2. For every element the JSON references, find it in the snapshot. If you can't find it, do not write a locator for it. Either drop the step (with a `// TODO(automator)` comment) or rewrite the step against the closest real element. Update the Gherkin wording in the feature file to match the live UI, not the JSON.
3. Prefer `data-testid` locators (e.g. `getByTestId('booking-card')`, `getByTestId('booking-id')`, `getByTestId('nav-bookings')`, `getByTestId('cancel-booking-btn')`) when the page exposes them — they are unambiguous, stable across CSS refactors, and Playwright's strict-mode engine likes them.
4. Avoid broad `.or(...)` chains that match multiple elements. The previous run hit strict-mode errors because `bookingsNavLink = '#nav-bookings'.or(getByRole('link', { name: /my bookings/i }))` matched 3 anchors (top nav + hero CTA + footer). Narrow to the single element observed in the snapshot.
5. If MCP tools are not available in the spawned subagent (this happens intermittently — see [[no-bash-tool-acknowledgement]]), state the blocker explicitly and ask the user to either re-spawn with MCP connected, or hand-grant you access. Do not invent selectors as a fallback — the bookings-tab incident is the canonical example of why.
