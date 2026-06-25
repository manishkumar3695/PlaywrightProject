---
name: project-test-layout
description: Concrete shape of the EventHub Cucumber + Playwright + TS project (file layout, POM facade, custom world, cucumber.js globs, demo creds caveat).
metadata:
  type: project
---

This repo is a Cucumber + Playwright (TypeScript) BDD test suite for the EventHub demo app at https://eventhub.rahulshettyacademy.com/.

Layout (must follow exactly when adding new tests):
- Feature files: `src/tests/features/*.feature` — loaded via `cucumber.js` glob `'src/tests/features/**/*.feature'`
- Step definitions: `src/tests/steps/*.ts` — auto-loaded via glob `'src/tests/steps/**/*.ts'`. There is no per-step registration; just declare new `Given/When/Then` functions and they are picked up. `test.ts` holds login + event-creation steps; new feature areas belong in their own file under `steps/` (e.g. `bookings-tab.ts`).
- POM locators: `src/tests/locators/*.ts`. `TestPage` in `test.locator.ts` is the central class holding all locators (login, events, bookings, validation errors). For new tab/feature areas, the convention in practice is to add locators to `TestPage` AND/OR spawn a new class. The agent instructions say "create new locator file for every new functionality"; the Bookings tab was added as a new `bookingsPage.ts` class. The facade `PageManager` in `POManager.ts` exposes page objects as `pageLocator.testPage`, `pageLocator.bookingsPage`, etc.
- Custom world: `src/tests/support/world.ts` extends Cucumber's `World` and exposes `browser`, `context`, `page`, and `pageLocator: PageManager`. Steps use `this: CustomWorld` for type-safety.
- Hooks: `src/tests/support/hooks.ts` launches Chromium with `headless: true` (note: CLAUDE.md says `headless: false` but the actual file is `headless: true`), fresh browser/context/page per scenario.

TS config (`tsconfig.json`): ES2020, CommonJS, `esModuleInterop: true`, no strict mode flags. ts-node is registered via `--require-module ts-node/register` in `cucumber.js`.

**Demo creds caveat (important):** the project's stated demo creds in CLAUDE.md and JSON test cases are `manish123@gmail.com` / `Manish9@@`, but the existing `Given user login into the app` step in `src/tests/steps/test.ts` actually hardcodes `manish321@gmail.com` / `Manish9@@`. This is a bug in the existing step. New step files should hardcode the correct creds per the JSON/CLAUDE.md, OR define a fresh `Given I am signed in to EventHub as the demo user` step with the right values. Do not silently inherit the broken step.

**Why:** the project consciously centralizes the POM class but also allows per-feature page classes; the `cucumber.js` glob is the registration mechanism — there's no manual wiring. The creds divergence is a real footgun in `test.ts` and must be sidestepped.

**How to apply:** when adding a feature area, create (1) a new `.feature` under `src/tests/features/`, (2) a new `*.ts` under `src/tests/steps/` (separate file from `test.ts`), (3) a new page class under `src/tests/locators/` (per the agent instructions), (4) add a lazy getter in `PageManager`. For login, write a step that uses the correct creds from the JSON/CLAUDE.md — do not call into `test.ts`'s login step.

Related: [[bookings-empty-state-strategy]] for how to handle the TC-BOOK-003 empty-state precondition.
