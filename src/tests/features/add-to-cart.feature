@add-to-cart
Feature: Add to Cart on Sauce Labs demo
  As a logged-in standard_user on the Sauce Labs Swag Labs demo
  I want to add inventory items to the cart from the inventory page
  So that the per-item button toggles to "Remove", the cart badge increments to 1,
      the item appears on /cart.html with quantity, name, description, price and a Remove action,
      and clicking Remove clears the row and the badge.

  Background:
    Given I open the Sauce Demo login page
    And I log in to Sauce Demo as "standard_user" with password "secret_sauce"

  @TC-SMOKE-001 @smoke @regression @critica
  Scenario: Logged-in standard_user can add Sauce Labs Backpack to cart from inventory
    Then the cart badge should not be visible
    When I add the Sauce Labs Backpack to the cart from inventory
    Then the Sauce Labs Backpack inventory button should be labelled "Remove"
    And the cart badge should display "1"

  @TC-POS-001 @positive @regression @high
  Scenario: Added item appears on /cart.html with quantity 1, full product details, and a working Remove button
    Given the Sauce Labs Backpack has been added to the cart from inventory
    And the cart badge displays "1"
    When I open the cart page
    Then the Sauce Labs Backpack cart row should show quantity "1"
    And the Sauce Labs Backpack cart row should show name "Sauce Labs Backpack"
    And the Sauce Labs Backpack cart row should show price "$29.99"
    And the Sauce Labs Backpack cart row should show a description beginning with "carry.allTheThings()"
    And the Sauce Labs Backpack cart row should show a Remove button
    When I remove the Sauce Labs Backpack from the cart
    Then the Sauce Labs Backpack cart row should no longer be visible
    And the cart badge should not be visible
