Feature: Manage connections
  It should be possible to make various kinds of database connections.

  Scenario: SQLite3 in-memory
    Given a disconnected store
    When I try to connect to "sqlite3:memory"
    Then the client used is "sqlite3", database is "memory", and file name is ":memory:"

  Scenario: SQLite3 in current folder
    Given a disconnected store
    When I try to connect to "sqlite3:mydb.sqlite3"
    Then the client used is "sqlite3", database is "mydb.sqlite3", and file name is "mydb.sqlite3"

  Scenario: SQLite3 in relative folder
    Given a disconnected store
    When I try to connect to "sqlite3:../myfolder/mydb.sqlite3"
    Then the client used is "sqlite3", database is "mydb.sqlite3", and file name is "../myfolder/mydb.sqlite3"

  Scenario: SQLite3 in absolute folder
    Given a disconnected store
    When I try to connect to "sqlite3:/myfolder/mydb.sqlite3"
    Then the client used is "sqlite3", database is "mydb.sqlite3", and file name is "/myfolder/mydb.sqlite3"

  Scenario: MySQL
    Given a disconnected store
    When I try to connect to "mysql://user:pass@localhost:3306/mydb"
    Then the client used is "mysql" and database is "mydb"
