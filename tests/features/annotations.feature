Feature: Manage annotations
  It should be possible to create and manage stream annotations.

  Scenario: Read/write annotation
    Given a demo stream
    When I write annotation "{ type: 'test', hello: 'world' }"
    Then I can confirm that annotation exists
     And I can confirm that content of annotation is "{ type: 'test', hello: 'world' }"
     And I can confirm that stream type is "test"

  Scenario: Try to read non-existent annotation
    Given a demo stream
    When I try to read annotation
    Then I get an annotation not found error

  Scenario: Destroy annotation
    Given a demo stream
    When I write annotation "{ hello: 'world' }"
     And I destroy annotation
    Then I can't find annotation

  Scenario: Try to destroy non-existent annotation
    Given a demo stream
    When I try to destroy annotation
    Then I get an annotation not found error
