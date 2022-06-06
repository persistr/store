Feature: Manage event streams
  It should be possible to manage event streams.

  Scenario: Create stream
    Given a demo database
      And default namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I write event "{ hello: 'world' }" with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" and type "test"
    Then I can confirm that event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" exists
     And I can confirm that stream "ac9a0d2c-619f-47f8-8510-52429f4f0680" exists

  Scenario: Destroy stream
    Given a demo namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I write event "{ hello: 'world' }" with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" and type "test"
     And I destroy stream "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    Then I can't find event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"

  Scenario: Try to destroy stream
    Given a demo namespace
    When I try to destroy stream "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    Then I get a stream not found error

  Scenario: Try to read non-existent stream
    Given a demo namespace
    When I try to read stream "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    Then I get a stream not found error

  Scenario: Find all streams
    Given a demo namespace
    When I write event "{ hello: 'world' }" with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" and type "test" to stream "ac9a0d2c-619f-47f8-8510-52429f4f0680"
     And I write event "{ hello: 'world' }" with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" and type "test" to stream "b6260f4c-e3df-40b8-9ca4-a763f318a6e4"
    Then I can confirm that there are 2 streams available
     And I can confirm that stream "ac9a0d2c-619f-47f8-8510-52429f4f0680" exists
     And I can confirm that stream "b6260f4c-e3df-40b8-9ca4-a763f318a6e4" exists

  Scenario: Default stream type is undefined
    Given a demo stream
    Then I can confirm that there are 1 streams available
     And I can confirm that stream type is undefined

  Scenario: Default stream type is undefined, if not specified in stream annotation
    Given a demo stream
    When I write annotation "{ hello: 'world' }"
    Then I can confirm that there are 1 streams available
     And I can confirm that stream type is undefined

  Scenario: Set stream type
    Given a demo stream
    When I write annotation "{ type: 'test', hello: 'world' }"
    Then I can confirm that there are 1 streams available
     And I can confirm that stream type is "test"

  Scenario: Change stream type
    Given a demo stream
    When I write annotation "{ type: 'test', hello: 'world' }"
     And I write annotation "{ type: 'test2', hello: 'world' }"
    Then I can confirm that there are 1 streams available
     And I can confirm that stream type is "test2"
