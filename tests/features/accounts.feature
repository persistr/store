Feature: Manage accounts
  It should be possible to create and manage user accounts.

  Scenario Outline: Create account
    Given an empty database
    When I create an account with "<username>", "<name>", and "<password>"
    Then I can confirm that account exists with "<username>", "<name>", and "<password>"
     And I can confirm that account "<username>" is not a root account
     And I can confirm that account "<username>" is retrievable via its API key
     And I can confirm that account "<username>" is retrievable via its unique ID
    Examples:
      | username | name       | password |
      | john     | John Smith | pass1    |
      | steve    | Steve Doe  | pass2    |

  Scenario: Try to create duplicate account
    Given a demo account
    When I create an account with "demo", "Demo Account", and "demopass"
    Then I get a username taken error

  Scenario: Find all accounts
    Given an empty database
    When I create an account with "john", "John Doe", and "johnpass"
     And I create an account with "jane", "Jane Doe", and "janepass"
    Then I can confirm that there are 2 accounts available
     And I can confirm that account exists with "john", "John Doe", and "johnpass"
     And I can confirm that account exists with "jane", "Jane Doe", and "janepass"

  Scenario: Try to find account using wrong username, password, or ID
    Given a demo account
    Then I can't find account "john" with password "wrongpassword"
     And I can't find account "demo" with password "wrongpassword"
     And I can't find account with ID "123456789"
     And I can't find account "demo" with API key "123456789"

  Scenario Outline: Destroy account
    Given an empty database
    When I create an account with "<username>", "<name>", and "<password>"
     And I destroy account "<username>"
    Then I can't find an active account with "<username>"
    Examples:
      | username | name       | password |
      | john     | John Smith | pass1    |
      | steve    | Steve Doe  | pass2    |

  Scenario: Try to destroy non-existent account
    Given an empty database
    When I destroy account "john"
    Then I get an account not found error

  Scenario Outline: Deactivate account
    Given an empty database
    When I create an account with "<username>", "<name>", and "<password>"
     And I deactivate account "<username>"
    Then I can't find an active account with "<username>"
    Examples:
      | username | name       | password |
      | john     | John Smith | pass1    |
      | steve    | Steve Doe  | pass2    |

  Scenario: Try to deactivate non-existent account
    Given an empty database
    When I deactivate account "john"
    Then I get an account not found error

  Scenario Outline: Reactivate account
    Given an empty database
    When I create an account with "<username>", "<name>", and "<password>"
     And I deactivate account "<username>"
     And I reactivate account "<username>"
    Then I can confirm that account exists with "<username>", "<name>", and "<password>"
    Examples:
      | username | name       | password |
      | john     | John Smith | pass1    |
      | steve    | Steve Doe  | pass2    |

  Scenario: Try to reactivate non-existent account
    Given an empty database
    When I reactivate account "john"
    Then I get an account not found error

  Scenario Outline: Grant database access to account
    Given a demo database
    When I create an account with "john", "John Smith", and "johnpass"
     And I grant "<role>" access to database "demo" for account "john"
    Then I can confirm that account "john" has "<role>" access to database "demo"
    Examples:
      | role   |
      | reader |
      | member |
      | admin  |
      | owner  |

  Scenario Outline: Revoke database access from account
    Given a demo database
    When I create an account with "john", "John Smith", and "johnpass"
     And I grant "<role>" access to database "demo" for account "john"
     And I revoke access to database "demo" for account "john"
    Then I can confirm that account "john" does NOT have access to database "demo"
    Examples:
      | role   |
      | reader |
      | member |
      | admin  |
      | owner  |
