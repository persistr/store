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

  Scenario: Search for documents
    Given a demo database
      And collection 'demo'
    When I write document "{ id: 'c07a3419-ba38-4af1-b3c0-310d14851d2c', hello: 'world' }"
     And I write document "{ id: '0bf38966-c153-428d-a416-c6cea196f9c2', wonderful: 'world' }"
     And I search for documents matching "{ wonderful: 'world' }"
    Then I get 1 search result
     And search result 1 is "{ id: '0bf38966-c153-428d-a416-c6cea196f9c2', wonderful: 'world' }"

  Scenario: Search for documents with paginated results
    Given a demo database
      And collection 'demo'
    When I write document "{ id: 'c07a3419-ba38-4af1-b3c0-310d14851d2c', hello: 'world' }"
     And I write document "{ id: '0bf38966-c153-428d-a416-c6cea196f9c2', wonderful: 'world' }"
     And I write document "{ id: '6669f64e-cebd-4af1-96df-89daa94b9447', wonderful: 'world' }"
     And I write document "{ id: '3c13cad1-6f2c-4311-9b60-75743f297f50', wonderful: 'world' }"
     And I search for documents matching "{ wonderful: 'world' }" on page 2 with page size 2
    Then I get 1 search result

  Scenario: Search for documents using expressions
    Given a demo database
      And collection 'demo'
    When I write document "{ id: 'c07a3419-ba38-4af1-b3c0-310d14851d2c', age: 45 }"
     And I write document "{ id: '0bf38966-c153-428d-a416-c6cea196f9c2', age: 15 }"
     And I write document "{ id: 'f2f037eb-b950-4a2a-8001-b43816328cfb', age: 55 }"
     And I search for documents matching "{ age: { $gt: 40 } }" in "desc" order of "age"
    Then I get 2 search results
     And search result 1 is "{ id: 'f2f037eb-b950-4a2a-8001-b43816328cfb', age: 55 }"
     And search result 2 is "{ id: 'c07a3419-ba38-4af1-b3c0-310d14851d2c', age: 45 }"

  Scenario: Count documents
    Given a demo database
      And collection 'demo'
    When I write document "{ id: 'c07a3419-ba38-4af1-b3c0-310d14851d2c', hello: 'world' }"
     And I write document "{ id: '0bf38966-c153-428d-a416-c6cea196f9c2', wonderful: 'world' }"
    Then I count 2 documents
     And I count 1 document matching "{ wonderful: 'world' }"

  Scenario: Search for documents using regex, part 1
    Given a demo database
      And collection 'demo'
    When I write document "{ id: 'c07a3419-ba38-4af1-b3c0-310d14851d2c', title: 'abc123' }"
     And I write document "{ id: '0bf38966-c153-428d-a416-c6cea196f9c2', title: '123abc' }"
     And I write document "{ id: 'f2f037eb-b950-4a2a-8001-b43816328cfb', title: '123123' }"
     And I search for documents matching "{ title: { $regex: 'abc123' } }"
    Then I get 1 search results
     And search result 1 is "{ id: 'c07a3419-ba38-4af1-b3c0-310d14851d2c', title: 'abc123' }"

  Scenario: Search for documents using regex, part 2
    Given a demo database
      And collection 'demo'
    When I write document "{ id: 'c07a3419-ba38-4af1-b3c0-310d14851d2c', title: 'abc123' }"
     And I write document "{ id: '0bf38966-c153-428d-a416-c6cea196f9c2', title: '123abc' }"
     And I write document "{ id: 'f2f037eb-b950-4a2a-8001-b43816328cfb', title: '123123' }"
     And I search for documents matching "{ title: { $regex: '.*123.*' } }" in "desc" order of "title"
    Then I get 3 search results
     And search result 1 is "{ id: 'c07a3419-ba38-4af1-b3c0-310d14851d2c', title: 'abc123' }"
     And search result 2 is "{ id: '0bf38966-c153-428d-a416-c6cea196f9c2', title: '123abc' }"
     And search result 3 is "{ id: 'f2f037eb-b950-4a2a-8001-b43816328cfb', title: '123123' }"

  Scenario: Search for documents using regex, part 3
    Given a demo database
      And collection 'demo'
    When I write document "{ id: 'c07a3419-ba38-4af1-b3c0-310d14851d2c', title: 'abc123' }"
     And I write document "{ id: '0bf38966-c153-428d-a416-c6cea196f9c2', title: '123abc' }"
     And I write document "{ id: 'f2f037eb-b950-4a2a-8001-b43816328cfb', title: '123123' }"
     And I search for documents matching "{ title: { $regex: '123.*' } }" in "asc" order of "title"
    Then I get 2 search results
     And search result 1 is "{ id: 'f2f037eb-b950-4a2a-8001-b43816328cfb', title: '123123' }"
     And search result 2 is "{ id: '0bf38966-c153-428d-a416-c6cea196f9c2', title: '123abc' }"

  Scenario: Search for documents using regex, part 4
    Given a demo database
      And collection 'demo'
    When I write document "{ id: 'c07a3419-ba38-4af1-b3c0-310d14851d2c', title: 'abc123' }"
     And I write document "{ id: '0bf38966-c153-428d-a416-c6cea196f9c2', title: '123abc' }"
     And I write document "{ id: 'f2f037eb-b950-4a2a-8001-b43816328cfb', title: '123123' }"
     And I search for documents matching "{ title: { $regex: '1?3.*(c|3)' } }" in "desc" order of "title"
    Then I get 2 search results
     And search result 1 is "{ id: '0bf38966-c153-428d-a416-c6cea196f9c2', title: '123abc' }"
     And search result 2 is "{ id: 'f2f037eb-b950-4a2a-8001-b43816328cfb', title: '123123' }"

Scenario: Search for documents using regex, part 5
    Given a demo database
      And collection 'demo'
    When I write document "{ id: 'c07a3419-ba38-4af1-b3c0-310d14851d2c', name: 'demo1', title: 'abc123', status: 'Active' }"
     And I write document "{ id: '0bf38966-c153-428d-a416-c6cea196f9c2', name: 'test1', title: '123abc', status: 'Failed' }"
     And I write document "{ id: 'f2f037eb-b950-4a2a-8001-b43816328cfb', name: 'test2', title: '123123', status: 'Finished' }"
     And I write document "{ id: 'simple-test-id', name: 'demo2', title: '321321', status: 'Finished' }"
     And I search for documents matching "{'$and': [{'$or':[{name:{'$regex': '%test%'}},{id: {'$regex': '%test%'}}]},{'$or':[{status:'Finished'}]}]}" in "desc" order of "title"
    Then I get 2 search results
     And search result 1 is "{ id: 'simple-test-id', name: 'demo2', title: '321321', status: 'Finished' }"
     And search result 2 is "{ id: 'f2f037eb-b950-4a2a-8001-b43816328cfb', name: 'test2', title: '123123', status: 'Finished' }"
