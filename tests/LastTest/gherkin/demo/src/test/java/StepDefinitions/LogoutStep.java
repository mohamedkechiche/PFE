package StepDefinitions;

import org.junit.jupiter.api.Assertions;

import com.aventstack.extentreports.Status;

import base.TestBase;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import pages.LogoutPage;

public class LogoutStep {
    private LogoutPage logoutPage;

    public LogoutStep() {
        // Initialize logoutPage with the WebDriver managed by TestBase
        logoutPage = new LogoutPage(TestBase.getDriver());
    }

    @When("the user clicks on the logout button")
    public void userClicksLoginButton() {
        try {
            logoutPage.submitLogout();
            Hooks._scenario.log(Status.PASS, "Clicks on the logout button");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL, "Failed to click on the logout button");
            Hooks._scenario.log(Status.FAIL, e.getMessage());
        }
    }

    @Then("the user should see a successful logout message")
    public void userSeesSuccessfulLoginMessage() {
        try {
            String successMessage = logoutPage.getSuccessMessage();
            Assertions.assertTrue(
                successMessage.toLowerCase().contains("logout") || successMessage.toLowerCase().contains("success"),
                "Expected logout success message not found"
            );
            Hooks._scenario.log(Status.PASS, "The user should see a successful logout message: " + successMessage);
        } catch (Throwable t) {
            Hooks._scenario.log(Status.FAIL, "The user should see a successful logout message");
            Hooks._scenario.log(Status.FAIL, t.getMessage());
            throw t; // Re-throw to mark the scenario as failed
        }
    }
}
