---
name: playwright-mcp-automation
description: Generate Playwright-based UI automation using Playwright MCP, create one locator file per page, and verify generated tests by running Cucumber with a tag.
---

# Playwright MCP Automation Skill

## Objective

Generate reliable UI automation code by inspecting the application with Playwright MCP, creating page-specific locator files, and validating the generated tests by executing them with Cucumber.

## Core Workflow

### 1. Inspect the UI with Playwright MCP

Before writing any automation code:

1. Use Playwright MCP browser tools to open the relevant page.
2. Capture the visible UI state with snapshots.
3. Identify user-facing elements such as buttons, links, inputs, headings, and form controls.
4. Prefer accessible selectors such as role, label, placeholder, or visible text.
5. Avoid brittle selectors and do not invent elements that are not visible.

### 2. Generate Locators

When creating locators:

1. Use Playwright MCP observations to confirm each locator is valid.
2. Prefer robust, user-facing locators over CSS or XPath when possible.
3. Keep locator definitions explicit and readable.
4. Do not hardcode unexplained selectors without UI validation.

### 3. Create a Separate Locator File for Each New Page

For every new page or major screen:

1. Create a dedicated locator file under src/tests/locators/.
2. Name it clearly for the page it represents, for example:
   - loginPage.ts
   - bookingsPage.ts
   - eventsPage.ts
3. Keep page-specific locators and page actions in that file.
4. Update the page manager or equivalent facade so the new page object is accessible from steps.

### 4. Generate the Automation Artifacts

When implementing a new flow:

1. Create or update the relevant feature file.
2. Add or update the matching step definitions.
3. Use the page-specific locator file for all UI interactions.
4. Keep steps thin and delegate UI work to the page object layer.

### 5. Execute the Generated Tests

After generating or updating the automation code:

1. Run the relevant Cucumber scenario set using a tag.
2. Use the following command:

```bash
npx cucumber-js --tags @<your_tag> --exit
```

3. If the run fails, fix the root cause and rerun the same command.
4. Report the outcome clearly, including any failed scenarios or locator issues.

## Guardrails

- Use Playwright MCP for UI understanding before generating locators.
- Create a separate locator file for each new page.
- Do not write steps for elements that are not confirmed by the UI.
- Do not provide locator strategies as plain text in test cases; keep them in the automation layer.
- Prefer user-visible behavior and accessibility-friendly selectors.
- Validate the generated automation by executing it with Cucumber.

## Success Criteria

The work is complete when:

- the relevant page has a dedicated locator file,
- the generated code uses those locators,
- and the tests run successfully with the required Cucumber tag command.
