package StepDefinitions;

import base.TestBase;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import org.junit.jupiter.api.Assertions;
import pages.loginPage;
import com.aventstack.extentreports.Status;

public class LoginStep {

    private loginPage loginPage;

    public LoginStep() {
        this.loginPage = new loginPage(TestBase.getDriver());
    }

    @Given("the user is on the login page")
    public void userIsOnLoginPage() {
        try {
            loginPage.openLoginPage();
            Hooks._scenario.log(Status.PASS, "the user is on the login page");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL, "Could not open login page: " + e.getMessage());
            throw e;
        }
    }

    @When("the user enters a email as {string}")
    public void userEntersEmail(String email) {
        try {
            loginPage.enterEmail(email);
            Hooks._scenario.log(Status.PASS, "the user enters an email");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL, "Could not enter email: " + e.getMessage());
            throw e;
        }
    }

    @When("the user enters a password as {string}")
    public void userEntersPassword(String password) {
        try {
            loginPage.enterPassword(password);
            Hooks._scenario.log(Status.PASS, "the user enters a password");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL, "Could not enter password: " + e.getMessage());
            throw e;
        }
    }

    @When("clicks on the login button")
    public void userClicksLoginButton() {
        try {
            loginPage.submitLogin();
            Hooks._scenario.log(Status.PASS, "clicks on the login button");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL, "Could not click login button: " + e.getMessage());
            throw e;
        }
    }

    @Then("the user should see a successful login message")
    public void userSeesSuccessfulLoginMessage() {
        try {
            // Attendre la redirection vers le dashboard
            loginPage.getSuccessMessage(); // attend l'URL dashboard
            String currentUrl = TestBase.getDriver().getCurrentUrl();
            Assertions.assertTrue(
                currentUrl.endsWith("/dashboard"),
                "Expected to be redirected to dashboard, but was: " + currentUrl
            );
            Hooks._scenario.log(Status.PASS, "Redirection vers le dashboard détectée : " + currentUrl);
        } catch (Throwable t) {
            Hooks._scenario.log(Status.FAIL, "Redirection vers le dashboard non détectée");
            Hooks._scenario.log(Status.FAIL, t.getMessage());
            throw t;
        }
    }

    @Then("the user should see a login failure message")
    public void userSeesLoginFailureMessage() {
        try {
            String failureMessage = loginPage.getErrorMessage();
            Assertions.assertTrue(
                failureMessage != null && !failureMessage.isEmpty(),
                "Expected failure message not found"
            );
            Hooks._scenario.log(Status.PASS, "The user should see a login failure message: " + failureMessage);
        } catch (Throwable t) {
            Hooks._scenario.log(Status.FAIL, "The user should see a login failure message");
            Hooks._scenario.log(Status.FAIL, t.getMessage());
            throw t;
        }
    }
}
