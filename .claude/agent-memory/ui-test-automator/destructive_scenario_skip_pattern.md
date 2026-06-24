---
name: destructive-scenario-skip-pattern
description: For Cucumber scenarios that mutate shared system state (e.g. cancel a Confirmed booking), gate the scenario with a Given step that resolves with 'pending' when preconditions are absent — making re-runs idempotent.
metadata:
  type: feedback
---

For Cucumber scenarios in this project that perform destructive actions (e.g. `TC-BOOK-002` cancels a Confirmed booking), the second run of the suite would fail because the system state has changed and there is no Confirmed booking left to cancel. Do NOT try to "restore" state via UI — accept the side-effect and skip gracefully.

**Why:** The user explicitly asked for idempotency on re-runs. Cancelled bookings cannot be re-Confirmed via the EventHub UI, so the only way to keep the suite green on repeated runs is to mark the scenario as PENDING when the precondition is missing.

**How to apply (cucumber-js 13.x):**
1. Add a `Given` step early in the scenario that checks the precondition (e.g. "a Confirmed booking is available to cancel"). If the precondition is absent, `return 'pending';` from the step function. cucumber-js treats a step that resolves with the literal string `'pending'` as a PENDING step (status reported as PENDING / SKIPPED, not FAILED).
2. Do NOT call `this.skip()` or `this.pending()` — neither exists on the v13 World class. The replacement is `return 'pending'`. The TS return type for the step function should be `Promise<string | void>` to allow both the skip path and the normal path.
3. Document the skip behavior in a comment so future maintainers know it is intentional, not a bug. Mirror the comment block used in `src/tests/steps/my-bookings.ts`.
4. Related: [[bookings-empty-state-strategy]] takes a different approach (cancel-all-then-verify-empty) for TC-BOOK-003, which is a distinct scenario that owns its destructive action rather than depending on a Confirmed booking.