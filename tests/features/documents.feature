Feature: Manage documents
  It should be possible to create and manage documents.

  Scenario: Read/write document
    Given a demo database
      And collection 'demo'
    When I write document "{ id: 'c07a3419-ba38-4af1-b3c0-310d14851d2c', hello: 'world' }"
    Then I can confirm that content of document with ID "c07a3419-ba38-4af1-b3c0-310d14851d2c" is "{ id: 'c07a3419-ba38-4af1-b3c0-310d14851d2c', hello: 'world' }"

  Scenario: Try to read non-existent document
    Given a demo database
      And collection 'demo'
    When I try to read document with ID "c07a3419-ba38-4af1-b3c0-310d14851d2c"
    Then I get a document not found error

  Scenario: Destroy document
    Given a demo database
      And collection 'demo'
    When I write document "{ hello: 'world' }"
     And I destroy the document
    Then I can't find the document

  Scenario: Try to destroy non-existent document
    Given a demo database
      And collection 'demo'
    When I try to destroy document with ID "c07a3419-ba38-4af1-b3c0-310d14851d2c"
    Then I get a document not found error
