@LogoutSuccess
Feature: User Logout

    Background:
        Given the user is on the login page
        When the user enters a email as "medkechiche99@gmail.com"
        And the user enters a password as "123456789"
        And clicks on the login button
        Then the user should see a successful login message

    @logout
    Scenario: Successful Logout
        When the user clicks on the logout button
        Then the user should see a successful logout message
