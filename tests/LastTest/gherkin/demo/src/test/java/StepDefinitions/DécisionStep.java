package StepDefinitions;

import org.junit.jupiter.api.Assertions;

import com.aventstack.extentreports.Status;

import base.TestBase;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import pages.DécisionPage;

public class DécisionStep {

    private DécisionPage décisionPage;

    public DécisionStep() {
        // Initialisation avec le WebDriver géré par TestBase
        décisionPage = new DécisionPage(TestBase.getDriver());
    }
      @When("the user clicks on the historique button")
    public void userClicksOnhistoriqueButton() {
        try {
            décisionPage.submitHistorique();
            Hooks._scenario.log(Status.PASS, "Clicked on the historique button");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL, "Failed to click on the historique button");

            throw e;
        }
    }

    @When("the user clicks on the décision button")
    public void userClicksOnDecisionButton() {
        try {
            décisionPage.submitDecision();
            Hooks._scenario.log(Status.PASS, "Clicked on the décision button");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL, "Failed to click on the décision button");

            throw e;
        }
    }

    @When("the user enters a objet176 as {string}")
    public void userEntersObjet176(String objet176) {
        try {
            décisionPage.enterObjet176(objet176);
            Hooks._scenario.log(Status.PASS, "Entered objet176: " + objet176);
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL, "Failed to enter objet176");

            throw e;
        }
    }

    @When("the user enters a trh176 as {string}")
    public void userEntersTrh176(String trh176) {
        try {
            décisionPage.entertrh176(trh176);
            Hooks._scenario.log(Status.PASS, "Entered trh176: " + trh176);
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL, "Failed to enter trh176");

            throw e;
        }
    }

    @When("the user enters a tav176 as {string}")
    public void userEntersTav176(String tav176) {
        try {
            décisionPage.tav176(tav176);
            Hooks._scenario.log(Status.PASS, "Entered tav176: " + tav176);
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL, "Failed to enter tav176");
            throw e;
        }
    }

    @When("the user clicks on the generate button")
    public void userClicksOnGenerateButton() {
        try {
            décisionPage.submitgenerate();
            Hooks._scenario.log(Status.PASS, "Clicked on the generate button");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL, "Failed to click on the generate button");
            throw e;
        }
    }

    @When("the user clicks on the save button")
    public void userClicksOnSaveButton() {
        try {
            décisionPage.submitsave();
            Hooks._scenario.log(Status.PASS, "Clicked on the save button");
        } catch (Exception e) {
            Hooks._scenario.log(Status.FAIL, "Failed to click on the save button");
            throw e;
        }
    }

    @Then("the user should see a successful décision message")
    public void userSeesSuccessfulDecisionMessage() {
        try {
            String successMessage = décisionPage.getSuccessMessage();
            Assertions.assertTrue(
                successMessage.toLowerCase().contains("décision") || successMessage.toLowerCase().contains("succès"),
                "Expected décision success message not found"
            );
            Hooks._scenario.log(Status.PASS, "The user should see a successful décision message: " + successMessage);
        } catch (Throwable t) {
            Hooks._scenario.log(Status.FAIL, "The user should see a successful décision message");
            Hooks._scenario.log(Status.FAIL, t.getMessage());
            throw t; // Marque le scénario comme échoué
        }
    }
}
