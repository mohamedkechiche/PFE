@LoginSuccess
Feature: User Login

  @ValidCredentials
  Scenario Outline: Successful login
    Given the user is on the login page
    When the user enters a email as "<email>"
    And the user enters a password as "<password>"
    And clicks on the login button
    Then the user should see a successful login message


    Examples:
      | email  | password               |
      | medkechiche99@gmail.com  | 123456789 |

  @InvalidCredentials
  Scenario Outline: Failed login
    Given the user is on the login page
    When the user enters a email as "<email>"
    And the user enters a password as "<password>"
    And clicks on the login button
    Then the user should see a login failure message

    Examples:
      | email  | password              |
      | medkechiche@gmail.com | 123456 |

