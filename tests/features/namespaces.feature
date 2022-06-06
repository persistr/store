Feature: Manage namespaces
  It should be possible to create and manage namespaces.

  Scenario: Create namespace
    Given a demo database
    When I create namespace "ns1"
    Then I can confirm that namespace "ns1" exists

  Scenario: Destroy namespace
    Given a demo database
    When I create namespace "ns1"
     And I destroy namespace "ns1"
    Then I can't find namespace "ns1"

  Scenario: Try to duplicate namespace
    Given a demo namespace
    When I create namespace "demo"
    Then I get a duplicate namespace error

  Scenario: Rename namespace
    Given a demo namespace
    When I rename namespace "demo" to "example"
    Then I can confirm that namespace "example" exists
     And I can't find namespace "demo"

  Scenario: Try to rename non-existent namespace
    Given a demo database
    When I rename namespace "demo" to "example"
    Then I get a namespace not found error

  Scenario: Try to rename namespace to a duplicate name
    Given a demo namespace
    When I create namespace "ns1"
     And I rename namespace "demo" to "ns1"
    Then I get a duplicate namespace error

  Scenario: Find all namespaces
    Given a demo database
    When I create namespace "ns1"
     And I create namespace "ns2"
    Then I can confirm that there are 2 namespaces available
     And I can confirm that namespace "ns1" exists
     And I can confirm that namespace "ns2" exists
