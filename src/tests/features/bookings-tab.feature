@bookings
Feature: EventHub - My Bookings
  The 'My Bookings' page (reached from the top-nav 'My Bookings' link) lists the
  signed-in user's bookings as a stack of cards. Each card shows a reference,
  a status badge, a '#bookingId', the event name, and 'View Details' /
  'Cancel Booking' actions. The page exposes a 'Clear all bookings' toolbar
  button and an empty state when the user has no bookings.

  Background:
    Given I am signed in to EventHub as the demo user
    And I open the My Bookings page

  @TC-SMK-001 @smoke @regression
  Scenario: My Bookings page loads and lists the user's booking cards
    Then the My Bookings page header should be visible
    And the Clear all bookings button should be visible
    And at least one booking card should be rendered
    And the first booking card should have a booking id, status badge, and event name
    And the first booking card should have View Details and Cancel Booking actions

  @TC-POS-001 @positive @regression
  Scenario: Viewing a booking's detail page from the list
    When I capture the first booking card's booking id
    And I click View Details on the first booking card
    Then the URL should contain the captured booking id
    And the booking detail page should show the Event Customer Payment Refund and Booking Information sections
    And the Payment Summary should show at least 1 ticket and a non-zero total
    When I click Back to My Bookings
    Then the My Bookings page header should be visible
    And at least one booking card should be rendered
