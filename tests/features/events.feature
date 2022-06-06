Feature: Write, read, and delete events
  It should be possible to store events and
  later retrieve them easily and reliably.

  Scenario: Read/write event with data
    Given a demo database
      And default namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I write event "{ hello: 'world' }" with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" and type "test"
    Then I can confirm that event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" exists
     And I can confirm that content of event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" is "{ hello: 'world' }"

  Scenario: Read/write event without data
    Given a demo database
      And default namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I write event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" and type "test"
    Then I can confirm that event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" exists
     And I can confirm that content of event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" is "{}"

  Scenario: Search for events in the same stream
    Given a demo namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I write event "{ hello: '1' }" with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" and type "test"
     And I write event "{ hello: '2' }" with ID "624b14f9-f4d6-4d67-a4a7-bb8b8c99d290" and type "test"
     And I write event "{ hello: '3' }" with ID "04b0825b-92d5-45f9-a858-4f00254f7751" and type "test"
     And I search for events matching type "test"
    Then I expect to get 3 search results
     And I expect search result 1 to be event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"
     And I expect search result 2 to be event with ID "624b14f9-f4d6-4d67-a4a7-bb8b8c99d290"
     And I expect search result 3 to be event with ID "04b0825b-92d5-45f9-a858-4f00254f7751"

  Scenario: Search for events of various types
    Given a demo namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I write event "{ hello: '1' }" with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" and type "test1"
     And I write event "{ hello: '2' }" with ID "624b14f9-f4d6-4d67-a4a7-bb8b8c99d290" and type "test2"
     And I write event "{ hello: '3' }" with ID "04b0825b-92d5-45f9-a858-4f00254f7751" and type "test3"
     And I write event "{ hello: '4' }" with ID "2df2bdcc-3829-44ff-b49f-3775fff69017" and type "test3"
     And I search for events matching type "test2" or type "test3" with a limit of 2
    Then I expect to get 2 search results
     And I expect search result 1 to be event with ID "624b14f9-f4d6-4d67-a4a7-bb8b8c99d290"
     And I expect search result 2 to be event with ID "04b0825b-92d5-45f9-a858-4f00254f7751"

  Scenario: Search for events after an event
    Given a demo namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I write event "{ hello: '1' }" with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" and type "test"
     And I write event "{ hello: '2' }" with ID "624b14f9-f4d6-4d67-a4a7-bb8b8c99d290" and type "test"
     And I write event "{ hello: '3' }" with ID "04b0825b-92d5-45f9-a858-4f00254f7751" and type "test"
     And I search for events after event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"
    Then I expect to get 2 search results
     And I expect search result 1 to be event with ID "624b14f9-f4d6-4d67-a4a7-bb8b8c99d290"
     And I expect search result 2 to be event with ID "04b0825b-92d5-45f9-a858-4f00254f7751"

  Scenario: Try to search for events after non-existent event
    Given a demo namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I try to search for events after event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"
    Then I get an event not found error

  Scenario: Search for events starting from an event
    Given a demo namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I write event "{ hello: '1' }" with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" and type "test"
     And I write event "{ hello: '2' }" with ID "624b14f9-f4d6-4d67-a4a7-bb8b8c99d290" and type "test"
     And I write event "{ hello: '3' }" with ID "04b0825b-92d5-45f9-a858-4f00254f7751" and type "test"
     And I search for events starting from event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"
    Then I expect to get 3 search results
     And I expect search result 1 to be event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"
     And I expect search result 2 to be event with ID "624b14f9-f4d6-4d67-a4a7-bb8b8c99d290"
     And I expect search result 3 to be event with ID "04b0825b-92d5-45f9-a858-4f00254f7751"

  Scenario: Try to search for events starting from non-existent event
    Given a demo namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I try to search for events starting from event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"
    Then I get an event not found error

  Scenario: Search for events until an event
    Given a demo namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I write event "{ hello: '1' }" with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" and type "test"
     And I write event "{ hello: '2' }" with ID "624b14f9-f4d6-4d67-a4a7-bb8b8c99d290" and type "test"
     And I write event "{ hello: '3' }" with ID "04b0825b-92d5-45f9-a858-4f00254f7751" and type "test"
     And I search for events until event with ID "04b0825b-92d5-45f9-a858-4f00254f7751"
    Then I expect to get 2 search results
     And I expect search result 1 to be event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"
     And I expect search result 2 to be event with ID "624b14f9-f4d6-4d67-a4a7-bb8b8c99d290"

  Scenario: Try to search for events until non-existent event
    Given a demo namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I try to search for events until event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"
    Then I get an event not found error

  Scenario: Search for events ending on an event
    Given a demo namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I write event "{ hello: '1' }" with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" and type "test"
     And I write event "{ hello: '2' }" with ID "624b14f9-f4d6-4d67-a4a7-bb8b8c99d290" and type "test"
     And I write event "{ hello: '3' }" with ID "04b0825b-92d5-45f9-a858-4f00254f7751" and type "test"
     And I search for events ending on event with ID "04b0825b-92d5-45f9-a858-4f00254f7751"
    Then I expect to get 3 search results
     And I expect search result 1 to be event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"
     And I expect search result 2 to be event with ID "624b14f9-f4d6-4d67-a4a7-bb8b8c99d290"
     And I expect search result 3 to be event with ID "04b0825b-92d5-45f9-a858-4f00254f7751"

  Scenario: Try to search for events ending on non-existent event
    Given a demo namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I try to search for events ending on event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"
    Then I get an event not found error

  Scenario: Search for events in the same namespace
    Given a demo namespace
    When I write event "{ hello: '1' }" with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" and type "test" to stream "ccda6642-8bd2-4af5-8142-416236adf044"
     And I write event "{ hello: '2' }" with ID "624b14f9-f4d6-4d67-a4a7-bb8b8c99d290" and type "test" to stream "2093e486-bf47-4c65-951f-40529f73e3c8"
     And I write event "{ hello: '3' }" with ID "04b0825b-92d5-45f9-a858-4f00254f7751" and type "test" to stream "cbfac1e1-0e70-411a-94a7-e1df0b430fe1"
     And I search for events matching type "test" in namespace "demo"
    Then I expect to get 3 search results
     And I expect search result 1 to be event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"
     And I expect search result 2 to be event with ID "624b14f9-f4d6-4d67-a4a7-bb8b8c99d290"
     And I expect search result 3 to be event with ID "04b0825b-92d5-45f9-a858-4f00254f7751"

  Scenario: Search for events in the same database
    Given a demo database
    When I write event "{ hello: '1' }" with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" and type "test" to stream "ccda6642-8bd2-4af5-8142-416236adf044" in namespace "ns1"
     And I write event "{ hello: '2' }" with ID "624b14f9-f4d6-4d67-a4a7-bb8b8c99d290" and type "test" to stream "2093e486-bf47-4c65-951f-40529f73e3c8" in namespace "ns2"
     And I write event "{ hello: '3' }" with ID "04b0825b-92d5-45f9-a858-4f00254f7751" and type "test" to stream "cbfac1e1-0e70-411a-94a7-e1df0b430fe1" in namespace "ns3"
     And I search for events matching type "test" in database "demo"
    Then I expect to get 3 search results
     And I expect search result 1 to be event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"
     And I expect search result 2 to be event with ID "624b14f9-f4d6-4d67-a4a7-bb8b8c99d290"
     And I expect search result 3 to be event with ID "04b0825b-92d5-45f9-a858-4f00254f7751"

  Scenario: Subscribe to real-time events
    Given a demo database
    When I subscribe to 3 events matching type "test" in database "demo"
     And I write event "{ hello: '1' }" with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" and type "test" to stream "ccda6642-8bd2-4af5-8142-416236adf044" in namespace "ns1"
     And I write event "{ hello: '2' }" with ID "624b14f9-f4d6-4d67-a4a7-bb8b8c99d290" and type "test" to stream "2093e486-bf47-4c65-951f-40529f73e3c8" in namespace "ns2"
     And I write event "{ hello: '3' }" with ID "04b0825b-92d5-45f9-a858-4f00254f7751" and type "test" to stream "cbfac1e1-0e70-411a-94a7-e1df0b430fe1" in namespace "ns3"
    Then I expect to get 3 search results
     And I expect search result 1 to be event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"
     And I expect search result 2 to be event with ID "624b14f9-f4d6-4d67-a4a7-bb8b8c99d290"
     And I expect search result 3 to be event with ID "04b0825b-92d5-45f9-a858-4f00254f7751"

  Scenario: Try to write duplicate event
    Given a demo database
      And default namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I write event "{ hello: 'world' }" with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" and type "test"
     And I try to write event "{ hello: 'again' }" with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" and type "test2"
    Then I get a duplicate event error

  Scenario: Try to read non-existent event
    Given a demo database
      And default namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I try to read content of event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"
    Then I get an event not found error

  Scenario: Destroy event
    Given a demo database
      And default namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I write event "{ hello: 'world' }" with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" and type "test"
     And I destroy event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"
    Then I can't find event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"

  Scenario: Try to destroy non-existent event in an unknown namespace
    Given a demo database
      And default namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I try to destroy event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"
    Then I get an event not found error

  Scenario: Try to destroy non-existent event
    Given a demo namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I try to destroy event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"
    Then I get an event not found error

  Scenario: Destroy all events in a namespace
    Given a demo namespace
      And stream with ID "ac9a0d2c-619f-47f8-8510-52429f4f0680"
    When I write event "{ hello: 'world' }" with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27" and type "test"
     And I truncate namespace "demo"
    Then I can't find event with ID "26d4211d-1df4-468f-af24-96cc9e9a2e27"
