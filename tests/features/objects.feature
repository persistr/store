Feature: Manage objects
  It should be possible to create and manage objects.

  Scenario: Read/write object
    Given a demo database
    When I write object "{ hello: 'world' }" with ID "12345"
    Then I can confirm that object "12345" exists
     And I can confirm that content of object "12345" is "{ hello: 'world' }"

  Scenario: Try to read non-existent object
    Given a demo database
    When I try to read content of object "123456789"
    Then I get an object not found error

  Scenario: Destroy object
    Given a demo database
    When I write object "{ hello: 'world' }" with ID "12345"
     And I destroy object "12345"
    Then I can't find object "12345"

  Scenario: Try to destroy non-existent object
    Given a demo database
    When I try to destroy object "12345"
    Then I get an object not found error
