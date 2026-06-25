---

name: testcase-generator
description: Generate test cases only for UI elements that are actually visible on the provided screen.
-------------------------------------------------------------------------------------------------------

# UI Test Case Generation Skill

## Objective

Generate manual and automation test cases based only on UI elements that are visible in the provided screenshot, webpage, DOM, or design.

## Rules

### UI Understanding

Before generating any test case:

1. Understand the module, screen, or workflow being described.
2. Identify only the UI elements that are clearly present.
3. Write test cases for those confirmed elements only.
4. Do not write steps for elements that are missing, hidden, inferred, or not explicitly present in the UI.
5. Do not provide locator strategies, selectors, XPath, CSS, or any implementation-specific positioning hints.

### Live UI Grounding via Playwright MCP

When a URL is provided, ground the test cases in the **actual** live UI rather than assumptions:

1. **Navigate** to the target URL with `browser_navigate`.
2. **Authenticate** if needed: use `browser_fill_form` with the supplied demo credentials, then `browser_click` the submit button. Wait for a known post-login element with `browser_wait_for` (do not use arbitrary sleeps).
3. **Inventory the page** with `browser_snapshot` to enumerate every interactive element (headings, links, buttons, inputs, status badges, etc.). This snapshot is the canonical UI inventory.
4. **For each element you reference in a test case, confirm it appears in the snapshot first.** If you cannot see it, drop the step or surface the gap in `open_questions`.
5. **Probe dynamic behavior** (modals, dialogs, toasts, async fetches) with `browser_evaluate` rather than guessing — for example, override `window.confirm` to capture whether a destructive action opens one.
6. **Record evidence**: include a `live_ui_evidence` block (or `meta.assumptions`) summarizing the observed facts — H1 text, nav links, button labels, status badges, observed `data-testid` values.

`data-testid` attributes observed in the snapshot may be referenced by their literal name in test steps (e.g. "the card with data-testid 'booking-card'"), because that is a user-visible attribute of the page, not a Playwright selector strategy. Do NOT invent CSS/XPath/role selectors that were not present in the observed UI.

If the URL is unreachable, the app is down, or auth fails: record the failure in `open_questions`, do not invent UI, and produce only what you could observe.

### Element Validation

Before generating any test case:

1. Identify all visible UI elements.
2. Create test cases only for elements that are present.
3. Do not assume the existence of:

   * Buttons
   * Links
   * Checkboxes
   * Radio buttons
   * Dropdowns
   * Tabs
   * Menus
   * Text fields
   * Error messages
   * Tooltips

### Prohibited Behavior

Never generate test cases for:

* Elements not visible on the screen
* Elements inferred from experience
* Elements commonly found in similar applications
* Future functionality
* Hidden functionality unless explicitly shown
* Elements that are not confirmed by the provided UI evidence
* Locator strategies or selector-based instructions

### Required Behavior

For every generated test case:

1. Identify the target element.
2. Verify the element exists on the UI.
3. Generate test cases only for confirmed elements.
4. Keep the test description focused on user-visible behavior.
5. Avoid any locator strategy or selector wording.

### Confidence Check

If an element is unclear:

* Mark it as "Not Clearly Visible"
* Do not create test steps for it

### Output Format

Visible Elements:

* Login button
* Username field
* Password field

Test Cases:

TC001 - Verify Username Field Accepts Input

Precondition:

* Login page is displayed

Steps:

1. Enter text into Username field

Expected Result:

* Text is entered successfully

TC002 - Verify Password Field Masks Input

Precondition:

* Login page is displayed

Steps:

1. Enter password into Password field

Expected Result:

* Characters are masked

### Hallucination Prevention

Before finalizing:

* Verify every test case maps to a visible UI element.
* Remove any test case that references a non-visible element.
* Remove assumptions.
* Prefer omission over guessing.

### Priority

Accuracy > Coverage

It is acceptable to generate fewer test cases if UI evidence is limited.
