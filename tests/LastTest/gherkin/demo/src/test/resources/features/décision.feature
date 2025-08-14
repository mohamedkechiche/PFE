@DécisionSuccess
Feature: User Décision

    Background:
        Given the user is on the login page
        When the user enters a email as "medkechiche99@gmail.com"
        And the user enters a password as "123456789"
        And clicks on the login button
        Then the user should see a successful login message

    @Décision
    Scenario: Successful Décision
        When the user clicks on the historique button
        And the user clicks on the décision button
        And the user enters a objet176 as "<objet176>"
        And the user enters a trh176 as "<trh176>"
        And the user enters a tav176 as "<tav176>"
        And the user  clicks on the generate  button
        And the user  clicks on the save button
        Then the user should see a successful décision message
        Examples:
          | objet176 | trh176 |tav176 |
          | meddddddddddd | aliiiiiiiiiiiiii |azertttttttii|
