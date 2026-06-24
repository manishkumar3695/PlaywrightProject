---
name: cucumber-js-13-pending-pattern
description: cucumber-js 13.x removed `this.pending()` from World; mark a step as pending by resolving with the literal string 'pending'.
metadata:
  type: feedback
---

In cucumber-js 13.x, the `World` class no longer exposes a `pending()` method. To mark a step (and therefore its scenario) as PENDING, resolve the step function with the literal string `'pending'`.

**Why:** Confirmed by reading `docs/support_files/step_definitions.md` from cucumber-js and inspecting `node_modules/@cucumber/cucumber/lib/support_code_library_builder/world.d.ts` (v13.0.0). The previous `this.pending(message)` world method was removed; the replacement is `return 'pending'` / `resolve('pending')` from inside the step definition. The deprecated `this.pending()` path no longer works and silently does nothing in v13.

**How to apply:** For any destructive scenario that should skip gracefully on re-run (e.g. cancel-booking, delete-account), gate it with a precondition step that returns `'pending'` when the destructive preconditions aren't met. For example:

```ts
Given('a Confirmed booking is available to cancel', async function (): Promise<string | void> {
  if ((await tp.confirmedStatusBadges.count()) === 0) {
    console.warn('No Confirmed bookings — skipping destructive scenario.');
    return 'pending';
  }
});
```

Link with [[destructive-scenario-skip-pattern]] which records the same finding in the project-specific context.