---
name: heading-locator-trap-on-sauce-demo
description: Sauce Labs demo renders page labels as <span class="title" data-test="title">, not headings. getByRole('heading') returns nothing — always probe the tag with browser_evaluate before picking a heading locator.
metadata:
  type: feedback
---

On https://www.saucedemo.com/ the page-level labels "Products" (inventory) and "Your Cart" (cart page) are rendered as `<span class="title" data-test="title">` rather than as `<h1>`/`<h2>` elements. They look like headings visually but have no implicit or explicit `role="heading"`, so `page.getByRole('heading', { name: 'Products' })` and `page.getByRole('heading', { name: 'Your Cart' })` both resolve to zero elements and any `waitFor({ state: 'visible' })` against them hangs until the 30s Cucumber step timeout.

**Why:** the first add-to-cart automation (2026-06-25) used `getByRole('heading', { name: 'Products' })` for the post-login landing check, and the login step timed out at 30s. The MCP snapshot visibly showed "Products" as `generic [ref=e25]` (a span), but the agent translated it to a heading role rather than reading the actual DOM tag. The fix was `page.locator('[data-test="title"]', { hasText: 'Products' })` — pinning to the data-test attribute the app exposes. Login then completed in ~1s and both scenarios turned green.

**How to apply:**
1. When MCP `browser_snapshot` shows a page-level label like "Products" or "Your Cart" as a `generic` (not a `heading`), do not assume a heading role. Probe the actual tag with `browser_evaluate('document.querySelectorAll(...)')` and pin to `data-test` or a tag+class locator instead.
2. For any "page loaded" / "post-login landing" wait condition, prefer waiting on a `data-test` attribute or a specific element that the app renders ONLY on the target route (e.g. `shopping-cart-link` is in the header on every authed page, but `[data-test="title"]` with text "Products" is unique to /inventory.html). Don't rely on role semantics that the DOM doesn't actually expose.
3. When a `Promise.all([waitForURL, click])` pattern is needed for form-submit login buttons, set an explicit `timeout` on `waitForURL` (≤20s) so the failure surfaces inside the Cucumber step rather than consuming the whole 30s default. Same for any post-navigation element wait.
4. Cross-check feature files for step-phrase consistency — Cucumber matches step phrases literally. The first add-to-cart run had `And the cart badge should display "1"` in one scenario and `And the cart badge displays "1"` in another; fix by making the step definitions accept both forms (alias the optional `should`).