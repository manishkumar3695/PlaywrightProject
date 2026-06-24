---

name: testcase-generator
description: Generate test cases only for UI elements that are actually visible on the provided screen.
-------------------------------------------------------------------------------------------------------

# UI Test Case Generation Skill

## Objective

Generate manual and automation test cases based only on UI elements that are visible in the provided screenshot, webpage, DOM, or design.

## Rules

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

### Required Behavior

For every generated test case:

1. Identify the target element.
2. Verify the element exists on the UI.
3. Generate test cases only for confirmed elements.

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
