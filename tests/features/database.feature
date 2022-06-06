Feature: Manage databases
  It should be possible to create and manage databases.

  Scenario: Create database
    Given a demo account
    When I create database "db1"
    Then I can confirm that database "db1" exists

  Scenario: Destroy database
    Given a demo account
    When I create database "db1"
     And I destroy database "db1"
    Then I can't find database "db1"

  Scenario: Duplicate database
    Given a demo database
    When I create database "demo"
    Then I get a duplicate database error

  Scenario: Rename database
    Given a demo database
    When I rename database "demo" to "example"
    Then I can confirm that database "example" exists
     And I can't find database "demo"

  Scenario: Try to rename non-existent database
    Given a demo account
    When I rename database "demo" to "example"
    Then I get a database not found error

  Scenario: Find all databases
    Given a demo account
    When I create database "db1"
     And I create database "db2"
    Then I can confirm that there are 2 databases available
     And I can confirm that database "db1" exists
     And I can confirm that database "db2" exists
